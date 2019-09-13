///AKA API.JS

"use strict";

const { transaction } = require("objection");
const Project = require("./projects/Project");
const Resource = require("./resources/Resource");

module.exports = router => {
  router.get("/projects", async (req, res) => {
    const projects = await Project.query()
      .skipUndefined()
      .allowEager(
        "[tasks, parent, children.[tasks, resources.actors], resources.actors.tasks]"
      )
      .eager(req.query.eager)
      .orderBy("name");

    res.send(projects);
  });

  router.get("/projects/:id", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    res.send(project);
  });

  router.post("/projects", async (req, res) => {
    const graph = req.body;
    const insertedGraph = await transaction(Project.knex(), trx => {
      return Project.query(trx)
        .allowInsert("[tasks, children.[tasks, resources], resources, parent]")
        .insertGraph(graph);
    });
    res.send(insertedGraph);
  });

  router.patch("/projects/:id", async (req, res) => {
    const project = await Project.query().patchAndFetchById(
      req.params.id,
      req.body
    );
    res.send(project);
  });

  router.delete("/projects/:id", async (req, res) => {
    await Project.query().deleteById(req.params.id);

    res.send({});
  });

  router.post("/projects/:id/children", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    if (!project) {
      throw createStatusCodeError(404);
    }

    const child = await project.$relatedQuery("children").insert(req.body);

    res.send(child);
  });

  // Add a task for a Project.
  router.post("/projects/:id/tasks", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    if (!project) {
      throw createStatusCodeError(404);
    }

    const pet = await project.$relatedQuery("tasks").insert(req.body);

    res.send(pet);
  });

  // Get a Project's tasks. The result can be filtered using query parameters
  // `name` and `species`.
  router.get("/projects/:id/tasks", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    if (!project) {
      throw createStatusCodeError(404);
    }

    // We don't need to check for the existence of the query parameters because
    // we call the `skipUndefined` method. It causes the query builder methods
    // to do nothing if one of the values is undefined.
    const tasks = await project
      .$relatedQuery("tasks")
      .skipUndefined()
      .where("name", "like", req.query.name)
      .where("species", req.query.species);

    res.send(tasks);
  });

  // Add a movie for a Project.
  router.post("/projects/:id/resources", async (req, res) => {
    // Inserting a movie for a project creates two queries: the movie insert query
    // and the join table row insert query. It is wise to use a transaction here.
    const movie = await transaction(Project.knex(), async trx => {
      const project = await Project.query(trx).findById(req.params.id);

      if (!project) {
        throw createStatusCodeError(404);
      }

      return await project.$relatedQuery("resources", trx).insert(req.body);
    });

    res.send(movie);
  });

  // Add existing Project as an actor to a movie.
  router.post("/resources/:id/actors", async (req, res) => {
    const movie = await Resource.query().findById(req.params.id);

    if (!movie) {
      throw createStatusCodeError(404);
    }

    await movie.$relatedQuery("actors").relate(req.body.id);

    res.send(req.body);
  });

  // Get Resource's actors.
  router.get("/resources/:id/actors", async (req, res) => {
    const movie = await Resource.query().findById(req.params.id);

    if (!movie) {
      throw createStatusCodeError(404);
    }

    const actors = await movie.$relatedQuery("actors");
    res.send(actors);
  });

  // Patch a project and upsert its relations.
  router.patch("/projects/:id/upsert", async (req, res) => {
    const graph = req.body;

    // Make sure only one project was sent.
    if (Array.isArray(graph)) {
      throw createStatusCodeError(400);
    }

    // Make sure the project has the correct id because `upsertGraph` uses the id fields
    // to determine which models need to be updated and which inserted.
    graph.id = parseInt(req.params.id, 10);

    // It's a good idea to wrap `upsertGraph` call in a transaction since it
    // may create multiple queries.
    const upsertedGraph = await transaction(Project.knex(), trx => {
      return (
        Project.query(trx)
          // For security reasons, limit the relations that can be upserted.
          .allowUpsert(
            "[tasks, children.[tasks, resources], resources, parent]"
          )
          .upsertGraph(graph)
      );
    });

    res.send(upsertedGraph);
  });
};

function createStatusCodeError(statusCode) {
  return Object.assign(new Error(), {
    statusCode
  });
}
