//Movie.js
"use strict";

const { Model } = require("objection");

class Resource extends Model {
  static get tableName() {
    return "resources";
  }

  static get relationMappings() {
    const Project = require("../projects/Project");
    return {
      actors: {
        relation: Model.ManyToManyRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one. We use the file path version
        // here to prevent require loops.
        modelClass: Project,
        join: {
          from: "resources.id",
          // ManyToMany relation needs the `through` object to describe the join table.
          through: {
            from: "projects_resources.resourceId",
            to: "projects_resources.projectId"
          },
          to: "resources.id"
        }
      }
    };
  }
}

module.exports = Resource;
