const {
    getAllUsers, 
    getAllRecords, 
    searchUser, 
    searchRecord, 
    updateUser, 
    getTotalUserCount,
    getTotalRecordCount,
    getTotalCompletedRecordCount,
    getTotalByteUploaded,
    getTotalSubscribers,
    getTotalAmount,
} = require('../services/admin.services');
const {getRecord} = require('../services/create.services');


const {v4:uuidv4} = require("uuid")
const shortid = require("shortid")
const date = require('date-and-time');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();


module.exports = {

    // getAllUsers: (req, res)=>{
    //     getAllUsers((err, results)=>{
    //         if(err){      
    //             return res.status(400).json({
    //                 status: 400,
    //                 error: 1,
    //                 message : err,
    //             })
    //         }
    //         else if(results && results.length > 0){  
    //             let rez = []
    //             results.forEach(e => {
    //                 getRecord(e.user_id, (err, resz)=>{

                       
    //                     if(err){
    //                         console.log(err);
    //                         return res.status(400).json({
    //                             status: 400,
    //                             error: 1,
    //                             message : err,
    //                         })
    //                     }

                        
    //                     resz.forEach(ress => {
    //                         rez.push(ress)
    //                     });

    //                     // console.log(e)
    //                     // console.log('this is')
    //                     // console.log(rez)
                      
                        

    //                 })
    //             })    

    //             console.log('this is')
    //                     console.log(rez)
                
    //             return res.status(200).json({
    //                 success: 1,
    //                 data :results ,
    //                 sub_data : rez,
    //             })  
               
                 
    //         }
    //         else{
    //             return res.status(402).json({
    //                 status: 402,
    //                 error: 1,
    //                 message : 'try anoher option <Debug></Debug>',
    //             })
    //         }

    //     })
    // },



    getAllUsers: (req, res) => {
        getAllUsers((err, results) => {
            if (err) {
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message: err,
                });
            } else if (results && results.length > 0) {
                let rezArray = []; // Create an array to store rez for each user
    
                // Define a function to get records for a user
                const getRecordsForUser = (user, callback) => {
                    getRecord(user.user_id, (err, resz) => {
                        if (err) {
                            console.log(err);
                            return callback(err, null);
                        }
    
                        let rez = [];
                        resz.forEach(ress => {
                            rez.push(ress);
                        });
    
                        callback(null, rez);
                    });
                };
    
                // Loop through each user and get their records
                const getUserRecords = (user, callback) => {
                    getRecordsForUser(user, (err, rez) => {
                        if (err) {
                            return callback(err, null);
                        }


                        // Modify the data field to remove the password field
                        const userWithoutPassword = results.map(user => {
                            const { password, ...userDataWithoutPassword } = user;
                            return userDataWithoutPassword;
                        });


                        rezArray.push({ user: userWithoutPassword, records: rez });
    
                        if (rezArray.length === results.length) {
                            // All records have been collected, send the response
                            return res.status(200).json({
                                success: 1,
                                data: userWithoutPassword,
                                sub_data: rezArray,
                            });
                        }
                    });
                };
    
                // Loop through all users and get their records
                results.forEach(user => {
                    getUserRecords(user, (err, rez) => {
                        if (err) {
                            return res.status(400).json({
                                status: 400,
                                error: 1,
                                message: err,
                            });
                        }
                    });
                });
            } else {
                return res.status(402).json({
                    status: 402,
                    error: 1,
                    message: 'try another option <Debug></Debug>',
                });
            }
        });
    },
    
    
    getAllRecords: (req, res)=>{
        getAllRecords((err, results)=>{
            
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results && results.length > 0){                 
              
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 402,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },


    searchUser: (req, res)=>{
        let searchTerm = req.params.searchTerm
        searchUser(searchTerm, (err, results)=>{
            
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results && results.length > 0){                 
                // Modify the data field to remove the password field
                const userWithoutPassword = results.map(user => {
                    const { password, ...userDataWithoutPassword } = user;
                    return userDataWithoutPassword;
                });
       
                return res.status(200).json({
                    success: 1,
                    data : userWithoutPassword,
                })     
            }
            else{
                return res.status(402).json({
                    status: 402,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },


    searchRecord: (req, res)=>{
        let searchTerm = req.body.searchTerm   
        searchRecord(searchTerm, (err, results)=>{
            console.log(searchTerm)
            if(err){      
               
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results && results.length > 0){                 
                console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                
                return res.status(402).json({
                    status: 402,
                    error: 1,
                    message : 'not found <Debug></Debug>',
                })
            }

        })
    },


    updateUser: (req, res)=>{
        console.log( req.params.id,)
        console.log(req)
        updateUser(req.body, req.params.id, (err, results)=>{
            
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results){                 
                console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'not found <Debug></Debug>',
                })
            }

        })
    },


    getTotalUserCount: (req, res)=>{
        getTotalUserCount((err, results)=>{
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){                 
                console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },
    
    getTotalRecordCount: (req, res)=>{
        getTotalRecordCount((err, results)=>{

            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){                 
                console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },

    getTotalCompletedRecordCount: (req, res)=>{
        getTotalCompletedRecordCount((err, results)=>{

            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){                 
                console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },

    getTotalByteUploaded: (req, res)=>{
        getTotalByteUploaded((err, results)=>{
   
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){      
        
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },

    getTotalSubscribers: (req, res)=>{
        getTotalSubscribers((err, results)=>{
   
            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){                 
                // console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 400,
                    error: 1,
                    message : 'try anoher option <Debug></Debug>',
                })
            }

        })
    },

    getTotalAmount: (req, res)=>{
        getTotalAmount((err, results)=>{

            if(err){      
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            else if(results ){                 
                // console.log(results)
                return res.status(200).json({
                    success: 1,
                    data : results,
                })     
            }
            else{
                return res.status(402).json({
                    status: 402,
                    error: 1,
                    message : 'No record found',
                })
            }

        })
    },

}