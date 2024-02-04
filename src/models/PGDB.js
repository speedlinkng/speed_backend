const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'speedtest-db-instance.crys3lq4abpt.eu-north-1.rds.amazonaws.com',
  database: 'speedtest-db-instance',
  password: 'speedlinkbendan',
  port: 5432,
});

module.exports = pool;
