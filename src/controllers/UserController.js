const {create, getUserById, getUsers, updateUser, deleteUser, getUserByUserEmail} = require('../services/user.services');
const {genSaltSync, hashSync, compareSync} = require("bcrypt")
const {sign} = require("jsonwebtoken")

module.exports = {
    createUser: (req, res)=>{
        const body = req.body
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt)
        create(body, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            return res.status(200).json({
                success:1,
                data : results,
            })
        })
    },

    getUserById: (req, res)=>{
        const id = req.params.id
       console.log(id)
        getUserById(id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            if(!results){
                return res.json({
                    success: 0,
                    message : 'results not found',
                })
            }
            return res.status(200).json({
                success:1,
                data : results,
            })
        })
    },

    getUsers: (req, res)=>{
        getUsers((err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'DB connection error',
                })
            }
            return res.status(200).json({
                success:1,
                data : results,
            })
        })
    },

    updateUsers: (req, res)=>{
        const body = req.body
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt)
        updateUser(body, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'An error occured',
                })
            }
            return res.status(200).json({
                success: 1,
                data : 'updated successfully',
            })
        })
    },

    
    deleteUser: (req, res)=>{
        const data = req.body
        console.log(data.id)
        deleteUser(data, (err, results)=>{
            console.log(err)
            console.log(results)
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'An error poccured',
                })
            }
            if(!results){
                return res.json({
                    success: 0,
                    message : 'record not found',
                })
            }
            return res.status(200).json({
                success:1,
                data : 'user deleted successfully',
            })
        })
    },


    login: (req, res)=>{
        const data = req.body
        getUserByUserEmail(data.email, (err, results)=>{
      
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: err,
                    message : 'An error occured',
                })
            }
            if(!results){
                return res.json({
                    success: 'why',
                    message : 'invalid email or password',
                })
            }
            const result = compareSync(data.password, results.password)

            if(result){
                results.password = undefined
                const accessToken = sign({result : results}, process.env.REFRESH_TOK_SEC, {
                    expiresIn: "1h"
                })

                return res.status(200).json({
                    success:1,
                    data : 'user loggedin successfully',
                    token : accessToken,
                })
            }else{
                return res.status(200).json({
                    success:1,
                    data : 'invalid email or password',
                })
            }
           
        })
    }
    


}

































// module.exports ={
//     get: (req, res) => {
//         res.send('hi');
//     },

//     me: (req, res) => {
//         res.send('this is me');
//     },

//     you: (req, res) => {
//         res.send('this is you api');
//     },
// }


// module.exports  = class UserController{
//     static home(req,res){
//         res.send('this is you home api');
//     }
// }