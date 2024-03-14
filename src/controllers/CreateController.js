const {createRecord,updateRecord, getRecord, getSubmissionById, getUploadRecordById, getRecordById, getSettingById, getRefreshTokenGoogle, getRefreshAndExchangeForAccess, updateexpired, getDefaultFolder} = require('../services/create.services');
const {getSubmittedRecordById, submitAndUpdate, submitFormReplies} = require('../services/submit.services');
const {v4:uuidv4} = require("uuid")
const request = require("request");
const crypt = require("crypto")
const {google} = require('googleapis');
const shortid = require("shortid")
const date = require('date-and-time');
const dotenv = require('dotenv');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
dotenv.config();
const oauth3Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);





module.exports = {

    refresh: (req, res)=>{
        //read refresh token from DB
        
        // getUserOauth2Data((err, result)=>{
        //     if(err){
        //         console.log(err);
        //         return res.status(401).json({
        //             error: 1,
        //             message: err
                   
        //         })
        //     }
        //     if(result){
                // 1//03LpTiaHKt5U4CgYIARAAGAMSNwF-L9IrZoVd5nwRe2FiuEwzMuFAOKKbCx1w7oiVF0PBjTLdqSMtUgKbIF9VsN9Cd8LeFdK3PCo
                // let refresh_token = result.google_refresh_token
                let refresh_token = '1//03LpTiaHKt5U4CgYIARAAGAMSNwF-L9IrZoVd5nwRe2FiuEwzMuFAOKKbCx1w7oiVF0PBjTLdqSMtUgKbIF9VsN9Cd8LeFdK3PCo'
                var read = fs.readFileSync('cred.json');
                var json = JSON.parse(read);
                oauth3Client.setCredentials(json); 

                oauth3Client.refreshAccessToken((err, tokens) => {
                    // your access_token is now refreshed and stored in oauth2Client
                    // store these new tokens in a safe place (e.g. database)
                    // console.log(tokens.access_token)
                    tok = tokens
                    res.send(tok)
                    fs.writeFileSync("cred.json", JSON.stringify(tokens));
                });
            // }
        // })

        // let read = fs.readFileSync('cred.json');
        // let json = JSON.parse(read);
        // console.log(json);

        //   refreshAccessToken()
        return;
    },


   
    updateRecord: async (req, res)=>{ 
        const body = req.body
       
        console.log(body.json)
        updateRecord(body.record_id, body.json, (err, results)=>{
            if(err){
                console.log(err)
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            if(results){
                console.log(results)
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results,
                })
            }
        })
    },

    addRecord: async (req, res)=>{    

        // initialize decoded access from middleware
        let access =  res.decoded_access
        let json = JSON.parse(res.tok_data);
        console.log(req.body)
        oauth3Client.setCredentials(json);

        // initialize services
        const service = google.drive({version: 'v3',  auth: oauth3Client});
        const body = req.body
        const page1Data = body.values.page1;
        // console.log(page1Data);
        const pages = Object.keys(body.values);

  

        if (pages.length > 0) {
            pages.forEach(pageName => {
                const pageData = body.values[pageName];
                console.log(`Processing data for ${pageName}:`, pageData);   
                const uniqueFieldNames = Object.keys(Object.assign({}, ...pageData));
                console.log(`Unique field names for ${pageName}: ${uniqueFieldNames}`);
                // Perform your action for each page here
                // You can access the data for the current page using pageData
            });
            

            console.log(`There are ${pages.length} pages in the JSON file.`);
            // Access each page data using data.values[pageName]
        } else {
            console.log('There is only one page in the JSON file.');
            // Access the single page data using data.values[pages[0]]
        }

        let folder = body.filesandFolder.chosen_folder
        let group_by = body.filesandFolder.group_by
        let folder_id = body.filesandFolder.folder_id
        let google_refresh_token = '' 
        let userGoogleRow_id = ''
        let record_id = shortid()
       
        // console.log(oauth3Client)

    
       
console.log('check exist')
console.log(folder_id)
    if(folder_id != ''){
        // This means the user selected a google folder that already exists
        // In this case, skip checkFolderExists and createFolder
        console.log('true')
        console.log('true')
        firstQuery(folder_id)
    }else{
        console.log('else')
        console.log('else')

        checkFolderExists(folder)
    }

    // return check if folder already exists, if it dosent, create one
    async function checkFolderExists(folder_name) {
        console.log('_______))))))))))))))))')
        console.log(folder_name)
        service.files.list(
            {
              q: `name = '${folder_name}' and mimeType = 'application/vnd.google-apps.folder'`,
              fields: 'files(id, name)',
            },
            (err, res) => {
              if (err) return console.error('The API returned an error: ' + err);
              const files = res.data.files;
              if (files.length) {
                // createSubFolder(files[0].id)
                console.log(`Folder '${folder_name}' exists with ID: ${files[0].id}`);
                firstQuery(files[0].id)
              } else {
                console.log(`Folder '${folder_name}' does not exist.`);
                createFolder(folder_name)
              }
            }
          );
    }

    
        // Create SUB FOLDERS if it dosent already exists
        async function createSubFolder(id) {
            fileMetadata = {
                'name' : 'sub1',
                'parents' : [id],
                'mimeType' : 'application/vnd.google-apps.folder'
                }

            
            try {
                let file = await service.files.create({
                    resource: fileMetadata,
                    // fields: 'id',
                });
                console.log('first FOLDER Id:', file.data.id);
        
                firstQuery(file.data.id)
                // return file.data.id;
            } catch (err) {
            // TODO(developer) - Handle error
            throw err;
            }

        }


        // Create folder if it dosent already exists
        async function createFolder(data) {
            const fileMetadata = {
            name: data,
            mimeType: 'application/vnd.google-apps.folder',
            };

            
            try {
            let file = await service.files.create({
                resource: fileMetadata,
                // fields: 'id',
            });
            console.log('first FOLDER Id:', file.data.id);
    
            firstQuery(file.data.id)
            // return file.data.id;
            } catch (err) {
            // TODO(developer) - Handle error
            throw err;
            }

        }

        function firstQuery(new_folder_id){
            console.log('folder_id 2')
            console.log(access.user_id)
            // console.log(body)
            // FIRST GET THE RELATIVE REFRESH_TOKEN IN USER_GOOGLE FOR THIS USER
            // this is not needed 
            getRefreshTokenGoogle(access.user_id, body, (err, google_res)=>{
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@')
                console.log(body.preferred )
                console.log(new_folder_id)
                if(err){
                   
                    return res.status(400).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                }
                else if(google_res && google_res.length > 0){

                    google_refresh_token = google_res[0].refresh_token;      
                    google_storage_email = google_res[0].storage_email;
                    userGoogleRow_id = google_res[0].id
                    // console.log('store_email 1:'+google_storage_email)      
                    // console.log(`get refresh token from usergoogle ${google_refresh_token}`)
                    secondQuery(new_folder_id, google_storage_email)
                }else{
    
                    return res.status(300).json({
                        status: 300,
                        error: 1,
                        message : err,
                    })
                }
                
            })
        }

        function secondQuery(new_folder_id, google_storage_email){
            console.log('store_email 2:'+new_folder_id) 
            // console.log('b_token is:' +body.b_token) 
            createRecord(body, new_folder_id, google_refresh_token, google_storage_email, record_id, access.user_id, userGoogleRow_id, (err, results)=>{
                if(err){
                    console.log(err);
                    return res.status(400).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                }
                if(results){
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results,
                    id: record_id,
                   
                })
                }
    
            })
        }
       
        // createFolder(folder)
        // return 'ok'
    },
    
    getSettingById:(req, res)=>{
        let upload_token = ''
        let r_id = req.params.id
        console.log(r_id)
        // while getting the settings, also get the access token from the refresh token
        // remember refresh token expires after 5 days, so the link is only valid for 5 days
        getRefreshAndExchangeForAccess(r_id,(err, result)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            console.log('this is the refresh token: '+result[0]['refresh_token'])
            if(result && result.length > 0){
                let tok_data = JSON.stringify({ 
                    refresh_token: result[0]['refresh_token'],
                    access_token: result[0]['access_token'],
                    expiry_date: result[0]['expiry_date'],
                    id_token: result[0]['id_token'],
                    token_type: result[0]['token_type'],
                    scope: result[0]['scope']
                  })
                  console.log(tok_data)
                var json = JSON.parse(tok_data);
                oauth3Client.setCredentials(json); 
                google_refresh_token = result[0].refresh_token;      
                oauth3Client.refreshAccessToken((err, tokens) => {
                    // your access_token is now refreshed and stored in oauth2Client
                    // store these new tokens in a safe place (e.g. database)
                   
                    upload_token = tokens.access_token
                    console.log(upload_token)
                    setings(upload_token)
                  });
            }
        })
        function setings(a_token){
            console.log('a_token:'+a_token)
            getSettingById(r_id, (err, results)=>{
                if(err){
                    console.log(err);
                    return res.status(400).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                }
    
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results,
                    token:a_token  
                })
            })
        }
    },

    getRecordById: (req, res)=>{
        let r_id = req.params.id
        getRecordById(r_id, (err, results)=>{
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
                console.log('date1:'+date1)
                console.log('date2:'+date2)
                if(date1 > date2 ){
                
                    return res.status(301).json({
                        status: 301, //no result found
                        error: 1,
                        message : 'link expired',
                    })
                }else{
                    const currentDate = new Date();

                    const formattedDate = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
                    console.log(formattedDate) 

                }
                if(results.status == 'completed'){
                    return res.status(303).json({
                        status: 303, //no result found
                        error: 1,
                        message : 'Record completed',
                    }) 
                }
                
                // console.log('b_token'+ results.b_token)
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results  
                })
            }else{
                return res.status(300).json({
                    status: 300, //no result found
                    error: 1,
                    message : 'no result found',
                })
            }

           
        })
    },

    /*
    // OldgetRecord: (req, res)=>{
    //     let access =  res.decoded_access
    //     // console.log(access)
    //     getRecord(access.user_id, (err, results)=>{
    //         if(err){
    //             console.log(err);
    //             return res.status(400).json({
    //                 status: 400,
    //                 error: 1,
    //                 message : err,
    //             })
    //         }
    //         function setExpired(element){
    //             let date1 = new Date();
    //             let date2 = new Date(element.expiry_date); 
    //             if(date1 > date2 ){
    //                 updateexpired(access.user_id, (err, res)=>{
                        
    //                 })
    //             }else{
    //                 console.log(element.status)
    //             }
    //         }
            

            
    //         // SET EXPIRED IN THE DB FOR RECORD
    //         results.forEach(element => {
    //             console.log(element.id)
    //             setExpired(element)
    //         });
           

    //         let rez = []
    //         results.forEach(ress => {
    //             rez.push(ress)
    //         });

            
    //         let js = JSON.stringify(rez)
    //         // console.log(js)
    //         return res.status(200).json({
    //             status: 200,
    //             success: 1,
    //             data : rez  
    //         })
    //     })
    // },*/

    
    // POSTGRESS
    
    getRecord: (req, res)=>{
        let access =  res.decoded_access
        // console.log(access)
        getRecord(access.user_id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
  
            
            function setExpired(element){
                let date1 = new Date();
                let date2 = new Date(element.expiry_date); 
                if(date1 > date2 ){
                    updateexpired(access.user_id, (err, res)=>{
                        
                    })
                }else{
                    console.log(element.status)
                }
            }
            

            
            // SET EXPIRED IN THE DB FOR RECORD
            results.forEach(element => {
                console.log(element.id)
                setExpired(element)
            });
           

            let rez = []
            results.forEach(ress => {
                rez.push(ress)
            });

            
            let js = JSON.stringify(rez)
            // console.log(js)
            return res.status(200).json({
                status: 200,
                success: 1,
                data : rez  
            })
        })
    },

    getSubmissionById: (req, res) =>{
        console.log(req.params.record_id,)
        getSubmissionById(req.params.record_id, (err, results)=>{
            console.log(results)
            if(err){
                console.log(err);
                return res.status(401).json({
                    status: 401,
                    error: 1,
                    message : err,
                })
            }
            if(results){
                console.log('success');
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results  
                })
            }
        })
    },

    getUploadRecordById_: (req, res) =>{
        console.log(req.params.record_id)
        let upload_token;
   

        getRefreshAndExchangeForAccess(req.params.record_id, (err, result)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            console.log(result)
            console.log('~~~~~~~~~~~~~~~~~~~~~~~')
            console.log('this is the refresh token: '+result[0]['refresh_token'])
            if(result && result.length > 0){
                let tok_data = JSON.stringify({ 
                    refresh_token: result[0]['refresh_token'],
                    access_token: result[0]['access_token'],
                    expiry_date: result[0]['expiry_date'],
                    id_token: result[0]['id_token'],
                    token_type: result[0]['token_type'],
                    scope: result[0]['scope']
                  })
                  console.log(tok_data)
                var json = JSON.parse(tok_data);
                oauth3Client.setCredentials(json); 
                google_refresh_token = result[0].refresh_token;      
                oauth3Client.refreshAccessToken((err, tokens) => {
                    // your access_token is now refreshed and stored in oauth2Client
                    // store these new tokens in a safe place (e.g. database)
                   
                    upload_token = tokens.access_token
                    console.log(upload_token)
                    console.log('upload_token')
                    console.log('upload_token')
                    console.log('upload_token')
                    console.log('upload_token')
                    console.log(upload_token)
                    console.log(upload_token)
                    console.log(upload_token)
                    console.log(upload_token)
                 
                  });
            }
        })
       
        getUploadRecordById(req.params.record_id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(401).json({
                    status: 401,
                    error: 1,
                    message : err,
                })
            }
    
            
            if(results && results.id){
                 console.log('page exist')
                 console.log(upload_token)
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data: {
                        recordData: results,
                        uploadToken: upload_token,
                    },
                    //.json_data.values.page1[0].headers.edit_submit_field  
                })
            }else{
                console.log('page doesnot exist')
                return res.status(401).json({
                    status: 404,
                    error: 1,
                    message : 'Page does not exist',
                })
            }
        })
   
    },


    // USE THIS
    getUploadRecordById: async (req, res) => {
        console.log(req.params.record_id);
        let upload_token;
        let defaultFolder = ''

        getDefaultFolder((err, res_all_replies) => {
            if (err) {
                console.log(err);
              
            } else {
                defaultFolder = res_all_replies[0].all_replies
                console.log('###############dddddddddddddds')
                console.log(res_all_replies[0].all_replies)
           
            }
        });
    
        const getRefreshTokenAndExchange = async () => {
            try {
                const result = await new Promise((resolve, reject) => {
                    getRefreshAndExchangeForAccess(req.params.record_id, (err, result) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
    
                console.log('this is the refresh token: ' + result[0]['refresh_token']);
    
                if (result && result.length > 0) {
                    let tok_data = JSON.stringify({
                        refresh_token: result[0]['refresh_token'],
                        access_token: result[0]['access_token'],
                        expiry_date: result[0]['expiry_date'],
                        id_token: result[0]['id_token'],
                        token_type: result[0]['token_type'],
                        scope: result[0]['scope'],
                    });
    
                    console.log(tok_data);
    
                    var json = JSON.parse(tok_data);
                    oauth3Client.setCredentials(json);
                    google_refresh_token = result[0].refresh_token;
    
                    // Wrap the refreshAccessToken function in a Promise
                    const tokens = await new Promise((resolve, reject) => {
                        oauth3Client.refreshAccessToken((err, tokens) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                resolve(tokens);
                            }
                        });
                    });
    
                    upload_token = tokens.access_token;
                    console.log(upload_token);
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        };
    
        const getRecordAndSendResponse = async () => {
            try {
                const results = await new Promise((resolve, reject) => {
                 
                    getUploadRecordById(req.params.record_id, (err, results) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
         
    
                if (results && results.id) {
                    console.log('page exist');
                    console.log(
                        {
                            recordData: results,
                            uploadToken: upload_token,
                            allReplies: defaultFolder
                        }
                    );
                    return res.status(200).json({
                        status: 200,
                        success: 1,
                        data: {
                            recordData: results,
                            uploadToken: upload_token,
                            allReplies: defaultFolder
                        },
                        // .json_data.values.page1[0].headers.edit_submit_field
                    });
                } else {
                    console.log('page does not exist');
                    return res.status(401).json({
                        status: 404,
                        error: 1,
                        message: 'Page does not exist',
                    });
                }
            } catch (error) {
                console.error(error);
                return res.status(401).json({
                    status: 401,
                    error: 1,
                    message: error.message,
                });
            }
        };
    
        // Call the functions sequentially
        getRefreshTokenAndExchange()
            .then(getRecordAndSendResponse)
            .catch((error) => {
                console.error(error);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message: error.message,
                });
            });
    },
    


    
    submitReplies: (req, res)=>{
        let record_id =  req.body.record_id
        // only upload if the link has not expired and
        // if the expected update fields arnt already updated
        //get record_id details
 

        function sendEmail(){
            
        }
        submitFormReplies(req.body, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            sendEmail();
            return res.status(200).json({
                status: 200,
                success: 1,
                submit_id: results
                  
            })
        })
    },
}