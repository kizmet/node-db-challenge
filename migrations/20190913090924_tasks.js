exports.up = knex => {
	return knex.schema.createTable("tasks", table => {
		table.increments("id").primary();
		table
			.integer("projectId")
			.unsigned()
			.notNullable()
			.references("id")
			.inTable("projects")
			.onUpdate("CASCADE")
			.onDelete("CASCADE");
		table.string("description").notNullable();
		table.string("notes").notNullable();
		table
			.boolean("completed")
			.defaultTo(false)
			.notNullable();
	});
};

exports.down = knex => {
	return knex.schema.dropTableIfExists("tasks");
};
