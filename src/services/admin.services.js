// const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();


module.exports = {

    getAllUsers: (callback)=>{
        pgpool.query(
            `select * from users`,
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                console.log(res.rows)
                return callback(null, res.rows)
            }

        )
    },

    getAllRecords: (callback) =>{
        pgpool.query(
            `select * from form_records`,
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },


    searchUser: (searchTerm, callback) => {
        pgpool.query(
            `SELECT * FROM users WHERE user_id = $1 OR firstName LIKE $2 OR lastName LIKE $3 OR email LIKE $4`,
            [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res.rows); // Return the entire result set as an array
            }
        );
    },

    searchRecord: (searchTerm, callback) => {
        pgpool.query(
            `SELECT * FROM records WHERE user_id = $1 OR id LIKE $2 OR record_name LIKE $3 OR sender_name LIKE $4 OR file_type LIKE $5 OR record_id LIKE $6 OR file_name LIKE $7 OR sender_email LIKE $8 OR description LIKE $9`,
            [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res.rows); // Return the entire result set as an array
            }
        );
    },

    updateUser: (body, a_id, callback) => {
        console.log(body)
        if (body.e_status ? body.e_status : undefined);
        if (body.e_plan ? body.e_plan : undefined);
        if (body.e_lastname ? body.e_lastname : undefined);
        if (body.e_firstname ? body.e_firstname : undefined);
        pgpool.query(
            'UPDATE users set status=$1, plan=$2, lastName=$3, firstName=$4 WHERE email = $5',            
            [
                body.e_status,
                body.e_plan,
                body.e_lastname,
                body.e_firstname,
                'iso@gmail.com'
            ],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res.rows); // Return the entire result set as an array
            }
        );
    },

    getTotalUserCount: (callback) => {
        pgpool.query(
            `SELECT COUNT(*) AS userCount FROM users`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const userCount = res.rows[0].usercount;
             
                return callback(null, userCount);
            }
        );
    },
    
    getTotalRecordCount: (callback) => {
        pgpool.query(
            `SELECT COUNT(*) AS recordCount FROM form_records`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const recordCount = res.rows[0].recordcount;
       
                return callback(null, recordCount);
            }
        );

    },

    getTotalCompletedRecordCount: (callback) => {
        pgpool.query(
            `SELECT COUNT(*) AS recordCount FROM records WHERE status = 'completed'`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const recordCount = res[0].recordCount;
                return callback(null, recordCount);
            }
        );

    },


    getTotalByteUploaded: (callback) => {
        pgpool.query(
            `SELECT SUM(file_size) AS totalBytesUploaded FROM records`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const totalBytesUploaded = res[0].totalBytesUploaded;
                // console.log(`${totalBytesUploaded} BYTES`);
    
                // Convert bytes to kilobytes (KB)
                const totalKBUploaded = totalBytesUploaded / 1024;
                // console.log(totalKBUploaded)
                
                // Convert kilobytes to megabytes (MB)
                const totalMBUploaded = totalKBUploaded / 1024;
                // console.log(totalMBUploaded)
                
                // Convert megabytes to gigabytes (GB)
                const totalGBUploaded = totalMBUploaded / 1024;
                // console.log(totalGBUploaded)

    
                return callback(null, {
                    bytes: totalBytesUploaded,
                    kilobytes: totalKBUploaded,
                    megabytes: totalMBUploaded,
                    gigabytes: totalGBUploaded
                });
            }
        );
    },

    getTotalSubscribers: (callback) => {
        pgpool.query(
            `SELECT SUM(file_size) AS totalBytesUploaded FROM records`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const totalBytesUploaded = res[0].totalBytesUploaded;
                // Convert bytes to megabytes (MB)
                const totalMBUploaded = totalBytesUploaded / (1024 * 1024);
                return callback(null, totalMBUploaded);
            }
        );
    },

    getTotalAmount: (callback) => { // Amount total of subscribed users to date
        pgpool.query(
            `SELECT SUM(amount) AS totalAmount FROM subscribers`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const totalAmount = res[0].totalAmount;
                return callback(null, totalAmount);
            }
        );
    }
    

}