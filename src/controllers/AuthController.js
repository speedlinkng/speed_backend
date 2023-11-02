const {getUserByUserEmail, register} = require('../services/auth.services');
const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {sign} = require("jsonwebtoken")
const jwt = require("jsonwebtoken")
const revokedTokens = new Set();


    function revokeToken(tokenId) {
        revokedTokens.add(tokenId);
        // STORE REVOKED TOKENS IN DB
    }

    function isTokenRevoked(tokenId) {
        return revokedTokens.has(tokenId);
    }

module.exports = {


    logout: (req, res)=>{
        let token = req.headers.authorization;
        token =  token && token.split(' ')[1]
        console.log(token)
        jwt.verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
            let decodedToken = decoded
         
            const tokenId = decodedToken.jti;
            // revokeToken(tokenId)
            console.log(revokedTokens)
     
            if (isTokenRevoked(tokenId)) {
                res.status(401).json({ message: 'Token has been revoked' });
              }

            if(revokeToken(tokenId)){
                res.status(200).json({ message: 'Logged out successfully' });
            }
            
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
                    plan:results.plan

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
                
                const accessToken = sign({result : results, jti: results.user_id}, process.env.REFRESH_TOK_SEC, {
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