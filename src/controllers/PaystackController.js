const express = require('express');
const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {saveSubscriber,updateSubscriber, checkSubscriber, updateUser } = require('../services/paystack.service')
const jwt = require("jsonwebtoken")
const fs = require('fs');
const {Readable} = require('stream');
const request = require("request");
const crypto = require('crypto');

const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


// Encryption
function encryptData(data) {
    const secretKey = process.env.SECRET_KEY;

    // Set the expiration time for the token 
    const expiresIn = '5m';
    
    const token_ = jwt.sign({user_id: data.user_id}, secretKey, { expiresIn });
    
    console.log('JWT Token:', token_);
    return token_
}

function encrypt(text, key) {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  }
  
  // Decryption
function decrypt(data, key) {
    const iv = Buffer.from(data.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(data.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }




module.exports = {

    toFree: (req, res) => {
        updateUser(access, (err, results) => { 
            if(err){
                console.log(err);
                return res.status(400).json({
                    success: err,
                    message : 'An error occured',
                })
            }
            return res.status(200).json({
                success: 1,
                message : 'Updated to free version',
            })
        })  
    },

    cancel:(req, res)=>{

        function checkCancel(){
           
            checkSubscriber(res.decoded_access,(err, results)=>{
                console.log('<><><><><>')
              
                if(err){
                    console.log(err);
                    return res.status(400).json({
                        success: err,
                        message : 'An error occured',
                    })
                }
                console.log(results.length)
                if(results && results.length > 0){
                    console.log('go to cancel')
                    cancel(results[0])
                }else{
                    return res.status(400).json({
                        success: err,
                        message : 'you are not subscribed',
                    })
                }
            })
        }

        function cancel(results){
            console.log('opening cancel')

            const options = {
            url: 'https://api.paystack.co/subscription/disable',
            method: 'POST',
            headers: {
                Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                'Content-Type': 'application/json'
            },
            json: {
                code: results.sub_code,
                token: results.email_token
            }
            };
            
            request(options, (error, response, body) => {
            if (error) {
                console.error(error);
            } else {
                confirmCancel(results)
                console.log(body);
            }
            });
        }

        function confirmCancel(results){
 
           
            const options = {
                url: 'https://api.paystack.co/subscription/'+results.sub_code,
                method: 'GET',
                headers: {
                    Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                },
            };
            console.log('confirm cancel')
            request(options, (error, response, body) => {
                

            if (error) {
                console.error(error);
                return res.status(400).json({
                    error: 1,
                    message : error,
                })
                
            } else {
                // confirmCancel()
                console.log(body);
                console.log('no subscription found - confirmed');
                updateUser(results, (err, comeback) => { 
                    if (err) {
                        console.log(err)
                    }

                })

                return res.status(200).json({
                    success: 1,
                    message : 'suscription not found again',
                })
            }
            });
        }

        
        checkCancel()
        
    },



    webhook:(req, res)=>{
        console.log('webhook running')

        
        // Replace with your Paystack secret key
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SEC_TEST;
        console.log('PAYSTACK_SECRET_KEY:', PAYSTACK_SECRET_KEY)

        if (!PAYSTACK_SECRET_KEY) {
            console.error('PAYSTACK_SECRET_KEY is not defined');
            process.exit(1); // Exit the application if the key is not defined
        }

        if (req.method !== 'POST' || !req.get('X-Paystack-Signature')) {
            res.status(400).end();
            return;
        }
        
        
            const signatureHeader = req.get('X-Paystack-Signature');
            let body = req.body;

            console.log('PHASE 0: ',body)
            // Ensure that 'body' is a buffer or a string
            if (!Buffer.isBuffer(body)) {
                // If 'body' is an object, convert it to a string using JSON.stringify
                if (typeof body === 'object') {
                    body = JSON.stringify(body);
                    console.log('PHASE 1: ',body)
                } else {
                res.status(400).end(); // Handle other data types
                return;
                }
            }

            // Validate the signature
            const computedSignature = crypto
                .createHmac('sha512', PAYSTACK_SECRET_KEY)
                .update(body)
                .digest('hex');

            if (computedSignature !== signatureHeader) {
                res.status(403).end();
                return;
            }

console.log('PHAS 2: ',body)
            // Append the 'body' variable to package.json
            fs.appendFile('sub.json', body, (err) => {
                if (err) {
                console.error('Error appending to sub.json:', err);
                } else {
                console.log('Appended to sub.json');
                // Now, let's read the content from package.json
                fs.readFile('sub.json', 'utf8', (readErr, data) => {
                    if (readErr) {
                    console.error('Error reading package.json:', readErr);
                    } else {
                    console.log('Content of package.json:');
                    console.log(data);
                    }
                });
                }
            });


        
        // Parse the request body as JSON
        try {
            const event = JSON.parse(body);
            // Do something with the event
            console.log('Received event:', event);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
        
        res.status(200).end();
    },

    
    verify:(req, res)=>{

        const sampleUrl = req.query;
        console.log(sampleUrl.trxref)
        async function verify() {
            try {

                const options = {
                    url: 'https://api.paystack.co/transaction/verify/'+sampleUrl.trxref,
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                    },
                };

                request(options, (error, response, body) => {
                if (error) {
                    console.error(error);
                } else {
                    const responseData = JSON.parse(body);
                
                    if (responseData.data.authorization.authorization_code != '') {
                        // console.log('Auth: '+responseData.data.authorization.authorization_code);
                        // console.log('Customer code: '+responseData.data.customer.customer_code);
                        // console.log('Customer email: '+responseData.data.customer.email);
                        // console.log('Customer plan: '+sampleUrl.plan);
                        // res.send(responseData);
                        createSub(responseData, sampleUrl.trxref, sampleUrl.token)
                    } else {
                        //----------------------------------
                        // REDIECT to frontend
                        res.redirect(`${process.env.FRONTEND_URL}/dash`)
                        // res.redirect(url);
                        // res.send(responseData);
                    }
                }
                });
            }
            catch(error){
                console.log(error)
            }
        }

        async function createSub(responseData, ref, tkn) {
            return new Promise((resolve, reject) => {
                const decoded = jwt.decode(tkn);
                console.log('create_sub')

                const params = {
                    customer: responseData.data.customer.customer_code , plan: sampleUrl.plan
                };

                const options = {
                    url: 'https://api.paystack.co/subscription',
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                        'Content-Type': 'application/json',
                    },
                    json: params,
                };

                request(options, (error, response, body) => {

                    
                    if (error) {
                        reject(error);
                    } else {
                        checkSubscriber(decoded,(err, results)=>{
                            if(err){
                                console.log(err);
                                return res.status(500).json({
                                    success: err,
                                    message : 'An error occured',
                                })
                            }
                           if(results && results.length > 0){
                            console.log(body)
                                updateSubscriber(body, responseData, decoded, ref, sampleUrl.plan, (err, results)=>{
                                    if(err){
                                        console.log(err);
                                        return res.status(500).json({
                                            error: err,
                                            message : 'An error occured',
                                        })
                                    }
                                    res.redirect(`${process.env.FRONTEND_URL}/dash`)
                                    // return res.status(200).json({
                                    //     success: 1,
                                    //     data : 'updated successfully',
                                    // })
                                })
                           }else{
                            saveSubscriber(body, responseData, decoded, ref, sampleUrl.plan, (err, results)=>{
                                if(err){
                                    console.log(err);
                                    return res.status(500).json({
                                        success: err,
                                        message : 'An error occured',
                                    })
                                }
                                res.redirect(`${process.env.FRONTEND_URL}/dash`)
                                // return res.status(200).json({
                                //     success: 1,
                                //     data : 'updated successfully',
                                // })
                            })
                           }
                        })

                    }
                });
            });
        }
        verify()
    },



    paystack:(req, res)=>{
        const plan_type = req.query.plan_type;
        let access =  res.decoded_access
        console.log(access)

        const encryptedData = encryptData(access);
        console.log('Encrypted Data:', encryptedData);

        async function init() {
            try {
                const plan = await createPlan();

                const options = {
                    url: 'https://api.paystack.co/transaction/initialize',
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                        'Content-Type': 'application/json',
                    },
                    json: {
                        email: access.email,
                        first_name: 'Divine ',
                        first_name: 'iso',
                        amount: 200000,
                        callback_url: process.env.BACKEND_URL+'/api/pay/verify?plan='+plan+'&plan_type='+plan_type+'&token='+encryptedData
                    },
                };

                request(options, (error, response, body) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('done')
                        return res.status(200).json({
                            success: 1,
                            data : body.data.authorization_url,
                        })
                      
                        // res.send(body.data.authorization_url);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }

        async function createPlan() {
            return new Promise((resolve, reject) => {
                const params = {
                    name: 'Speedlink Plus',
                    interval: 'monthly',
                    amount: 50000,
                };

                const options = {
                    url: 'https://api.paystack.co/plan',
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer '+process.env.PAYSTACK_SEC_TEST,
                        'Content-Type': 'application/json',
                    },
                    json: params,
                };

                request(options, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log(body.data.name);
                        console.log(body.data.interval);
                        console.log(body.data.plan_code);
                        resolve(body.data.plan_code);
                    }
                });
            });
        }

        init();
    }
}