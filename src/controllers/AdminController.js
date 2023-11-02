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

const {v4:uuidv4} = require("uuid")
const shortid = require("shortid")
const date = require('date-and-time');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();


module.exports = {

    getAllUsers: (req, res)=>{
        getAllUsers((err, results)=>{
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
        updateUser(r_id, (err, results)=>{
            
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
                    error: 1,
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
                console.log('see')           
                console.log(results.bytes)
                console.log(results.kilobytes)
                console.log(results.megabytes)
                console.log(results.gigabytes)
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
                    message : 'No record found',
                })
            }

        })
    },

}