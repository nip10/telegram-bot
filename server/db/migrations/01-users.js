exports.up = (knex, Promise) => knex.schema.createTableIfNotExists('users', (table) => {
    table.increments('id');
    table.integer('telegram_id').unique().notNullable();
    table.string('firstname').notNullable();
    table.string('lastname');
    table.string('email').unique();
    table.boolean('admin').notNullable().defaultTo(false);
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').defaultTo(knex.raw('now()'));
});

exports.down = (knex, Promise) => knex.schema.dropTable('users');
