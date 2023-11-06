const pool = require('../models/DB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();


module.exports = {

    getAllUsers: (callback)=>{
        pool.query(
            `select * from users`,
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    getAllRecords: (callback) =>{
        pool.query(
            `select * from records`,
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },


    searchUser: (searchTerm, callback) => {
        pool.query(
            `SELECT * FROM users WHERE user_id = ? OR firstName LIKE ? OR lastName LIKE ? OR email LIKE ?`,
            [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res); // Return the entire result set as an array
            }
        );
    },

    searchRecord: (searchTerm, callback) => {
        pool.query(
            `SELECT * FROM records WHERE user_id = ? OR id LIKE ? OR record_name LIKE ? OR sender_name LIKE ? OR file_type LIKE ? OR record_id LIKE ? OR file_name LIKE ? OR sender_email LIKE ? OR description LIKE ?`,
            [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`,`%${searchTerm}%`],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res); // Return the entire result set as an array
            }
        );
    },

    updateUser: (body, a_id, callback) => {
        console.log(body)
        pool.query(
            'UPDATE users set status=?, plan=?, lastName=?, firstName=? WHERE email = ?',            
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
                return callback(null, res); // Return the entire result set as an array
            }
        );
    },

    getTotalUserCount: (callback) => {
        pool.query(
            `SELECT COUNT(*) AS userCount FROM users`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const userCount = res[0].userCount;
                return callback(null, userCount);
            }
        );
    },
    
    getTotalRecordCount: (callback) => {
        pool.query(
            `SELECT COUNT(*) AS recordCount FROM records`,
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                const recordCount = res[0].recordCount;
                return callback(null, recordCount);
            }
        );

    },

    getTotalCompletedRecordCount: (callback) => {
        pool.query(
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
        pool.query(
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
        pool.query(
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
        pool.query(
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