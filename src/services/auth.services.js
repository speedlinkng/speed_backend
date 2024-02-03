// const pool = require('../models/DB');
const pool = require('../models/PGDB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();

module.exports = {

    register: (data, callback)=>{

        console.log(data)
        pool.query(
            `insert into users(firstName, lastName, email, password, number, user_id) values($1,$1,$1,$1,$1,$1)`,
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
                return callback(null, res.rows)
            },
        )
    },

    getUserByUserEmail: (email, callback) =>{
        pool.query(
            `select * from users where email = $1`,
            [
                email 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },


    getMe: (email, callback) =>{
        pool.query(
            `select * from users where email = $1`,
            [
                email 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },

    logout: (jti,tkn, callback) =>{
        pool.query(
            `insert into revoked_token(token, jti) values($1,$1)`,
            [    
                tkn,
                jti
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

    checkRevoke: (jti, callback) =>{
 
        pool.query(
            `select * from revoked_token where jti = $1`,
            [
                jti 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

}