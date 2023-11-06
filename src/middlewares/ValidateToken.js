const {verify} = require("jsonwebtoken")
const jwt = require("jsonwebtoken")
const revokedTokens = new Set();


    function revokeToken(tokenId) {
        revokedTokens.add(tokenId);
    }

    function isTokenRevoked(tokenId) {
        return revokedTokens.has(tokenId);
    }

module.exports = {

    protectRoute: (req, res, next)=>{

        function protectRoute(req, res, next) {
            const token = req.headers.authorization; // Assuming the token is in the request headers
            if (!token) {
              return res.status(401).json({ message: 'Unauthorized' });
            }
          
            const decodedToken = jwt.decode(token);
            if (!decodedToken || !decodedToken.jti) {
              return res.status(401).json({ message: 'Invalid token' });
            }
          
            const tokenId = decodedToken.jti;
            if (isTokenRevoked(tokenId)) {
              return res.status(401).json({ message: 'Token has been revoked' });
            }
          
            // Token is valid, proceed to the protected resource
            // next();
            logout()
          }

        //   protectRoute()
    },

    checkToken:  (req, res, next) => {
        let token = req.get("authorization")
        if(token){
            token =  token && token.split(' ')[1]
            verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
               if(err){
                return res.status(403).json({
                    error:2,
                    message:"invalid token",
                })
               } else{
                res.decoded_access = decoded.result
                next();
               }
            })
        }else{
            return res.status(403).json({
                error: 1,
                message: "Access denied! Unauthorized"
            })
        }
    },

    ifAdmin:  (req, res, next) => {
        let token = req.get("authorization")
        if(token){
            token =  token && token.split(' ')[1]
            verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
                // console.log(decoded.result.role)
               if(err){
                return res.status(400).json({
                    error:2,
                    message:"invalid token",
                })
               }else{
                if(decoded.result.role == 'admin'){
                    console.log(decoded.result.role)
                    res.decoded_access = decoded.result
                    next();
                }else{

                    return res.status(403).json({
                        error:3,
                        message:"Access denied!",
                    })
                }
               
                
               }
            })
        }else{
            return res.status(403).json({
                error: 1,
                message: "Access denied! Unauthorized"
            })
        }
    },

    checkTokenUrl:  (req, res, next) => {
        let token = req.params.access
        // console.log(token)
        if(token){
            verify(token, process.env.REFRESH_TOK_SEC, (err, decoded)=>{
               if(err){
                res.status(403).json({
                    error:2,
                    message:"invalid tokens",
                })
               } else{
                res.decoded_access = decoded.result
                next();
               }
            })
        }else{
            return res.status(403).json({
                error: 1,
                message: "Access denied! Unauthorized"
            })
        }
    },
    validateEmail : (schema)=> async (req, res, next) => {
        let email = req.params.app_email
        res.app_email = email
        next();
       
     },
}

// module.exports = {
//     checkToken:  (req, res, next) => {
//         let token = req.get("authorization")
//         if(token){
//             token =  token && token.split(' ')[1]
        
//             try {
//                 decoded = verify(token, process.env.REFRESH_TOK_SEC);
//             } catch (e) {
//                 return res.status(401).send('unauthorized');
//             }
           
           
//                 console.log(decoded.id)
//                 next();
               
            
//         }else{
//             return res.json({
//                 success: 1,
//                 message: "Access denied! Unauthorized"
//             })
//         }
//     }
// }