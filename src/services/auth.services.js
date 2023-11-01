const pool = require('../models/DB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();

module.exports = {

    register: (data, callback)=>{

        console.log(data)
        pool.query(
            `insert into users(firstName, lastName, email, password, number, user_id) values(?,?,?,?,?,?)`,
            [
                data.first_name,
                data.last_name,
                data.email,
                data.password,
                data.number,
                uniqueId
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            },
        )
    },

    getUserByUserEmail: (email, callback) =>{
        pool.query(
            `select * from users where email = ?`,
            [
                email 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },


    getMe: (email, callback) =>{
        pool.query(
            `select * from users where email = ?`,
            [
                email 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },

}