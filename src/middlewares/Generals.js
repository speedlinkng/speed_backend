const {google} = require('googleapis');
const process = require('process');
const pool = require('../models/DB');
const shortid = require("shortid");
const dotenv = require('dotenv');
const date = require('date-and-time');
const { getGoogleData } = require('../services/google.services');
const { getSubmittedRecordById } = require('../services/submit.services');

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);

module.exports = {
    checkLinkExpire: (req, res, next) => {
        // console.log('checkLinkExpire')
        // console.log(req.body.record_id)
        getSubmittedRecordById(req.body.record_id, (err, results)=>{ 
            if(err){
                console.log(err);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            if(results && results.id){
        
                let date1 = new Date();
                let date2 = new Date(results.expiry_date);
                
                if(date1 > date2 ){
                    console.log('expired');
                    return res.status(301).json({
                        status:301,
                        error:1,
                        message: 'Expired',
                    })
                }else{
                   
                    return next(); 
                }
            }
            else{
                return res.status(300).json({
                    status:300,
                    error:1,
                    message: 'Record not found',
                })
            }
          
        })
     
    },

    getGoogleData:  (req, res, next) => {
        let access =  res.decoded_access
        let tok_data = ''
        // console.log(req.body.preferred)
        // console.log(req.body.allArray)
        let preff 
        if (req.body.allArray && req.body.allArray.preferred !== undefined) {
            preff = req.body.allArray.preferred;
        } else {
            preff = req.body.preferred;
        }
        console.log('PREFF IS ', preff)
            getGoogleData(access, preff, (err, _res)=>{
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