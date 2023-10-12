const pool = require('../models/DB');
const crypto = require("crypto")


module.exports = {
    register: (data, callback)=>{
        var mykey = crypto.createCipher('aes-128-cbc', data.email);
        var uid = mykey.update('abc', 'utf8', 'hex')
        uid += mykey.final('hex');
        console.log(uid)
        pool.query(
            `insert into registration(firstName, lastName, gender, email, password, number, user_id) values(?,?,?,?,?,?,?)`,
            [
                data.first_name,
                data.last_name,
                data.gender,
                data.email,
                data.password,
                data.number,
                uid
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            },
        )
    },

    getUserByUserEmail: (email, callback) =>{
        pool.query(
            `select * from registration where email = ?`,
            [
                email 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },


    getMe: (email, callback) =>{
        pool.query(
            `select * from registration where email = ?`,
            [
                email 
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