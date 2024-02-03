// const pool = require('../models/DB');
const pool = require('../models/PGDB');
const shortid = require("shortid");
const date = require('date-and-time');

module.exports = {

    storeToken: (tokens,email, storageEmail, user_id, callback)=>{
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 

        pool.query(
            `insert into user_google(refresh_token, access_token, expiry_date, id_token, token_type, scope, email, storage_email, user_id, role, expire_next) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
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
                `update registeration set goog_refresh_token=$1 where user_id=$2`,
                    [
                        tokens.refresh_token,
                        user_id
                    ],
                )
                return callback(null, res.rows)
            },
        )
    },

    getGoogleData: (access, callback) =>{
  

        pool.query(
            `select * from user_google where user_id= $1`,
            [
                access.user_id 
            ],

            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
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
                return callback(null, res.rows)
            }

        )
    },

    myStorage: (user_id, callback) =>{
        pool.query(
            `select * from user_google where user_id=$1`,
            [
                user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

    newStorage: (user_id, callback) =>{
        pool.query(
            `select * from user_google where user_id=$1`,
            [
                user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

    ifexist: (email, callback) =>{
        pool.query(
            `select * from user_google where email=$1`,
            [
                email
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

    updateToken: (tokens, email, storage, callback) =>{
        console.log('storage: '+storage)
        pool.query(
            `update user_google set refresh_token=$1, access_token=$2, storage_email=$3, expiry_date=$4 where email=$5`,
            [
                tokens.refresh_token,
                tokens.access_token,
                storage,
                tokens.expiry_date,
                email
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