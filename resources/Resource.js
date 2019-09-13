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
      resProjects: {
        relation: Model.ManyToManyRelation,
        modelClass: Project,
        join: {
          from: "resources.id",
          through: {
            from: "projects_resources.resourceId",
            to: "projects_resources.projectId"
          },
          to: "projects.id"
        }
      }
    };
  }
}

module.exports = Resource;
