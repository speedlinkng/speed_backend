const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const date = require('date-and-time');

module.exports = {

    getRefreshAndExchangeForAccess:(record_id, callback)=>{

        pgpool.query(
            `select * from form_records where record_id = $1`,
            [
                record_id 
            ],
           
            (err, res, fields) =>{
                console.log(res.rows)
                if(err){
                    return callback(err);
                }
            
                else if(res.rows.length > 0){
                    let useroogle = getUserGoogle(res.rows[0].storage_email, res.rows[0].user_id, res.rows[0].preferred_drive)
            
                }  
            }
        )

        function getUserGoogle(storage_email, user_id, preferred){
            if(preferred == 0){
                // 'speedlink Access'
                console.log('speed instead.....')
          

                pgpool.query(
                    `SELECT * FROM user_google WHERE role = $1 LIMIT 1`,
                    [
                        'default' 
                    ],
                    (err, res, fields) =>{
                        // console.log(res)
                        if(err){
                            return callback(err);
                        }
                        return callback(null, res.rows)
                    }
        
                )
            }
            if(preferred == 1){
                // 'my Access'
                console.log('using preferred')
        
                pgpool.query(
                    `SELECT * FROM user_google WHERE user_id = $1 AND storage_email = $2 LIMIT 1`,
                    [
                        user_id ,
                        storage_email
                    ],
                    (err, res, fields) =>{
                        if(err){
                            return callback(err);
                        }
                        return callback(null, res.rows)
                    }
        
                )
            }
            // pgpool.query(
            //     `SELECT * FROM user_google WHERE user_id = $1 ORDER BY date_created DESC LIMIT 1`,            [
            //         user_id 
            //     ],
            //     (err, res, fields) =>{
            //         if(err){
            //             return callback(err);
            //         }
            //         return callback(null, res.rows)
            //     }

            // )
        }
    },



    updateRecord: (r_id, jsonData, expiry_time, callback) => {
        console.log('THIS IS A JSON DATA£££££££££££££')
        console.log(jsonData)
        console.log('RECORD ID EXPECTED TO UPDATE IS : ',(jsonData.otherData.page_url).replace(/\s+/g, ''))
        console.log('OLD IS  : ',r_id)
        pgpool.query(
            'update form_records set record_data=$1, expiry_date=$2, record_id=$3  WHERE record_id = $4 ',            
            [
                jsonData,
                expiry_time,
                (jsonData.otherData.page_url).replace(/\s+/g, ''),
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }
        )
    },

    getRefreshTokenGoogle: (user_id, body, callback) => {
        console.log(body.preferred)
        if(body.preferred == 0){
            // 'speedlink Access'
            pgpool.query(
                'SELECT * FROM user_google WHERE role = $1 ORDER BY date_created DESC LIMIT 1',
                [
                    'default' 
                ],
                (err, res, fields) =>{
                    console.log(res)
                    if(err){
                        return callback(err);
                    }
                    return callback(null, res.rows)
                }
            )
        }
        if(body.preferred == 1){
            // 'my Access'
            pgpool.query(
                'SELECT * FROM user_google WHERE user_id = $1 ORDER BY date_created DESC LIMIT 1',
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
        }
    },


    getDefaultFolder:(callback)=>{
        // get default from either admin with role = default OR
        // get default from user with role 0
        pgpool.query(
            'SELECT all_replies FROM user_google WHERE role = $1 LIMIT 1',         
            [
                'default' 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
            
                return callback(null, res.rows)
            }
        )
    },

    


    updatexpired: (id, callback) => {
        console.log('update')
        pgpool.query(
            'update form_records set status=$1 WHERE id = $2 ',            
            [
                'expired',
                id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                // return callback(null, res)
            }
        )
       
    },

    createRecord: (data,expiry_date,folder_id, ADDFTFR, record_id, user_id, userGoogleRow_id, callback)=>{
        if(data.file_type == 'custom_exe'){
           let custom_type = data.custom_type 
        }else{
            let custom_type = null 
        }
        console.log('mistaken folderid '+ folder_id)
        let bt = data.b_token;
        let expiry_time = ''
        const jsonData =  data;
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
        if (expiry_date == null) { 
            expiry_time = oneMoreDay
        } else {
            expiry_time = expiry_date
        }
        pgpool.query(
            `insert into form_records(user_id,
                status, 
                preferred_drive, 
                record_id, 
                google_refresh_token,
                google_access,
                google_expiry_date,
                google_id_token,
                google_token_type,
                google_scope,
                storage_email, 
                expiry_date, 
                record_data, 
                folder_id, 
                user_google_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12, $13, $14,$15)`,
            [
                user_id,
                'active',
                data.preferred,
                (data.otherData.page_url).replace(/\s+/g, ''), 
                ADDFTFR.refresh_token,
                ADDFTFR.access_token,
                ADDFTFR.expiry_date,
                ADDFTFR.id_token,
                ADDFTFR.token_type,
                ADDFTFR.scope,
                ADDFTFR.storage_email,
                expiry_time,
                jsonData,
                folder_id,
                userGoogleRow_id
               
            ],
            (err, res, fields) =>{
                
                if(err){
                    return callback(err);
                }
                // insertSetings()
                return callback(null, res)
                
           
            },
        )

        function insertSetings(){
            pgpool.query(
                `insert into settings(user_id, record_id, ask_name, send_notification, quantity, file_type, custom_type, upload_size) values($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                    user_id,
                    record_id,
                    data.askForName,
                    data.sendNotification,
                    data.quantity,
                    data.file_type,
                    data.custom_type,
                    data.uploadSize
                    //data.user_id
                   
                ],
                (err, res, fields) =>{
                    
                    if(err){
                        return callback(err);
                    }
    
                    
                    return callback(null, res.rows)
                },
            )
        }
    },
    updateExpired : (record_id) => {
            return new Promise((resolve, reject) => {
                pgpool.query(
                    `UPDATE form_records SET status = 'expired' WHERE id = $1`,
                    [record_id],
                    (err, res) => {
                        if (err) {
                            console.error("Error updating expired record:", err);
                            return reject(err);
                        }
                        resolve(res);
                    }
                );
            });
    },


    deleteFormRecord: (record_id, callback) => {
    pgpool.query(
        `DELETE FROM form_records WHERE id = $1`, // Use a parameterized query to prevent SQL injection
        [record_id],
        (err, res) => {
        if (err) {
            console.error("Error deleting record:", err);
            return callback(err); // Pass the error to the callback
        }
        // Check the number of rows affected to determine if the deletion was successful
        if (res.rowCount > 0) {
            callback(null, res); // Pass the result to the callback
        } else {
            callback(null, { message: "Record not found or already deleted", rowCount: 0 });
        }
        }
    );
    },


    getRecord: (user_id, callback) => {
        console.log("user_id:", user_id)
        pgpool.query(
            `select * from form_records where user_id = $1 ORDER BY id ASC`,
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

    getRecordById: (r_id, callback)=>{
        pgpool.query(
            `select * from from_records where record_id = $1 ORDER BY id ASC`,
            [
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )

    },

    getSubmissionById: (r_id, callback)=>{
        // get sublisson by upload_id
        pgpool.query(
            `select * from submitted_records where record_id = $1`,
            [
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                // console.log(res.rows)
                return callback(null, res.rows)
            }

        )
        
    },

    getSubmissionCountById: (r_id, callback)=>{
        // get submission count by record_id
        console.log('submission count for ', r_id)
        pgpool.query(
            `SELECT COUNT(*) AS submission_count FROM submitted_records WHERE record_id = $1`,
            [r_id],
            (err, res) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0].submission_count);
            }
        );
    },    

    getUploadRecordById: (r_id, callback)=>{
        pgpool.query(
            `select * from form_records where record_id ILIKE $1`,
            [
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },

    getSettingById: (r_id, callback)=>{
        pgpool.query(
            `select * from settings where record_id = $1`,
            [
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },

    checkForRequestid: (request_id, callback) => {
        pgpool.query(
            `SELECT COUNT(*) AS count FROM form_records WHERE record_id = $1`,
            [request_id],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const rowCount = res.rows[0].count;
                // If rowCount is greater than 0, the request_id exists
                const requestExists = rowCount > 0;
                return callback(null, requestExists);
            }
        );
    },

   
}