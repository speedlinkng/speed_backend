const pool = require('../models/DB');
const date = require('date-and-time');

module.exports = {

    getRefreshAndExchangeForAccess:(record_id, callback)=>{

        pool.query(
            `select user_id from records where record_id = ?`,
            [
                record_id 
            ],
           
            (err, res, fields) =>{
                console.log(res)
                if(err){
                    return callback(err);
                }
                getUserGoogle(res[0].user_id)
            }

        )

        function getUserGoogle(user_id){
            pool.query(
                `SELECT * FROM user_google WHERE user_id = ? ORDER BY date_created DESC LIMIT 1`,            [
                    user_id 
                ],
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
                    return callback(null, res)
                }

            )
        }
    },

    submitUpload:(body, callback)=>{
        pool.query(
            'update records set sender_name=?, sender_email=?, file_name=?, file_size=?, file_id=?, file_type=?, answers=?, status=? where record_id=?',            
            [
                body.name,
                body.email,
                body.fileName,
                body.fileSize,
                body.fileId,
                body.fileType,
                body.answers,
                'completed',
                body.record_id

            ],
           
            (err, res, fields) =>{
                
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },

    getRefreshTokenGoogle:(user_id, callback)=>{
        pool.query(
            'SELECT refresh_token FROM user_google WHERE user_id = ? ORDER BY date_created DESC LIMIT 1',
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

    createRecord: (data,folder_id, google_refresh_token, record_id, user_id, callback)=>{
        if(data.file_type == 'custom_exe'){
           let custom_type = data.custom_type 
        }else{
            let custom_type = null 
        }
        const currentDate = new Date();
        const oneMoreDay = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
        pool.query(
            `insert into records(record_name, google_refresh_token, description, folder, folder_id, drive_email, record_id, user_id, expiry_date) values(?,?,?,?,?,?,?,?,?)`,
            [
                data.name,
                google_refresh_token,
                data.description,
                data.folder,
                folder_id,
                data.drive_email,
                record_id, //record id
                user_id,//data.user_id
                oneMoreDay
               
            ],
            (err, res, fields) =>{
                
                if(err){
                    return callback(err);
                }
                insertSetings()
                
           
            },
        )

        function insertSetings(){
            pool.query(
                `insert into settings(user_id, record_id, ask_name, send_notification, quantity, file_type, custom_type, upload_size) values(?,?,?,?,?,?,?,?)`,
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
    
                    
                    return callback(null, res)
                },
            )
        }
    },


    getRecord: (user_id, callback)=>{
            pool.query(
                `select * from records where user_id = ?`,
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

    getRecordById: (r_id, callback)=>{
        pool.query(
            `select * from records where record_id = ?`,
            [
                r_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
        
    },

    getSettingById: (r_id, callback)=>{
        pool.query(
            `select * from settings where record_id = ?`,
            [
                r_id 
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