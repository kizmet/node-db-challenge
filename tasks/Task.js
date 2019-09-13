"use strict";

const { Model } = require("objection");

class Task extends Model {
  static get tableName() {
    return "tasks";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const Project = require("../projects/Project");
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: "tasks.projectId",
          to: "projects.id"
        }
      }
    };
  }
}

module.exports = Task;
