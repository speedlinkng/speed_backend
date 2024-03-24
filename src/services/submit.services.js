const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const date = require('date-and-time');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');
// Generate a new UUID
const uniqueId = uuidv4();
module.exports = {


getSubmittedRecordById: (r_id, callback)=>{
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


submitFormReplies:(body, callback)=>{
    // get user id
    function getUserId(){
        pgpool.query(
            `select user_id from form_records where record_id = $1`,
            [
                body.record_id 
            ],
           
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                   
                else if(res.rows.length > 0){
                   
                    getUserDetails(res.rows)         
                }  
            }
    
        )
    }

    function getUserDetails(uid){

        pgpool.query(
            `select * from users where user_id = $1`,
            [
                uid[0].user_id 
            ],
           
            (err, res, fields) =>{
                // console.log(res.rows)
                if(err){
                    return callback(err);
                }
                
                else if(res.rows.length > 0) {
                    res.rows.push({'uniqueId':uniqueId});
                    return callback(null, res.rows);
                  }
                

            }
        )
    }

    function submitForm(){
        const currentDate = new Date();
        pgpool.query(
            `insert into submitted_records(submitted_data, created_at, drive_email, record_id, status, submitted_id) values($1,$2,$3,$4,$5,$6)`,
            [
                body.json_replies,
                currentDate,
                body.drive_email,
                body.record_id,
                body.status,
                uniqueId
            ],
        
            (err, res, fields) =>{   
                if(err){
                    return callback(err);
                }
                console.log(res.rows)
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
                getUserId()
            }

        )
    }
    submitForm()

},

submitAndUpdate: async (body, callback) => {
    fileLinks = JSON.stringify(body.fileLinks)
    replyLinks = JSON.stringify(body.replyLinks)
    if(fileLinks.length < 1){
        fileLinks = [{default:null}];
    }
    console.log(body.submit_id)
    console.log(fileLinks.length)
    console.log(body.replyLinks)
  
    pgpool.query(
        `update submitted_records set file_urls = $1, status = $2, reply_links = $3 WHERE submitted_id = $4`, 
        [fileLinks, 'completed', replyLinks, body.submit_id],
        (err, res, fields) =>{
            if(err){
                console.log(err)
                return callback(err);
            }
            console.log('work')
            console.log(res.rowCount)
     
            return callback(null, res.rows) 
        
        
        }

    )
}


}