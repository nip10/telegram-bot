exports.up = (knex, Promise) => knex.schema.createTableIfNotExists('weather', (table) => {
    table.increments('id');
    table.string('alias').notNullable();
    table.integer('lat').notNullable();
    table.integer('lng').notNullable();
    // table.enu('unit', ['c', 'f']).notNullable();
    table.integer('user_id').references('users.telegram_id');
    table.boolean('notifications').defaultTo(false);
    table.timestamp('notifications_time');
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').defaultTo(knex.raw('now()'));
});

exports.down = (knex, Promise) => knex.schema.dropTable('weather');
