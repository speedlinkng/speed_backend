// const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const shortid = require("shortid");
const date = require('date-and-time');

module.exports = {

    storeToken: (tokens,email, storageEmail, user_id, role, allReplies, callback)=>{
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
        let status;

        pgpool.query(
            `insert into user_google(refresh_token, access_token, expiry_date, id_token, token_type, scope, email, storage_email, user_id, role, expire_next, all_replies) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
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
                role,
                oneMoreDay,
                allReplies

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

    getGoogleData: (access,preferred, callback) =>{
        // if preferred is 1 = get users drive data
        // if preferred is 0 get default drive
        if(preferred == 1){
            pgpool.query(
                `select * from user_google where user_id= $1`,
                [
                    access.user_id 
                ],
    
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
                    console.log('user google selected')
                    return callback(null, res.rows)
                }
    
            )
        }else{
            pgpool.query(
                `select * from user_google where role = $1`,
                [
                    'default'
                ],
    
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
                    console.log(res.rows)
                    return callback(null, res.rows)
                }
    
            )
        }
        
    },

    oath2fromForm: (record_id, callback) =>{
   
        pgpool.query(
            `select * from form_records where record_id = $1 `,
            [
                record_id,   
            ],

            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                console.log(res.rows)
                return callback(null, res.rows)
            }

        )
    },



    myStorage: (user_id, callback) =>{
        pgpool.query(
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
        pgpool.query(
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
        pgpool.query(
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

    updateUserZoom: (credentials, access, createdFolder, preferred, callback) => {
        pgpool.query(
            `update user_zoom set drive_credentials=$1, drive_folder=$2, drive_type=$3 WHERE user_id=$4`,
            [
                credentials,
                createdFolder,
                preferred,
                access.user_id,
                
            ],
            (err, res, fields) =>{

                if(err){
                    return callback(err);
                }
              
              
                return callback(null, res.rows)
            }

        )
    },

    updateToken: async (tokens, email, storage, role, allReplies, callback) =>{
        if(role == 'default'){
           let out =  await removeDefault()
            updateAll()
        }else{
             updateAll()
        }
    
        async function updateAll(){
            pgpool.query(
                `update user_google set refresh_token=$1, access_token=$2, storage_email=$3, expiry_date=$4, role = $5, all_replies = $6 WHERE email=$7`,
                [
                    tokens.refresh_token,
                    tokens.access_token,
                    storage,
                    tokens.expiry_date,
                    role,
                    allReplies,
                    email
                ],
                (err, res, fields) =>{
                    // console.log(res)
                    // console.log('++++++=')
                    if(err){
                        return callback(err);
                    }
                  
                  
                    return callback(null, res.rows)
                }

            )
        }
        async function removeDefault(){
            console.log('remove default')
            pgpool.query(
                `update user_google set role = $1`,
                [
                    'user'
                ],
                (err, res, fields) =>{
                    console.log(res)
                    if(err){
                        return 'error'
                    }
                    return 'success'
                }
    
            )
        }
      
    },
}