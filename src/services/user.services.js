// const pool = require('../models/DB');
const pool = require('../models/PGDB');


module.exports = {
    create: (data, callback)=>{
        pool.query(
            `insert into users(firstName, lastName, gender, email, password, number) values($1,$2,$3,$4,$5,$6)`,
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
                return callback(null, res.rows)
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
                return callback(null, res.rows)
            }

        )
    },

    getUserById: (id, callback) =>{
        pool.query(
            `select id,firstName,lastName,gender,email,number from users where id=$1`,
            [
            id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },

    updateUser: (data, callback) =>{
        pool.query(
            `update users set firstName=$1, lastName=$2, gender=$3, email=$4, password=$5, number=$6 where id=$7`,
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
                return callback(null, res.rows[0])
            }

        )
    },

    deleteUser: (data, callback) =>{
        pool.query(
            `delete from users where id = $1`,
            [
                data.id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },



    getUserByUserEmail: (email, callback) =>{
        pool.query(
            `select * from users where email = $1`,
            [
                email 
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