const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const date = require('date-and-time');

module.exports = {

    getRefreshAndExchangeForAccess:(record_id, callback)=>{

        pgpool.query(
            `select user_id from records where record_id = $1`,
            [
                record_id 
            ],
           
            (err, res, fields) =>{
                console.log(res)
                if(err){
                    return callback(err);
                }
                getUserGoogle(res.rows[0].user_id)
            }

        )

        function getUserGoogle(user_id){
            pgpool.query(
                `SELECT * FROM user_google WHERE user_id = $1 ORDER BY date_created DESC LIMIT 1`,            [
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

    submitUpload:(body, callback)=>{
        const currentDate = new Date();
        pgpool.query(
            'update form_submissions set response_data=$1, submitted_at=$2',            
            [
                body.replies_json,
                currentDate
            ],
           
            (err, res, fields) =>{
                
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },

    getRefreshTokenGoogle:(user_id, body, callback)=>{
        if(body.preferred == 0){
            // 'speedlink Access'
            pgpool.query(
                'SELECT refresh_token,storage_email FROM user_google WHERE role = $1 ORDER BY date_created DESC LIMIT 1',
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
                'SELECT refresh_token,storage_email FROM user_google WHERE user_id = $1 ORDER BY date_created DESC LIMIT 1',
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

    createRecord: (data,folder_id, google_refresh_token,google_storage_email, record_id, user_id, callback)=>{
        if(data.file_type == 'custom_exe'){
           let custom_type = data.custom_type 
        }else{
            let custom_type = null 
        }
        let bt = data.b_token;
        const jsonData =  data;
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
   
        pgpool.query(
            `insert into form_records(user_id,status, b_token, record_id, google_refresh_token, drive_email, expiry_date, record_data) values($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                user_id,
                'active',
                data.b_token,
                record_id, 
                google_refresh_token,
                google_storage_email,//record id
                oneMoreDay,
                jsonData
               
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
            `select * from form_records where record_id = $1`,
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