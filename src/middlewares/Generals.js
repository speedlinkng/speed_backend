const {google} = require('googleapis');
const request = require("request");
const process = require('process');
const pool = require('../models/DB');
const shortid = require("shortid");
const dotenv = require('dotenv');
const date = require('date-and-time');
const { getGoogleData } = require('../services/google.services');

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);

module.exports = {
    getGoogleData:  (req, res, next) => {
        let access =  res.decoded_access
        let tok_data = ''
            getGoogleData(access,(err, _res)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                } 

                    if(_res){
                         tok_data = JSON.stringify({ 
                          refresh_token: _res[0]['refresh_token'],
                          access_token: _res[0]['access_token'],
                          expiry_date: _res[0]['expiry_date'],
                          id_token: _res[0]['id_token'],
                          token_type: _res[0]['token_type'],
                          scope: _res[0]['scope']
                        })
                    }
                 
                    res.tok_data = tok_data

                    next();
                    // return next()
            
                
            })
       
    }
}