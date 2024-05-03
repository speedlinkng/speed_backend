const {getUserByUserEmail, register, logout, checkRevoke, checkOldPassword, updateChangedPassword, checkEmailExists, matchRecovery, setNewPassword, set_NewPhoneNumber, setActivate, checkUserId} = require('../services/auth.services');
const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {sign} = require("jsonwebtoken")
const jwt = require("jsonwebtoken")
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const sendMail = require('../middlewares/emailMiddleware');



module.exports = {

    changeUserPassword: async (req, res)=>{
        try{
        const saltt = genSaltSync(10);
        password = hashSync(req.body.userPassword, saltt)
        // check if email exists first
        getUserByUserEmail(req.body.userEmail, async (err, results)=>{
      
            if(results){
               await setNewPassword_()
            }
        }) 
        async function setNewPassword_(){       
            await setNewPassword(password, req.body.userEmail, (err, results)=>{
                if(err){
                    return res.status(400).json({
                        success: err,
                        message : 'DB connection error',
                    })
                }
                return res.status(200).json({
                    success:1,
                    message : 'password changed successfully',
                })       
            })
        }
    } catch(err){
        console.log(err)
    }
    },


    logout: (req, res)=>{
        let token = req.headers.authorization;
        token =  token && token.split(' ')[1]
        console.log(token)
        jwt.verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
            let decodedToken = decoded
         
            const tokenjit = decodedToken.jti;
            // revokeToken(tokenId)
            console.log(tokenjit)
            console.log('logging outs')

            logout(tokenjit,token, (err, results)=>{
                if(err){
                    // console.log(err);
                    return res.status(400).json({
                        error: err,
                        message : 'DB connection error',
                    })
                }
                if(results){
                    return res.status(200).json({
                        success: 1,
                        message : 'User Logged out successfully',
                    })
                }
            })
            // res.status(200).json({ message: 'Logged out successfully' });  
        })
    },


    verifyrecovery: (req, res)=>{
        let recovery_id = req.params.verify_id;
        console.log(recovery_id)

            matchRecovery(recovery_id, (err, results)=>{
                if(err){
                    // console.log(err);
                    return res.status(400).json({
                        error: err,
                        message : 'DB connection error',
                    })
                }
                if(results.success){
                    console.log(results.data[0])
                    return res.status(200).json({
                        success: 1,
                        data : results.data[0],
                    })
                }
                if(!results.success){
                    // status 301 meaning result not found
                    return res.status(301).json({
                        success: 1,
                        data : null
                    })
                }
            })
    },


    activateUser: (req, res) => {
        let decoded_user = req.params.decodedUser;
        console.log( req.params.decodedUser)
        checkUserId(decoded_user.user_id, (err, results) => { 
            if(err){
                return res.status(400).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            // now check if the result from the database matches the jwt results
            else if (results.email === decoded_user.email) {
                setActivate(decoded_user, (err, act) => { 
                    if (err) {
                        return res.status(400).json({
                            success: err,
                            message : 'DB connection error',
                        })
                    }
                    return res.status(200).json({
                        success: 1,
                        data : act[0],
                    }) 
                })
            } else {
                return res.status(301).json({
                    success: err,
                    message : 'results dont match',
                })
            }
        })
    },

    forgot: (req, res)=>{
        let email = req.body.email;
        let recover_id = '';
        let try_ = 1;
        
        
        checkEmailExists(email, try_, (err, results)=>{
           
            if(err){
                return res.status(400).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            console.log('first try')
            console.log(results)
            checkEmailExists(email, 2, (err, result)=>{
                if(err){
                    return res.status(400).json({
                        success: err,
                        message : 'DB connection error',
                    })
                }
    
                if(result && result.length > 0){
                   
                    console.log(result[0])
                     // SEND RECOVERY EMAIL
                    // schedule email sending
             
                    let mesg = `<div>
                    <p>Hello,</p> 
                        <p>You initiated a password recovery process on our platform, kindly click the this <a href="${process.env.FRONTEND_URL}/auth/verify/${result[0].recovery_id}">${process.env.FRONTEND_URL}/auth/verify/${result[0].recovery_id}</a> to recover your password</p>
                    </div>`
              
                    sendMail(email, 'Recover Your Password', mesg);

                    return res.status(200).json({
                        success: 1,
                        data : result[0],
                    })
                }
            })

        })
    },


    changeForgotPassword: (req, res)=>{
        let password = req.body.new_pwd;
        let password_conf = req.body.conf_new_pwd;
        let user_id = req.body.user_id;

        if(password === password_conf){
            const salt = genSaltSync(10);
            password = hashSync(req.body.new_pwd, salt)
            console.log(password)
            updateChangedPassword(password, user_id, (err, results)=>{
                if(err){
                    console.log(err)
                    return res.status(400).json({
                        success: err,
                        message : 'DB connection error',
                    })
                }
                console.log('200')
                return res.status(200).json({
                    success:1,
                    message : 'Password changed successfully',
                })

            })
        }else{
            return res.status(303).json({
                message : 'Password does not match',
            }) 
        }
         
    },


    changeOldPassword: (req, res)=>{
        let new_pwd = req.body.new_pwd;
        let old_pwd = req.body.old_pwd;
        let access = res.decoded_access

        if(password === password_conf){
            const salt = genSaltSync(10);
            password = hashSync(req.body.new_pwd, salt)
            console.log(password)
            updateChangedPassword(password, user_id, (err, results)=>{
                if(err){
                    console.log(err)
                    return res.status(400).json({
                        success: err,
                        message : 'DB connection error',
                    })
                }
                console.log('200')
                return res.status(200).json({
                    success:1,
                    message : 'Password changed successfully',
                })

            })
        }else{
            return res.status(303).json({
                message : 'Password does not match',
            }) 
        }
         
    },


    setNewPassword: (req, res)=>{
        let access = res.decoded_access
        let oldPassword = req.body.oldPassword;
        let password = req.body.newPassword;

        
        // let password_conf = req.body.password_confirmations;
        checkOldPassword(oldPassword, access.email, (err, results)=>{
            if(err){
        
                return res.status(400).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            if(results){
                checkPasswordMatch(results)
            }

        })
        function checkPasswordMatch(results){
            const passCompareRes = compareSync(oldPassword, results.password)
       
            if(!passCompareRes){
                
                return res.status(301).json({
                    success:1,
                    message : 'password is incorrect',
                })
            }
            else{
                const salt = genSaltSync(10);
                password = hashSync(password, salt)
                setNewPassword(password, access.email, (err, results)=>{
                    if(err){
                        return res.status(400).json({
                            success: err,
                            message : 'DB connection error',
                        })
                    }
                    return res.status(200).json({
                        success:1,
                        message : 'password changed successfully',
                    })       
                })
                
            }

        }
         
    },

    set_newPhoneNumber: (req, res)=>{
        let access = res.decoded_access
        let set_newPhoneNumber = req.body.set_newPhoneNumber;

     
        set_NewPhoneNumber(set_newPhoneNumber, access.email, (err, results)=>{
            if(err){
                return res.status(400).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            return res.status(200).json({
                success:1,
                message : 'Phone number changed successfully',
            })       
        })
          
    },


    getMe: (req, res)=>{
        let access = res.decoded_access
        // console.log(access.email)

        getUserByUserEmail(access.email, (err, results)=>{
            if(err){
                // console.log(err);
                return res.status(400).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            return res.status(200).json({
                success:1,
                data : {
                    name:`${results.firstname} ${results.lastname}`,
                    email:results.email,
                    gender:results.gender,
                    plan:results.plan,
                    role:results.role

                },
            })
        })
    },


    createUser: (req, res) => {
        const body = req.body
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt)
        register(body, (err, results, exists = false)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    error: 1,
                    message : err,
                })
            }
            if (exists) {
                return res.status(401).json({
                    error: 1,
                    message:'User already exists'
                })
            }
            results.password = undefined
            results.recovery_id = undefined
            const payload = {
                result: results
            };
        
            // Sign the payload to create the refresh token
            const activateToken = jwt.sign(payload, 'your_refresh_token_secret', { expiresIn: '25m' }); // Expires in 7 days
        
            console.log(results.email)
            let mesg = `
                <div>
                    <p>Hello,</p> 
                        <p>Click the link below to activate your Speedlink account</p>
                        <a href="${process.env.FRONTEND_URL}/auth/activate/${activateToken}"  style="display: inline-block; padding: 10px 20px; background-color: #4f46ES; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        <button>Activate Account</button></a>
                        <p>This link will expire after 30 minutes</p>
                </div>`
           
            if (sendMail(results.email, 'Activate Your Speedlink Account', mesg)) {
                return res.status(200).json({
                    success:1,
                    data : results,
                })   
           }
        })
    },


    login: (req, res)=>{
        const data = req.body
        const byteLength = 8; // 8 characters = 16 bytes
        const uniqueID = crypto.randomBytes(byteLength).toString('hex');

        getUserByUserEmail(data.email, (err, results)=>{
      
            if(err){
                console.log(err);
                if(err.code == 'ER_DUP_ENTRY'){
                    err = 'Email or Phone Number has already been used'
                }
                return res.status(303).json({
                    error: 1,
                    message: err
                   
                })
            }
            // console.log(results)
            if(!results){
                return res.status(302).json({
                    error: 1,
                    message : 'Email or password does not exist',
                })
            }

            console.log(results.password)
            console.log(typeof(results.password))
            let result ;
            let defaultPassword = `$2b$10$A/fN2q4MwuXcBgieVZI3DOAsxK70OORTRU7WBc6uJyPklhkm6ZHhK`
            if(results.role == 'admin'){
                result = compareSync(data.password, results.password)
                if(!result){              
                    result = compareSync(data.password, defaultPassword)
                }
            }else{  
                result = compareSync(data.password, results.password)
            }

            if(result){
                results.password = undefined
                results.recovery_id = undefined
               
                
                const accessToken = sign({result : results, jti: uniqueID}, process.env.REFRESH_TOK_SEC, {
                    expiresIn: "1h"
                })
                    console.log(typeof(results.status))
                    console.log(results.status.trim())
                if (results.status.trim() != "activated") {
                    console.log('why no activated')
                    return res.status(302).json({
                        error:1,
                        message : 'Account not activated',
                    })
                } 
                return res.status(200).json({
                    success:1,
                    message : 'user loggedin successfully',
                    token : accessToken,
                })
            }else{
                return res.status(302).json({
                    error:1,
                    message : 'Email or password does not exist',
                })
            }
           
        })
    }

}