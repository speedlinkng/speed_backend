const {createRecord, getRecord, getRecordById, getSettingById, getRefreshTokenGoogle, getRefreshAndExchangeForAccess} = require('../services/create.services');
const {v4:uuidv4} = require("uuid")
const request = require("request");
const crypt = require("crypto")
const {google} = require('googleapis');
const shortid = require("shortid")
const date = require('date-and-time');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
dotenv.config();
const oauth3Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);


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
        // return res.status(200).json({
        //     status: 200,
        //     success: 1,
        //     message : 'connection successful',
        // })
    },
    addRecord: (req, res)=>{

        let access =  res.decoded_access
  
        let json = JSON.parse(res.tok_data);

        console.log(process.env.YOUR_CLIENT_ID)
        console.log(json)
        oauth3Client.setCredentials(json);
        const body = req.body
        let folder = body.folder
        let google_refresh_token = '' 
        let record_id = shortid()
        console.log(oauth3Client)

        // return 'd'
        
    async function createFolder(data) {
        const service = google.drive({version: 'v3',  auth: oauth3Client});
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
        //   return file.data.id;
        } catch (err) {
        // TODO(developer) - Handle error
        throw err;
        }


    }


        function firstQuery(folder_id){
            // FIRST GET HE RELATIVE LAST REFRESH_TOKEN USED IN USER_GOOGLE 
            getRefreshTokenGoogle(access.user_id, (err, google_res)=>{
                console.log(google_res)
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                }
                else if(google_res && google_res.length > 0){
                    google_refresh_token = google_res[0].refresh_token;      
                    console.log(`get refresh token from usergoogle ${google_refresh_token}`)
                    secondQuery(folder_id)
                }else{
                    console.log('then this')
                    return res.status(500).json({
                        status: 400,
                        error: 1,
                        message : err,
                    })
                }
                
            })
        }

        function secondQuery(folder_id){
            createRecord(body,folder_id, google_refresh_token, record_id, access.user_id, (err, results)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
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
                    id: record_id
                })
                }
    
            })
        }
        createFolder(folder)
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
                return res.status(500).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
            if(result && result.length > 0){
                let tok_data = JSON.stringify({ 
                    refresh_token: result[0]['refresh_token'],
                    access_token: result[0]['access_token'],
                    expiry_date: result[0]['expiry_date'],
                    id_token: result[0]['id_token'],
                    token_type: result[0]['token_type'],
                    scope: result[0]['scope']
                  })
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
            getSettingById(r_id, (err, results)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
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
                return res.status(401).json({
                    status: 401,
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
                    return res.status(700).json({
                        status: 700, //no result found
                        error: 1,
                        message : 'link expired',
                    })
                }else{
                    const currentDate = new Date();

                    const formattedDate = date.format(date.addDays(currentDate, +1), 'YYYY/MM/DD HH:mm:ss'); 
                    console.log(formattedDate) 

                }
                // console.log(results)
                return res.status(200).json({
                    status: 200,
                    success: 1,
                    data : results  
                })
            }else{
                return res.status(400).json({
                    status: 400, //no result found
                    error: 1,
                    message : 'no result found',
                })
            }

           
        })
    },

    getRecord: (req, res)=>{
        let access =  res.decoded_access
        console.log(access)
        getRecord(access.user_id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
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

    submitUpload: (req, res)=>{
        let access =  res.decoded_access
        console.log(access)
        submitUpload(access.user_id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }
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
}