exports.up = knex => {
	return knex.schema.createTable("projects", table => {
		table.increments("id").primary();
		table
			.integer("parentId")
			.unsigned()
			.references("id")
			.inTable("projects")
			.onDelete("SET NULL")
			.index();
		table.string("name").notNullable();
		table.string("description").notNullable();
		table
			.boolean("completed")
			.defaultTo(false)
			.notNullable();
	});
};

exports.down = knex => {
	return knex.schema.dropTableIfExists("projects");
};
