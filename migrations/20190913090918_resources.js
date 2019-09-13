exports.up = knex => {
	return knex.schema
		.createTable("resources", table => {
			table.increments("id").primary();
			table
				.string("name")
				.notNullable()
				.unique();
			table.string("description");
		})
		.createTable("projects_resources", table => {
			table.increments("id").primary();
			table
				.integer("projectId")
				.unsigned()
				.references("id")
				.inTable("projects")
				.onUpdate("CASCADE")
				.onDelete("CASCADE")
				.index();
			table
				.integer("resourceId")
				.unsigned()
				.references("id")
				.inTable("resources")
				.onUpdate("CASCADE")
				.onDelete("CASCADE")
				.index();
		});
};

exports.down = knex => {
	return knex.schema
		.dropTableIfExists("projects_resources")
		.dropTableIfExists("resources");
};
