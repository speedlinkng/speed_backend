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
dotenv.config();


const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);

const oauth3Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);
  

module.exports = {

    getMyStorage: (req, res)=>{
      let access = res.decoded_access
      console.log(access.email)
      console.log(access.user_id)
        myStorage(access.user_id, (err, _res)=>{
          if(err){
            console.log(err);
            return res.status(401).json({
                error: 1,
                message: err
            })
          }
          if(_res && _res[0].id){
            let tok_data = JSON.stringify({ 
              refresh_token: _res[0]['refresh_token'],
              access_token: _res[0]['access_token'],
              expiry_date: _res[0]['expiry_date'],
              id_token: _res[0]['id_token'],
              token_type: _res[0]['token_type'],
              scope: _res[0]['scope']
            })
            // console.log(tok_data);
            

            var json = JSON.parse(tok_data);
            oauth2Client.setCredentials(json); 
        
              oauth2Client.refreshAccessToken((err, tokens) => {
                // your access_token is now refreshed and stored in oauth2Client
                // store these new tokens in a safe place (e.g. database)
                console.log('user access token')
                  // After refreshing the token, you update the old one
                  updateToken(tokens, access.email, (err, results)=>{
                    if(err){
                      console.log(err)
                    }if(results){
                      // console.log(access.email)
                      // console.log(results)
                      // console.log('updated wave');
                      // console.log(tokens.access_token)
                      // console.log(tokens.refresh_token)
                    
                  
                    }
                   
                  })
                

                console.log(tokens)
                  return res.status(200).json({
                    success: 1,
                    token : tokens.access_token,
                  })
        
              });
          }else{
            return res.status(401).json({
              error:1,
              message: 'user does not exist',
            })
          }
        })
    },

    getNewStorage: async (req, res)=>{
      let access = res.decoded_access
      console.log(access.email)
      console.log(req.body)
      let {code} = req.body;
      const {tokens} = await oauth2Client.getToken(code);
      
      oauth2Client.setCredentials(tokens);

      // GET USER PROFILE DETAILS
      oauth3Client.setCredentials({access_token: tokens.access_token}); 
      const oath_user = google.oauth2({
          version: 'v2',
          auth: oauth3Client
        });
      let { data } = await oath_user.userinfo.get();    // get user info
        console.log(data.id);
        console.log(data.email);
        console.log('second wave');
  
        // oauth3Client.on('tokens', (tokens) => {
        //   if (tokens.refresh_token) {
        //     // store the refresh_token in my database!
        //     console.log(tokens.access_token);
        //   }
        // });

      // CHECK IF ALREADY IN DATABASE
      let email = access.email
      let user_id = access.user_id
      ifexist(email, (err, row)=>{
        console.log(access.email)
        if(err){

        }else{
     
          if(row && row.length){
            updateOld()
            console.log ('>>>>>>> email found')
          }else{
            createNew()
            console.log('email <<<<<< not found')
          }
        }

      })
      console.log('done')

      // STORE IN USER_GOOGLE DATABASE
      fs.writeFileSync("cred.json", JSON.stringify(tokens));

      function createNew (){
        storeToken(tokens, email, data.email, user_id, (err, results)=>{
          if(err){
            console.log(err)
          }if(results){
            console.log(results)
            console.log('created wave');
            console.log(tokens.access_token)
            console.log(tokens.refresh_token)
            return res.status(200).json({
              success: 1,
              token : tokens.access_token,
            })
          }
         
        })
      }

      function updateOld (){
        updateToken(tokens, email, (err, results)=>{
          if(err){
            console.log(err)
          }if(results){
            console.log(access.email)
            console.log(results)
            console.log('updated wave');
            console.log(tokens.access_token)
            console.log(tokens.refresh_token)
          
            return res.status(200).json({
              success: 1,
              token : tokens.access_token,
            })
          }
         
        })
      }


    },

    getDefaultAccess: (req, res)=>{

      // GET ALL OATH2 DATAAS JSON FROM DB
        defaultOauth2Data((err, _res)=>{
        
          if(err){
            console.log(err);
            return res.status(401).json({
                error: 1,
                message: err
              
            })
          }
          if(_res){
          
            console.log(_res)
            let tok_data = JSON.stringify({ 
              refresh_token: _res[0]['refresh_token'],
              access_token: _res[0]['access_token'],
              expiry_date: _res[0]['expiry_date'],
              id_token: _res[0]['id_token'],
              token_type: _res[0]['token_type'],
              scope: _res[0]['scope']
            })
            // console.log(tok_data);
            

            var json = JSON.parse(tok_data);
            // console.log(json);
        
              oauth2Client.setCredentials(json); 
        
              oauth2Client.refreshAccessToken((err, tokens) => {
                // your access_token is now refreshed and stored in oauth2Client
                // store these new tokens in a safe place (e.g. database)
                console.log('lets go//////////////////////////////')
                console.log(tokens)
                  return res.status(200).json({
                    success: 1,
                    token : tokens.access_token,
                  })
        
              });
          }
        })

  
        return;
    },

    refreshUser: (req, res)=>{
        //read refresh token from DB
        
        getUserOauth2Data((err, result)=>{
            if(err){
                console.log(err);
                return res.status(401).json({
                    error: 1,
                    message: err
                   
                })
            }
            if(result){
                let refresh_token = result.google_refresh_token
                oauth2Client.setCredentials(json); 

                oauth2Client.refreshAccessToken((err, tokens) => {
                    // your access_token is now refreshed and stored in oauth2Client
                    // store these new tokens in a safe place (e.g. database)
                    // console.log(tokens.access_token)
                    tok = tokens.access_token
                    res.send(`success:${tok}`)
                    fs.writeFileSync("cred.json", JSON.stringify(tokens));
                });
            }
        })

        // let read = fs.readFileSync('cred.json');
        // let json = JSON.parse(read);
        // console.log(json);



        //   refreshAccessToken()
        return;
    },

    refreshToken: (req, res)=>{
        return; 
    },

    getFolderId: (req, res)=>{
        async function createFolder(data, type, filename_) {
            const service = google.drive({version: 'v3',  auth: oauth2Client});
            const fileMetadata = {
              name: data,
              mimeType: 'application/vnd.google-apps.folder',
            };
            try {
              const file = await service.files.create({
                resource: fileMetadata,
                fields: 'id',
              });
              console.log('first FOLDER Id:', file.data.id);
              global.holdFileId = file.data.id;
            //   uploadFile(file.data.id, type, filename_)
            //   return file.data.id;
            } catch (err) {
              // TODO(developer) - Handle error
              throw err;
            }
        
        
          }
          createFolder()
        return;
    },

    getdata: async (req, res)=>{
      console.log('data gotten')
      const {code} = req.query;
      const {tokens} = await oauth2Client.getToken(code);
      console.log(tokens)
      oauth2Client.setCredentials(tokens);
      fs.writeFileSync("data.json", JSON.stringify(tokens));

      // let { data } = await oath_user.userinfo.get();    // get user info
      console.log('first wave');
      res.send('correct')
      // console.log(tokens.access_token)
      // console.log(tokens.refresh_token)
  
    },

    getsize: (req, res)=>{
        const files = req.file;

        // GET ACCESS TOKEN
        get_user_access_token((err, result)=>{

        })
        var read = fs.readFileSync('cred.json');
        var json = JSON.parse(read);

        console.log('files')
        console.log(files)
        let filesize = files.size
        console.log(files.size)
        return res.json({
          size:files.size
        })
    },

    auth: (req, res)=>{
      console.log(res.decoded_access.email)
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive"],
        });
    
        
        res.redirect(url);
    },

    redirect: async (req, res)=>{
        console.log(req.query)
        console.log(res.app_email)
        const {code} = req.query;
        const {tokens} = await oauth2Client.getToken(code);
        
        oauth2Client.setCredentials(tokens);

        // GET USERPROFILE DETAILS
        oauth3Client.setCredentials({access_token: tokens.access_token}); 
        const oath_user = google.oauth2({
            version: 'v2',
            auth: oauth3Client
          });
            let { data } = await oath_user.userinfo.get();    // get user info
          console.log(data.id);
          console.log(data.email);
          console.log('second wave');
    
          oauth3Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
              // store the refresh_token in my database!
              console.log(tokens.access_token);
            }
          });

        // CHECK IF ALREADY IN DATABASE

        ifexist(data.email, (err, res1)=>{
          console.log(res1.id)
          if(err){

          }else{
            if(res1.id !== null){
              updateOld()
              console.log('<<<<<< email found')
            }else{
              createNew()
              console.log('email <<<<<< not found')
            }
          }
  
        })
        console.log('done')

        // STORE IN USER_GOOGLE DATABASE
        fs.writeFileSync("cred.json", JSON.stringify(tokens));

        function createNew (){
          storeToken(tokens, data.email, (err, results)=>{
            if(err){
              console.log(err)
            }if(results){
              console.log(results)
              console.log('created wave');
              console.log(tokens.access_token)
              console.log(tokens.refresh_token)
            
            }
           
          })
        }

        function updateOld (){
          updateToken(tokens, data.email, (err, results)=>{
            if(err){
              console.log(err)
            }if(results){
              console.log(data.email)
              console.log(results)
              console.log('updated wave');
              console.log(tokens.access_token)
              console.log(tokens.refresh_token)
            
            }
           
          })
        }

        res.redirect('http://127.0.0.1:5502/dist/dashboard/home.html');
        return;




    },

    getuploadsession: (req, res)=>{
        return;
    },

    uploadchunk: async (req, res)=>{
        let b = req.query
        const files = req.file;
      
        // GET ACCESS TOKEN
        var read = fs.readFileSync('cred.json');
        var json = JSON.parse(read);
        let filesize = files.size
        const bufferStream = new Readable.PassThrough();
        bufferStream.end(files.buffer.subarray(b.start, b.end))
        const type = files.mimetype
        // console.log(type)
      
      
        console.log(`Has a starting byte of ${b.start} and ending of ${b.end - 1}`)
      
         request(
      
          {
            method: "PUT",
            url: req.body.url,
            headers: { 
              "Content-Range": `bytes ${b.start}-${b.end - 1}/${filesize}`,
              "Content-Length": `${b.end - b.start}`
           },
            mimeType: type,
            body: bufferStream
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
              sull:'success'
            })
            
          })      
    },

    uploadchunks: async (req, res)=>{
        let b = req.query
        const files = req.file;
      
        // GET ACCESS TOKEN
        var read = fs.readFileSync('cred.json');
        var json = JSON.parse(read);
        let filesize = files.size
        const bufferStream = new Readable.PassThrough();
        bufferStream.end(files.buffer.subarray(b.start, b.end))
        const type = files.mimetype
        // console.log(type)
      
      
        console.log(`Has a starting byte of ${b.start} and ending of ${b.end - 1}`)
      
         request(
      
          {
            method: "PUT",
            url: req.body.url,
            headers: { 
              "Content-Range": `bytes ${b.start}-${b.end - 1}/${filesize}`,
              "Content-Length": `${b.end - b.start}`
           },
            mimeType: type,
            body: bufferStream
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
              sull:'success'
            })
            
          })      
    },


}
