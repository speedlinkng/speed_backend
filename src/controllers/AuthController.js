const {getUserByUserEmail, register, logout, checkRevoke} = require('../services/auth.services');
const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {sign} = require("jsonwebtoken")
const jwt = require("jsonwebtoken")
const crypto = require('crypto');

module.exports = {


    logout: (req, res)=>{
        let token = req.headers.authorization;
        token =  token && token.split(' ')[1]
        console.log(token)
        jwt.verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
            let decodedToken = decoded
         
            const tokenjit = decodedToken.jti;
            // revokeToken(tokenId)
            console.log(tokenjit)

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
                    name:`${results.firstName} ${results.lastName}`,
                    email:results.email,
                    gender:results.gender,
                    plan:results.plan,
                    role:results.role

                },
            })
        })
    },

    createUser: (req, res)=>{
        const body = req.body
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt)
        register(body, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    error: 1,
                    message : err,
                })
            }
            return res.status(200).json({
                success:1,
                data : results,
            })
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
            if(!results){
                return res.status(302).json({
                    error: 1,
                    message : 'Email or password does not exist',
                })
            }
            const result = compareSync(data.password, results.password)

            if(result){
                results.password = undefined
                
                const accessToken = sign({result : results, jti: uniqueID}, process.env.REFRESH_TOK_SEC, {
                    expiresIn: "1h"
                })

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