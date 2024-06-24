const pgpool = require('../models/PGDB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();
module.exports = {

    register: (data, callback)=>{
        // If account is not activatedand is being registered in again, using same email address,
        // Delete the old account and plug in the new one
        pgpool.query(
            `select * from users where email = $1`,
            [
                data.email
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
               console.log(res.rows)
                if (res.rowCount == 1 && res.rows[0].status === 'pending') {
                    console.log('yes pending')
                    pgpool.query(
                    `delete from users where email = $1`,
                    [
                        data.email
                    ])
                }
                console.log('@@@@@@@@@@@@@@')
                console.log(res.rowCount)
                if (res.rowCount == 1 && res.rows[0].status === 'activated') {
                    console.log('user exists')
                    return callback(null, res.rows[0], true) 
                }
                    console.log('user does not exist')
                pgpool.query(
                    `insert into users(firstName, lastName, email, password, number, user_id) values($1,$2,$3,$4,$5,$6)`,
                    [
                        data.first_name,
                        data.last_name,
                        data.email,
                        data.password,
                        data.number,
                        uniqueId
                    ],
                    (err, res, fields) =>{
                        if(err){
                            return callback(err);
                        }
                        pgpool.query(
                            `select * from users where email = $1`,
                            [
                                data.email
                            ],
                            (err, ress, fields) =>{
                                if(err){
                                    return callback(err);
                                }
                                console.log(ress.rows[0], 'this is')
                                return callback(null, ress.rows[0], false)
                            }
                
                        )
                        
                    },
                )
              
            }

        )
       
    },

    getUserByUserEmail: (email, callback) =>{
        pgpool.query(
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


    getMe: (email, callback) =>{
        pgpool.query(
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

    logout: (jti,tkn, callback) =>{
        pgpool.query(
            `insert into revoked_token(token, jti) values($1,$2)`,
            [    
                tkn,
                jti
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

    setActivate: async (user_id, callback) => {
      console.log('activeting ....')
        pgpool.query(
            `update users set status = $1 WHERE user_id = $2`, 
            ['activated', user_id],
            (err, res, fields) => {
                if (err) {
                    console.log('eissues');
                    console.log(err);
                    return callback(err);
                }
                console.log(user_id)
                return callback(null, res.rows)
            }

        )
    },
    checkUserId: async (user_id, callback) => {
      
        pgpool.query(
            `select * from users where user_id = $1`,
            [user_id],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
               
                return callback(null, res.rows)
            }

        )
    },
    checkEmailExists: async (email,try_, callback) => {
      
            pgpool.query(
                `select * from users where email = $1`,
                [email],
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
                    if(try_ !== 2){
                        setRecoverId()
                    }
                   
                    return callback(null, res.rows)
                }

            )
        

        function setRecoverId(){
            const verifyId_ = uniqueId
            pgpool.query(
                `update users set recovery_id = $1 WHERE email = $2`, 
                [verifyId_, email],
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
                    console.log('work')
                    // console.log(res.rowCount)
                    if(res.rowCount = 1){
                        return '1'
                        
                    }
                
                }
    
            )
        }
   
    },
    


    updateChangedPassword: (password, user_id, callback) =>{
        const currentDate = new Date();
        pgpool.query(
            `update users set password = $1, updated_at = $2 WHERE user_id = $3`, 
            [    
                password,
                currentDate,
                user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows[0])
            }

        )
    },


    matchRecovery: (recovery_id, callback) => {
        pgpool.query(
            'SELECT * FROM users WHERE recovery_id = $1',
            [recovery_id],
            (err, res) => {
                if (err) {
                    return callback(err);
                }
    
                if (res.rows.length > 0) {
                    // Recovery_id matches for the given email
                    return callback(null, {success:true, data:res.rows})
                } else {
                    // No matching recovery_id for the email
                    return callback(null, { success: false});
                }
            }
        );
    },
    
    
    checkOldPassword: (oldPassword, email, callback) =>{
       
        pgpool.query(
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

    setNewPassword: (password,email, callback) =>{
        const currentDate = new Date();
        pgpool.query(
            `update users set password = $1, updated_at = $2 where email = $3`, 
            [    
                password,
                currentDate,
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

    set_NewPhoneNumber: (phoneNumber,email, callback) =>{
        const currentDate = new Date();
        pgpool.query(
            `update users set number = $1, updated_at = $2 where email = $3`, 
            [    
                phoneNumber,
                currentDate,
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

    

    

    checkRevoke: (jti, callback) =>{
 
        pgpool.query(
            `select * from revoked_token where jti = $1`,
            [
                jti 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rows)
            }

        )
    },

}