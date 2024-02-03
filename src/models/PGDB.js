const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'root',
  host: 'dpg-cmv9lsgcmk4c73agjpbg-a',
  database: 'speed_db',
  password: 'qC4mpRC438WE5rGgQVUZvM7KzsUr3KTw',
  port: 5432,
});

module.exports = pool;
