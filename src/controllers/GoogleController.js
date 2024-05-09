const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {storeToken, ifexist, updateToken, defaultOauth2Data, oath2fromForm, myStorage, newStorage, updateUserZoom} = require('../services/google.services')
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
const JSZip = require('jszip');
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

    downloadFolderAsZip: async (req, res)=>{
    
      const user_google_id = parseInt(req.params.user_google_id);
      const folder = req.params.folder
      const storage_email = req.params.storage_email
      const record_id = req.params.record_id
      console.log(req.params.record_id)
      console.log(folder)
      console.log('######')
      let access = '' 

      // get user_google record from DB
      oath2fromForm(record_id, (err, res) =>{
        if(res){
          let tok_data = JSON.stringify({ 
            refresh_token: res[0]['google_refresh_token'],
            access_token: res[0]['google_access'],
            expiry_date: res[0]['google_expiry_date'],
            id_token: res[0]['google_id_token'],
            token_type: res[0]['google_token_type'],
            scope: res[0]['google_scope']
          })

          var json = JSON.parse(tok_data);
          oauth2Client.setCredentials(json); 
          oauth2Client.refreshAccessToken((err, tokens) => {
            if (err) {
                console.error('Error refreshing access token:', err);
            } else {
              console.log(tokens.access_token)
              dos(tokens.access_token)
              
            }
        });

        }
        if(err){
          console.log(err);
          return res.status(401).json({
              error: 1,
              message: err
          })
        }
      })

    async function dos(access_token){
      
        // await createZipFile(access_token)
        // return
        return res.status(200).json({
          success: 1,
          token : access_token,
        })

        // send access token to front end for download
    }

  
    
    async function createZipFile(tokens) {
  
    
        const driveService = google.drive({ version: 'v3', auth: oauth2Client });
    
        const folderId = '1yrwXRmIVjOpnMlCgIiHOE6TuqkKlBQGC';
        const zip = new JSZip();
    
        async function fetchFilesAndSubfolders(folderId, zipFolder) {
            const response = await driveService.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'nextPageToken, files(id, name, mimeType)'
            });
    
            const items = response.data.files;
    
            for (const item of items) {
                if (item.mimeType === 'application/vnd.google-apps.folder') {
                    // If it's a folder, create a subfolder in the zip and recursively fetch its contents
                    const subZipFolder = zipFolder.folder(item.name);
                    await fetchFilesAndSubfolders(item.id, subZipFolder);
                } else {
                    // If it's a file, add it to the current zip folder
                    const fileResponse = await driveService.files.get({
                        fileId: item.id,
                        alt: 'media'
                    });
                    zipFolder.file(item.name, fileResponse.data);
                }
            }
        }
    
        try {
            await fetchFilesAndSubfolders(folderId, zip);
            const content = await zip.generateAsync({ type: 'nodebuffer' });
            fs.writeFileSync('folder.zip', content);
            console.log('Zip file saved successfully.');
        } catch (error) {
            console.error('Error creating zip file:', error);
        }
    }

    

    async function createZipFiless(tokens) {
        // Use the tokens to authorize requests to Google Drive API
        const driveService = google.drive({ version: 'v3', auth: oauth2Client });
    
        // Get the folder's ID.
        const folderId = '1yrwXRmIVjOpnMlCgIiHOE6TuqkKlBQGC';
    
        // Create a zip file.
        const zip = new JSZip();
    
        // Further operations using the refreshed access token
        // For example, you can list files, upload files, etc.
    
        driveService.files.list({
            q: `'${folderId}' in parents`,
            fields: 'nextPageToken, files(id, name)'
        }).then((response) => {
            const files = response.data.files;
    
            // Download each file and add it to the zip file.
            Promise.all(files.map((file) => {
                return driveService.files.get({
                    fileId: file.id,
                    alt: 'media'
                }).then((response) => {
                    zip.file(file.name, response.data);
                });
            })).then(() => {
                // Generate the zip file asynchronously
                zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
                    // Save the zip file to the local filesystem
                    fs.writeFileSync('folder.zip', content);
                    console.log('Zip file saved successfully.');
                }).catch((err) => {
                    console.error('Error generating zip file:', err);
                });
            });
        }).catch((err) => {
            console.error('Error listing files:', err);
        });
    }
    
 
    },

    docToDrive: async (req, res)=>{
      // GET DEFAULT UDEER_GOOGLE DATA

      defaultOauth2Data((err, _res)=>{
        if(_res){
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
      
            startUpload()
        }
      })

      async function startUpload(){
        console.log( req.body.blobb)
          const drive = google.drive({ version: 'v3', auth: oauth2Client });
          try {
            const fileMetadata = {
                name: 'document.doc',
                mimeType: 'text/html',
                parents: [`${req.body.parents}`], // Replace with the ID of the destination folder in Google Drive
            };

            const media = {
                mimeType: 'text/html',
                body: req.body.blob
            };

            const res = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            console.log('File uploaded to Drive with ID:', res.data.id);
        } catch (error) {
            console.error('Error uploading to Drive:', error.message);
        }
      }
    },

  getMyStorage: (req, res) => {

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
            console.log(tok_data);
            

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

  
    getUserBackupDrive: async(req, res) => {
      // ----------------------------------------------------------------
      // Check if this request is coming for backup or from filestorage using utility
      // ----------------------------------------------------------------
      // if uility says its coming frm backup, update user_zoom table
      let access = res.decoded_access
      let role = 0;
      let createdFolder;
      let preferred = 1

      async function createFolderAllReply(name) {
   
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
        };

        try {
            let file = await services.files.create({
                resource: fileMetadata,
            });

            createdFolder = file.data.id
        
        } catch (err) {
            throw err;
        }
      }

      async function checkFolderExistsAllReply(folderName) {
      try {
        const res = await services.files.list({
          q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder'`,
          fields: 'files(id, name)'
        });
    
        const files = res.data.files;
    
        if (files.length) {
          console.log(`Folder '${folderName}' exists with ID: ${files[0].id}`);
          createdFolder = files[0].id;
    
        } else {
         
          await createFolderAllReply(folderName);
        }
      } catch (err) {
        console.error('The API returned an error: ' + err);
      }
      }
      
      
      let {code} = req.body;
      console.log('this is code: ',code)
      // console.log(req.body)
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
       
      const services = google.drive({version: 'v3',  auth: oauth2Client,  timeout: 60000 });
  
      await checkFolderExistsAllReply('Zoom Backup By Speedlink');

      // update user_zoom with the credentials provided
      let driveCredentials = JSON.stringify(tokens)
      updateUserZoom(driveCredentials, access,createdFolder,preferred, (err, row) => { 
        if (err) {
          console.log('an error occured'+err.message)
          return res.status(401).json({
            error: 1,
            message: err   
          })
        }
        return res.status(200).json({
          success: 1,
          token : tokens.access_token,
        })

      })
      


    },
    
    getNewStorage: async (req, res)=>{

      
      // Chcek if admin is making the call
      if(res.role == 'admin'){
        // set this as default, 
        role = 'default'
      }else{
        role = 'user'
      }
      let access = res.decoded_access
      let {code} = req.body;
      console.log('this is code: ',code)
      // console.log(req.body)
      const {tokens} = await oauth2Client.getToken(code);

   
      function updateOld (storage){
        console.log('updateOld'+allReplies)
        updateToken(tokens, email, storage, role, allReplies, (err, results)=>{
          if(err){
            console.log(err)
          }if(results){
           
            return res.status(200).json({
              success: 1,
              token : tokens.access_token,
            })
          }
         
        })
      }

      
      function createNew (){
        console.log('create'+allReplies)
       
        storeToken(tokens, email, data.email, user_id, role, allReplies, (err, results)=>{
          if(err){
            console.log(err)
          }if(results){
           
            return res.status(200).json({
              success: 1,
              token : tokens.access_token,
            })
          }
        
        })
      }

      oauth2Client.setCredentials(tokens);
  
      
        // initialize decoded access from middleware
        const services = google.drive({version: 'v3',  auth: oauth2Client,  timeout: 60000 });

        async function createFolderAllReply(name) {
            console.log('###########################')
            const fileMetadata = {
                name: name,
                mimeType: 'application/vnd.google-apps.folder',
            };
    
            try {
                let file = await services.files.create({
                    resource: fileMetadata,
                });

                allReplies = file.data.id
            
            } catch (err) {
                throw err;
            }
        }
        async function checkFolderExistsAllReply(folderName) {
          try {
            const res = await services.files.list({
              q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder'`,
              fields: 'files(id, name)'
            });
        
            const files = res.data.files;
        
            if (files.length) {
              console.log(`Folder '${folderName}' exists with ID: ${files[0].id}`);
              allReplies = files[0].id;
        
            } else {
             
              await createFolderAllReply(folderName);
            }
          } catch (err) {
            console.error('The API returned an error: ' + err);
          }
        }
        

        await checkFolderExistsAllReply('FORM SUBMISSION');
     

      
      // GET USER PROFILE DETAILS
      oauth3Client.setCredentials({access_token: tokens.access_token}); 
      const oath_user = google.oauth2({
          version: 'v2',
          auth: oauth3Client
        });
      let { data } = await oath_user.userinfo.get();    // get user info
        console.log(data.id);
        console.log('second wave');
  

      // CHECK IF ALREADY IN DATABASE
      let email = access.email
      let user_id = access.user_id
      let storage = data.email
      ifexist(email, (err, row)=>{
        console.log(access.email)
        if(err){

        }else{
     
          if(row && row.length){
            updateOld(storage)
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


            // CHECK IF DATE HAS EXPIRED
          
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
              1//03LpTiaHKt5U4CgYIARAAGAMSNwF-L9IrZoVd5nwRe2FiuEwzMuFAOKKbCx1w7oiVF0PBjTLdqSMtUgKbIF9VsN9Cd8LeFdK3PCo
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
            prompt: 'consent',
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive", 'https://www.googleapis.com/auth/drive.readonly'],
        });
    
        
        res.redirect(url);
    },

    redirect: async (req, res)=>{
        console.log(req.query)
        console.log(res.app_email)
        console.log('this is redirect')

        
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
              console.log('REFRESH TOKEN IS',tokens.refresh_token)
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

        res.redirect(process.env.FRONTEND_URL+'/dash');
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
