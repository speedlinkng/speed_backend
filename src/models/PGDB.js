const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'speedlink',
  password: '123456',
  port: 5432,
});

module.exports = pool;
