const pool = require('../models/DB');
const crypto = require("crypto")
const { customAlphabet } = require('../../generateId');


module.exports = {
    register: (data, callback)=>{
        // Create a custom ID generator function with your preferred characters
        const generateUniqueId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);

        // Generate a 10-character unique ID
        const uniqueId = generateUniqueId();

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