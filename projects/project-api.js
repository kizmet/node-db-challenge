"use strict";

const { transaction } = require("objection");
const Project = require("./Project");
const Resource = require("../resources/Resource");

module.exports = router => {
  //get all projects
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

  //get project by id
  router.get("/projects/:id", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    res.send(project);
  });

  //add a new project
  router.post("/projects", async (req, res) => {
    const graph = req.body;
    const insertedGraph = await transaction(Project.knex(), trx => {
      return Project.query(trx)
        .allowInsert("[tasks, children.[tasks, resources], resources, parent]")
        .insertGraph(graph);
    });
    res.send(insertedGraph);
  });

  //update a project
  router.patch("/projects/:id", async (req, res) => {
    const project = await Project.query().patchAndFetchById(
      req.params.id,
      req.body
    );
    res.send(project);
  });

  //delete a project
  router.delete("/projects/:id", async (req, res) => {
    const project = await Project.query().findById(req.params.id);
    const deleted = await Project.query().deleteById(req.params.id);

    res.send(project);
  });

  //   router.post("/projects/:id/children", async (req, res) => {
  //     const project = await Project.query().findById(req.params.id);
  //
  //     if (!project) {
  //       throw createStatusCodeError(404);
  //     }
  //
  //     const child = await project.$relatedQuery("children").insert(req.body);
  //
  //     res.send(child);
  //   });

  // Add a task for a Project.
  router.post("/projects/:id/tasks", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    if (!project) {
      throw createStatusCodeError(404);
    }

    const pet = await project.$relatedQuery("tasks").insert(req.body);

    res.send(pet);
  });

  //get project's tasks
  router.get("/projects/:id/tasks", async (req, res) => {
    const project = await Project.query().findById(req.params.id);

    if (!project) {
      throw createStatusCodeError(404);
    }

    const tasks = await project
      .$relatedQuery("tasks")
      .skipUndefined()
      .where("projectId", req.query.id);

    res.send(tasks);
  });

  router.post("/projects/:id/resources", async (req, res) => {
    const movie = await transaction(Project.knex(), async trx => {
      const project = await Project.query(trx).findById(req.params.id);

      if (!project) {
        throw createStatusCodeError(404);
      }

      return await project.$relatedQuery("resources", trx).insert(req.body);
    });

    res.send(movie);
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
