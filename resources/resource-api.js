///AKA API.JS

"use strict";

const { transaction } = require("objection");
const Project = require("../projects/Project");
const Resource = require("./Resource");

module.exports = router => {
  //get all resources
  router.get("/resources", async (req, res) => {
    const resources = await Resource.query()
      .skipUndefined()
      .orderBy("name");

    res.send(resources);
  });

  //get resource by id
  router.get("/resources/:id", async (req, res) => {
    const resource = await Resource.query().findById(req.params.id);

    res.send(resource);
  });

  //add a new resource
  router.post("/resources", async (req, res) => {
    const graph = req.body;
    const insertedGraph = await transaction(Resource.knex(), trx => {
      return Resource.query(trx)
        .allowInsert("[tasks, children.[tasks, resources], resources, parent]")
        .insertGraph(graph);
    });
    res.send(insertedGraph);
  });

  //update a resource
  router.patch("/resources/:id", async (req, res) => {
    const resource = await Resource.query().patchAndFetchById(
      req.params.id,
      req.body
    );
    res.send(resource);
  });

  //delete a resource
  router.delete("/resources/:id", async (req, res) => {
    const resource = await Resource.query().findById(req.params.id);
    const deleted = await Resource.query().deleteById(req.params.id);

    res.send(resource);
  });
};

function createStatusCodeError(statusCode) {
  return Object.assign(new Error(), {
    statusCode
  });
}
