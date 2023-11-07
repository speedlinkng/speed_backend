const {createPool} = require('mysql');
const dotenv = require('dotenv')
dotenv.config();

const pool = createPool({
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    user : process.env.DB_USERNAME,
    password : '',
    database : process.env.DB_DATABASE,
    connectonLimit : 10
});

module.exports = pool;