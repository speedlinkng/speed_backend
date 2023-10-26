const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {storeToken, ifexist, updateToken, defaultOauth2Data, myStorage, newStorage} = require('../services/google.services')
const {sign} = require("jsonwebtoken")
const express = require('express');
const fs = require('fs');
const {Readable} = require('stream');
const request = require("request");
const {google} = require('googleapis');
const {GoogleAuth} = require('google-auth-library');
const path = require('path');
const process = require('process');
const dotenv = require('dotenv');
const mime = require('mime');
const axios = require('axios');
const { checkToken } = require("../middlewares/ValidateToken");
const {submitUpload} = require('../services/create.services');
dotenv.config();


module.exports = {

    checkOnline:(req, res)=>{
        console.log('online')
        console.log(req.body)
        request(
     
         {
           method: "PUT",
           url: req.body.url,
           headers: { 
             "Content-Range": `bytes */*`,
             "Content-Length": '0'
          }
         },
         (err, response, body) => {
           if (err) {
             console.log(err);
             return
           }
           console.log(body);
           console.log('done');
           console.log(JSON.stringify(response.headers));
           console.log(JSON.stringify(response.statusCode));
           console.log(JSON.stringify(response.headers['range']));
     
           sta = response.statusCode
           // return response.statusCode;
           return res.json({
             status:sta,
             headerRange:response.headers['range'],
             header:response.headers
           })
           
         })  
    },

    submitAndUpdate: async (req, res) => {

        // console.log(req.body)
        submitUpload(req.body, (err, results)=>{

            if(err){
                // console.log(err);
                console.log('err');
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }

            function sendEmail(){
                
            }
            const mailSent = sendEmail();
            
            return res.status(200).json({
                success: 1,
                data : 'updated successfully',
            })

        })

        // GET ACCESS TOKEN
       
    }
}