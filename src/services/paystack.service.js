// const pool = require('../models/DB');
const pool = require('../models/PGDB');
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

// Generate a new UUID
const uniqueId = uuidv4();

module.exports = {

   

    checkSubscriber: (decoded, callback)=>{
        pool.query(
            `select * from subscribers where user_id = $1`,
            [
                decoded.user_id,
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                console.log(res.rows[0])
                return callback(null, res.rows)
            }

        )
    },

    updateUser: (result, callback) => {
        pool.query(
            'UPDATE users set plan=$1 WHERE user_id = $2',            
            [
                '1',
                result.user_id
            ],
            (err, res, fields) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, res.rowCount); // Return the entire result set as an array
            }
        );
    },
    updateSubscriber: (body,resData,decoded,ref,plan, callback)=>{
        console.log(body)
        
            pool.query(
                'UPDATE subscribers SET user_id = $1, plan = $2, payment_id = $3, trxref = $4, amount = $5, AUTH_code = $6, email_token = $7, SUB_code = $8, PLAN_code = $9, CUS_code = $10, status = $11, next_payment_date = $12 WHERE user_id = $13',
                [
                    decoded.user_id,
                    'plus',
                    uniqueId,
                    ref,
                    body.data.amount,
                    resData.data.authorization.authorization_code,
                    body.data.email_token,
                    body.data.subscription_code,
                    plan,
                    resData.data.customer.customer_code,
                    body.data.status,
                    body.data.next_payment_date,
                    decoded.user_id
                ],
                (err, res, fields) =>{
                    if(err){
                        return callback(err);
                    }
    
                    // return callback(null, res);
                    pool.query(
                        'UPDATE users set plan=$1, next_payment_date=$2 WHERE user_id = $3',            
                        [
                            '2',
                            body.data.next_payment_date,
                            decoded.user_id
                        ],
                        (err, res, fields) => {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, res.rows); // Return the entire result set as an array
                        }
                    );
                   
                },
            )
    
    },

    saveSubscriber: (body,resData,decoded,ref,plan, callback)=>{
    console.log(body)
    
        pool.query(
            'insert into subscribers(user_id, plan, payment_id, trxref, amount, AUTH_code, email_token, SUB_code, PLAN_code, CUS_code, status, next_payment_date) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
            [
                decoded.user_id,
                2,
                uniqueId,
                ref,
                body.data.amount,
                resData.data.authorization.authorization_code,
                body.data.email_token,
                body.data.subscription_code,
                plan,
                resData.data.customer.customer_code,
                body.data.status,
                body.data.next_payment_date,
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }

                // return callback(null, res);
                pool.query(
                    'UPDATE users set plan=$1, next_payment_date=$2 WHERE user_id = $3',            
                    [
                        '2',
                        body.data.next_payment_date,
                        decoded.user_id
                    ],
                    (err, res, fields) => {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, res.rows); // Return the entire result set as an array
                    }
                );
               
            },
        )

    },


}