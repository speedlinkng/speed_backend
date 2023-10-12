const pool = require('../models/DB');

module.exports = {
    create: (data, callback)=>{
        pool.query(
            `insert into registration(firstName, lastName, gender, email, password, number) values(?,?,?,?,?,?)`,
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
            `select id,firstName,lastName,gender,email,number from registration`,
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
            `select id,firstName,lastName,gender,email,number from registration where id=?`,
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
            `update registration set firstName=?, lastName=?, gender=?, email=?, password=?, number=? where id=?`,
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
            `delete from registration where id = ?`,
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