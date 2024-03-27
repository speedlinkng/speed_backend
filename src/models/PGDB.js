const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'speedlink',
  password: '123456',
  port: 5432,
});

// Connect to Render
// const pool = new Pool({
//   user: process.env.DB_USERNAME,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: 5432,
// });


// const pool = new Pool({
//   user: 'postgres',
//   host: 'speedtest-db-instance.crys3lq4abpt.eu-north-1.rds.amazonaws.com',
//   database: 'speed_test',
//   password: 'speedlinkbendan',
//   port: 5432,
// });
module.exports = pool;
