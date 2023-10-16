const pool = require('../models/DB');

module.exports = {
    create: (data, callback)=>{
        pool.query(
            `insert into users(firstName, lastName, gender, email, password, number) values(?,?,?,?,?,?)`,
            [
                data.first_name,
                data.last_name,
                data.gender,
                data.email,
                data.password,
                data.number
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            },
        )
    },

    getUsers: callback =>{
        pool.query(
            `select id,firstName,lastName,gender,email,number from users`,
            [

            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res)
            }

        )
    },

    getUserById: (id, callback) =>{
        pool.query(
            `select id,firstName,lastName,gender,email,number from users where id=?`,
            [
            id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },

    updateUser: (data, callback) =>{
        pool.query(
            `update users set firstName=?, lastName=?, gender=?, email=?, password=?, number=? where id=?`,
            [
                data.first_name,
                data.last_name,
                data.gender,
                data.email,
                data.password,
                data.number,
                data.id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },

    deleteUser: (data, callback) =>{
        pool.query(
            `delete from users where id = ?`,
            [
                data.id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res[0])
            }

        )
    },



    getUserByUserEmail: (email, callback) =>{
        pool.query(
            `select * from users where email = ?`,
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