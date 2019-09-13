"use strict";

const { Model } = require("objection");

class Project extends Model {
  static get tableName() {
    return "projects";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const Task = require("../tasks/Task");
    const Resource = require("../resources/Resource");
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: "projects.id",
          to: "tasks.projectId"
        }
      },

      resources: {
        relation: Model.ManyToManyRelation,
        modelClass: Resource,
        join: {
          from: "projects.id",
          through: {
            from: "projects_resources.projectId",
            to: "projects_resources.resourceId"
          },
          to: "resources.id"
        }
      },

      children: {
        relation: Model.HasManyRelation,
        modelClass: Project,
        join: {
          from: "projects.id",
          to: "projects.parentId"
        }
      },

      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: "projects.parentId",
          to: "projects.id"
        }
      }
    };
  }
}

module.exports = Project;
