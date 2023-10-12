const pool = require('../models/DB');
const shortid = require("shortid");
const date = require('date-and-time');

module.exports = {

    storeToken: (tokens,email, storageEmail, user_id, callback)=>{
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 

        pool.query(
            `insert into user_google(refresh_token, access_token, expiry_date, id_token, token_type, scope, email, storage_email, user_id, role, expire_next) values(?,?,?,?,?,?,?,?,?,?,?)`,
            [
                tokens.refresh_token,
                tokens.access_token,
                tokens.expiry_date,
                tokens.id_token,
                tokens.token_type,
                tokens.scope,
                email,
                storageEmail,
                user_id,
                'user',
                oneMoreDay,

            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                // Wednesday
                pool.query(
                `update registeration set goog_refresh_token=? where user_id=?`,
                    [
                        tokens.refresh_token,
                        user_id
                    ],
                )
                return callback(null, res)
            },
        )
    },

    getGoogleData: (access, callback) =>{
  

        pool.query(
            `select * from user_google where user_id= ?`,
            [
                access.user_id 
            ],

            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    defaultOauth2Data: callback =>{
        pool.query(
            `select * from user_google where role='default'`,

            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    myStorage: (user_id, callback) =>{
        pool.query(
            `select * from user_google where user_id=?`,
            [
                user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    newStorage: (user_id, callback) =>{
        pool.query(
            `select * from user_google where user_id=?`,
            [
                user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    ifexist: (email, callback) =>{
        pool.query(
            `select * from user_google where email=?`,
            [
                email
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    updateToken: (tokens, email, callback) =>{
        pool.query(
            `update user_google set refresh_token=?, access_token=?, expiry_date=? where email=?`,
            [
                tokens.refresh_token,
                tokens.access_token,
                tokens.expiry_date,
                email
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },
}