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

    updateRecord:(r_id,jsonData, callback)=>{
        pgpool.query(
            'update form_records set record_data=$1 WHERE record_id = $2 ',            
            [
                jsonData,
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

    getRefreshTokenGoogle:(user_id, body, callback)=>{
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
                'SELECT refresh_token,storage_email, id FROM user_google WHERE user_id = $1 ORDER BY date_created DESC LIMIT 1',
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


    updateexpired:(user_id, callback)=>{
        pgpool.query(
            'update form_records set status=$1 WHERE file_id = "null" ',            
            [
                'expired' 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                // return callback(null, res)
            }
        )
        // pgpool.query(
        //     'update records set status=? WHERE file_id != "null" ',            
        //     [
        //         'completed' 
        //     ],
        //     (err, res, fields) =>{
        //         if(err){
        //             return callback(err);
        //         }
        //         return callback(null, res)
        //     }

        // )
    },

    createRecord: (data,folder_id, ADDFTFR, record_id, user_id, userGoogleRow_id, callback)=>{
        if(data.file_type == 'custom_exe'){
           let custom_type = data.custom_type 
        }else{
            let custom_type = null 
        }
        console.log('mistaken folderid '+ folder_id)
        let bt = data.b_token;
        const jsonData =  data;
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
   
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
                record_id, 
                ADDFTFR.refresh_token,
                ADDFTFR.access_token,
                ADDFTFR.expiry_date,
                ADDFTFR.id_token,
                ADDFTFR.token_type,
                ADDFTFR.scope,
                ADDFTFR.storage_email,
                oneMoreDay,
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

    getRecord: (user_id, callback)=>{
        pgpool.query(
                `select * from form_records where user_id = $1`,
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
            `select * from records where record_id = $1`,
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

    getUploadRecordById: (r_id, callback)=>{
        pgpool.query(
            `select * from form_records where record_id = $1`,
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

   
}