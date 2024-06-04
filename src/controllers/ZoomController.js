const express = require('express');
// const WebSocket = require('ws');
const axios = require('axios');
const { google } = require('googleapis');
const querystring = require('querystring');
const {save_user_zoom, if_exists, fetch_user_zoom, store_recordings_data, checkDrive, fetchRecordsForBackup, update_zoom_recordings, fetchBackupEvent, updateBackupStatusForUser, getAllRecordsFromDB} = require('../services/zoom.services');
const refreshAccessToken = require('../middlewares/refreshZoomAccess');
const { v4: uuidv4 } = require('uuid');
const app = express();
console.log('ZOOM CONTROLLER---')

const oauth3Client = new google.auth.OAuth2(
  process.env.YOUR_CLIENT_ID,
  process.env.YOUR_CLIENT_SECRET,
  process.env.YOUR_REDIRECT_URL
);

// const clientID = 'J38UYpAXQlqlydq5dIn58Q';
// const clientSecret = 'G3gbxPjt5GKRNEaMTsYRvpZFM2IlO7vY';
// const redirectURI = 'http://localhost:5000/api/zoom/callback'; // Update with your actual redirect URI
const clientID = 'J1NkT84YTsu_ZhjGYLAbiQ';
const clientSecret = 'lKLFc145Ekp570kcafjVW2XbUL87NH7i';
const redirectURI = `${process.env.BACKEND_URL}/api/zoom/callback`; // Update with your actual redirect URI


function formatFileSize(totalSize) {
  if (totalSize < 1024) {
      return totalSize + ' bytes';
  } else if (totalSize < 1024 * 1024) {
      return (totalSize / 1024).toFixed(2) + ' KB';
  } else if (totalSize < 1024 * 1024 * 1024) {
      return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
      return (totalSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}
// Function to download the file from the source
async function downloadFile(url, onDownloadProgress) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        onDownloadProgress,
        timeout: 60000 // 60 seconds timeout
    });
    return response.data;
}

// Function to authenticate with Google Drive
async function authenticateWithDrive() {
  return google.drive({ version: 'v3', auth: oauth3Client });
}

// Function to upload the file to Google Drive
const progressStream = require('progress-stream');

async function uploadFile(drive, fileName, fileStream, onUploadProgress, downloadFolder_id) {
  const fileMetadata = {
    name: fileName,
    parents: [downloadFolder_id] // Replace folderId with the ID of the folder you want to upload the file to
  };

  const media = {
    mimeType: 'application/octet-stream',
    body: fileStream
  };

  const totalBytes = fileStream.byteLength || fileStream._readableState.length;

  const progress = progressStream({ length: totalBytes, time: 100 });

  progress.on('progress', (progress) => {
    onUploadProgress({
      bytesRead: progress.transferred,
      total: progress.length,
      percent: progress.percentage
    });
  });

  fileStream.pipe(progress);

  const res = await drive.files.create({
    resource: fileMetadata,
    media: {
      mimeType: 'application/octet-stream',
      body: progress
    },
    fields: 'id'
  });

  console.log('File uploaded with ID:', res.data.id);
}


// Main function
async function main(download_url, file_name, downloadFolder_id, socket) {

  const sourceUrl = download_url ;
    const fileName = file_name ;

    // Variables to track progress
    let bytesDownloaded = 0;
    let bytesUploaded = 0;

    // Download progress callback
    const onDownloadProgress = (progressEvent) => {
        bytesDownloaded = progressEvent.loaded;
      console.log(`Downloaded ${formatFileSize(bytesDownloaded)} bytes of ${fileName}`);
      socket.emit('download_progress', { fileName, bytesDownloaded, bytesUploaded });

    };

     // Upload progress callback
  const onUploadProgress = (progressEvent) => {
    bytesUploaded = progressEvent.bytesRead;
    console.log(`Uploaded ${formatFileSize(bytesUploaded)} bytes of ${fileName}`);
    socket.emit('upload_progress_name', { fileName});
    socket.emit('upload_progress', { fileName, bytesUploaded,bytesDownloaded  });
  };

    // Download the file from the source
    const fileStream = await downloadFile(sourceUrl, onDownloadProgress);

    // Authenticate with Google Drive
    const drive = await authenticateWithDrive();

    // Upload the file to Google Drive
  await uploadFile(drive, fileName, fileStream, onUploadProgress, downloadFolder_id);
  console.log('UPDATE DB RECORDS')

}

// Execute main function
// main().catch(console.error);


async function getUserId(accessToken) {

    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data.id;
    } catch (error) {
        console.error('Error fetching user ID:', error.response ? error.response.data : error.message);
        return null;
    }
}


module.exports = {

  // GET ALL RECORDINGS FROM ZOOM AND SAVE ALL FROM 4 YEARS BACK
  // --------------------------------
  // Authenticate user to know whch drive they want to use for Backup
  // --------------------------------
  // GET ALL RECORDINGS FROM THE DB
  // --------------------------------
  // CREATE folders in google drive for each record
  // --------------------------------
  // Save the folders id created for each record in the database
  // --------------------------------
  // Backup each record to the google drive folder

  test: async (req, res) => { 
console.log('TESTING BACK')
  },
  recordingDB: async (req, res) => { 
    // --------------------------------
    // Get record data from database
    let access = res.decoded_access
    getAllRecordsFromDB(access.user_id, (err, results) => { 
   
      if(err){      
        return res.status(400).json({
            status: 400,
            error: 1,
            message : err,
        })
      }
      
      else if (results && results.length > 0) { 
        console.log(200)
        
          return res.status(200).json({
              success: 1,
              data : results,
          })     
      }
      else{
          return res.status(402).json({
              status: 402,
              error: 1,
              message : 'No record to backup',
          })
      }

    })
  },

fetchBackupEvent: async (req, res) => {
    let access = res.decoded_access
    fetchBackupEvent(access,(err, results) => { 
      if (err) { 
        console.error('Error fetching backup event:', err);
        res.status(500).json({ error: 'Error fetching backup event' });
        return;
      }
     
      res.status(200).json({ message: 'Backup event fetched successfully', data: results });
    })
  },

backup: async (req, res, io) => {
    console.log('dan')
    const socket = req.app.get('io'); 
    // ... use the 'socket' object for progress updates ...
    // socket.emit('download_progress_', { fileName: 'myfile.zip', bytesDownloaded: 10240 }); 
    // console.log(socket)
    
  const session = req.session;
  const socketId = req.body.socketId;
   
  const sockets = io.sockets.sockets.get(socketId);
  // socket.emit('download_progress_', { fileName: 'myfile.zip', bytesDownloaded: 'gin' }); 

  if (!socket) {
    return res.status(400).send({ error: 'Socket not found' });
  }

  let access = res.decoded_access
  let tok_data = res.tok_data
  let selectedDataForBackup = req.body.selectedDataForBackup;
  let createdSubFolder
  let selectedID 
  let selectedUUID
  let credentials = ''
  let file_id = ''
  let getTopicId;

  // ------------------------------------------
  // Extract the IDs from selectedDataForBackup

  let ids = selectedDataForBackup.map(data => data.id);
  

    async function checkBatchFolderExist(targetFolder, driveFolder, service) {
      return new Promise((resolve, reject) => {
        // console.log(targetFolder)
          service.files.list(
              {
                  q: `name = '${targetFolder.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder'`,
                  fields: 'files(id, name)',
              },
              (err, res) => {
                  if (err) {
                      console.error('The API returned an error: ' + err);
                      reject(err);
                  } else {
                      const files = res.data.files;
                      if (files.length) {
                          console.log('files and folders exist.');
                          resolve({truth: true, files: files[0].id});
                      } else {
                          console.log(`Folder does not exist.`);
                          resolve({truth:false, files: null});
                      }
                  }
              }
          );
      });
    }

    async function createFolder(targetFolder, service) {
      return new Promise((resolve, reject) => {
        // console.log(targetFolder)
          const fileMetadata = {
              'name': targetFolder,
              'mimeType': 'application/vnd.google-apps.folder'
          };
          service.files.create({
              resource: fileMetadata,
              // fields: 'id',
          }, (err, file) => {
              if (err) {
                  console.error('Error creating subfolder:', err);
                  reject(err);
              } else {
                  // console.log('SUB FOLDER Id:', file.data.id);
                  resolve(file.data.id);
              }
          });
      });
    }
  
    async function createSubfolder(targetFolder, parentFolder, service) {
      return new Promise((resolve, reject) => {
        // console.log(targetFolder)
          const fileMetadata = {
              'name': targetFolder,
              'parents': [parentFolder],
              'mimeType': 'application/vnd.google-apps.folder'
          };
          service.files.create({
              resource: fileMetadata,
              // fields: 'id',
          }, (err, file) => {
              if (err) {
                  console.error('Error creating subfolder:', err);
                  reject(err);
              } else {
                  // console.log('SUB FOLDER Id:', file.data.id);
                  resolve(file.data.id);
              }
          });
      });
    }
    
    async function createFoldersForRecords(access, driveFolder, service) {
      // ----------------------------------------------------------------
      // Loop through all the record DB for this user
      // ----------------------------------------------------------------
      // and create folders for each of them inside the atch subfolder
   
        fetchRecordsForBackup(access, ids, async (err, _results) => {
          if (err) {
            return res.status(400).json({
              error: 1,
              data: err.message,
            })
          }
      
          // -----------------------------------
          // Create a subfolder BatchedRecord
          console.log('results')
          console.log(_results.totalSize)
          socket.emit('total_size', { size: _results.totalSize, times2: (_results.totalSize*2) }); 

          const results = _results.rows
          // console.log(results)
          if (results.length == 0) { 
            // return " these recordings hve been bce up"
            return res.status(400).json({
              error: 1,
              reason: 'backed_up_already',
              message:'this recording has been backed up already',
            })
          }
          
          const {truth, files} = await checkBatchFolderExist('BATCH_'+results[0].batch_id, driveFolder, service)
          if (truth == false) {
            createdSubFolder = await createSubfolder('BATCH_'+results[0].batch_id, driveFolder, service)
            // get the file id
            file_id = createdSubFolder
          } else {
            file_id = files
            // console.log('trues',file_id)
            // get th fileid directly
          }
          console.log('WAIT A MINUTE',results.length)
         
          const promises = results.map(async (record, index) => {
           
            const {truth, files} = await checkBatchFolderExist(record.recording_data.topic, file_id, service)
            
            if (truth == false) {
               getTopicId = await createSubfolder(record.recording_data.topic, file_id, service)
           
            } else { 
               getTopicId = files
         
            }
            // console.log(record)
            // console.log(record.recording_data.id)
            // console.log(record.recording_data.topic)
            return { topicId: getTopicId, index, record};
            // --------------------------------
         
          })

          // update user backup status
          // --------------------------------
          updateBackupStatusForUser(access.user_id, true, async (err, results) => { 
            if (err) {
              console.log(err);
            }
          })

           // Wait for all promises to resolve
          const results_ = await Promise.all(promises);
          let f_name = ''
          const limitedFiles = results_.slice(0, 2);
          await Promise.all(limitedFiles.map(async (record, index) => {
            console.log('CUREENT TOPIC:' + record.record.recording_data.topic)
            await Promise.all(record.record.recording_data.recording_files.map(async (files, next_index) => {
              //file name is
              if (files.recording_type == 'shared_screen_with_speaker_view') {
               
                f_name =   `${files.meeting_id}_video.${files.file_extension}`
              } else if (files.recording_type == 'audio_only') {
                f_name =   `${files.meeting_id}_audio.${files.file_extension}` 
              } else if (files.recording_type == 'chat_file') { 
                f_name =   `${files.meeting_id}_chat.${files.file_extension}`
              } else {
                
              }
                try {
                  console.log('For ' + record.record.recording_data.topic+ f_name)
                  socket.emit('backup_in_progress', { id: record.record.id  });
                  await main(files.download_url, f_name, record.topicId, socket)
                  
                } catch (error) {
                  console.log('main error '+ error.message) 
                }
            
            }))
            console.log('DB RECORDS')
              update_zoom_recordings(access.user_id, record.record.id, async (err, results) => { 
                socket.emit('backup_complete', { id: results });
                console.log(results ,'emit')
              })
           }))
          // console.log(results_);
          // (results_[0].recording_files).map(async (file, index) => {
          //   console.log(file.play_url)
          // });
          
          updateBackupStatusForUser(access.user_id, false, async (err, results) => {

          })
          return res.send(results_)
        })

    } 
    
    async function getDriveCredentials(access) {
      // Use users id to check which drive they want to use for backup from "user_zoom"
      return new Promise((resolve, reject) => {
        checkDrive(access, (err, result) => {
          if (err) {
            reject(err);
          }
    
          // console.log('FROM DB', result[0].drive_credentials)
          // console.log(result[0].drive_folder)

          const credentials_ = result[0].drive_credentials;
          const driveFolder = result[0].drive_folder; // Add any other data you want to pass here
          resolve({ credentials_, driveFolder });
        })
      })
    }
      
    // GET user_zoom googledrive credentials

    if (req.body.preferred == 0) {
      credentials = tok_data
      let json = JSON.parse(credentials);
      oauth3Client.setCredentials(json); 
      let service = google.drive({ version: 'v3', auth: oauth3Client });
      // --------------------------------
      // This creates all the necessary folders and sub folders  required
      // --------------------------------s
      // The user email is used to create the subfolder where his backup will be stored
      let arrayOfFolders = ['SPEEDLINK DEFAULT BACKUP', access.email]
      // initialize
      let driveFolder 
      for (let i = 0; i < arrayOfFolders.length; i++) { 
        const {truth, files} = await checkBatchFolderExist(arrayOfFolders[i], null, service)
        if (truth == false) {
          if (i == 0) {
            driveFolder = await createFolder(arrayOfFolders[i], service)

          } else {
            driveFolder = await createSubfolder(arrayOfFolders[i], createdSubFolder, service)

          }
          file_id = driveFolder
        } else {
          file_id = files
        }

      }
      createFoldersForRecords(access, driveFolder, service);
    } else {

      try {
       const {credentials_, driveFolder} = await getDriveCredentials(access);
        // console.log("YOUR CREDENTIALS HERE IS", credentials_);
        // console.log("YOUR driveFolder HERE IS", driveFolder);
        
        let json = credentials_;
        oauth3Client.setCredentials(json); 
        let service = google.drive({ version: 'v3', auth: oauth3Client });
        // console.log(oauth3Client)
        

        createFoldersForRecords(access, driveFolder, service);
      } catch (error) {
          console.error("Error getting drive credentials:", error);
          return res.status(400).json({
              error: 1,
              data: error.message,
          });
      }
    }
  
  // main().catch(console.error);

},
  
refresh: (req, res)=>{
  let access = res.decoded_access
  console.log(access)
  console.log('REFRESHING...')
  
    if_exists(access.user_id, (err, results)=>{
      if(err){
        return res.status(400).json({
          error: 1,
          data : 'not exist',
        })
        console.log(err)
      }
      
        
      if(results.rowCount > 0){
        // console.log('exists')
        return res.status(200).json({
          success: 1,
          data : 'exists',
        })
      }else{
        return res.status(400).json({
          error: 1,
          data : err,
        })
      }
    

    }) 

},

  
Authorize: (req, res)=>{
  let access = res.decoded_access
  const redirectURI_ = `${process.env.BACKEND_URL}/api/zoom/callback/${access.user_id}`; // Update with your actual redirect URI
  console.log(redirectURI_)  
  const authorizeURL = 'https://zoom.us/oauth/authorize';
    const queryParams = {
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirectURI_,
    };
  
    const authorizationURL = `${authorizeURL}?${querystring.stringify(queryParams)}`;
    console.log(authorizationURL)
    // res.redirect(authorizationURL);
    return res.status(200).json({
      success: 1,
      data : authorizationURL,
  })
},


meeting: async (req, res) => {
  
    let access = res.decoded_access
    var accessToken = '';
    let refreshToken = '';
    let zoomUserId = '';
    fetch_user_zoom(access.user_id, (err, results)=>{
  
      if(results.rowCount > 0){
        refreshToken = results.rows[0].refresh_token 
        zoomUserId =   results.rows[0].zoom_user_id 
  
        runOtherFunctions()
      }
      if(err){
        console.log(err)
        return res.status(400).json({
          error: 1,
          data : err,
        })
      }
  
    }) 
    async function getMeetings() {
      try {
        // Use the accessToken to fetch user meetings
        const meetingsEndpoint = 'https://api.zoom.us/v2/users/me/meetings'; // Replace 'me' with your actual user ID if needed
        const meetingsResponse = await axios.get(meetingsEndpoint, {
          headers: {
            Authorization: `Bearer eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjdlMTZlMmUzLTcyZDYtNDEyZC05NjY4LTAyNzFjZGRiODA2ZCJ9.eyJ2ZXIiOjksImF1aWQiOiI2ZGI5MDgyNzhmMThmNDI0YTE1ZjNhZTI3ZjI4OGM1ZiIsImNvZGUiOiJ5cDRFaDFpcElDT2JaMWJaZ0lpVE1pRGNmYklhTklMNlEiLCJpc3MiOiJ6bTpjaWQ6SjM4VVlwQVhRbHFseWRxNWRJbjU4USIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiI1OGxpQkNLNlR2dWVIWTQwRktOMjR3IiwibmJmIjoxNzEwMzcyMzc1LCJleHAiOjE3MTAzNzU5NzUsImlhdCI6MTcxMDM3MjM3NSwiYWlkIjoiWjZ0U3RpQXBUZjJlRGdHcVVpMW5yZyJ9.isIPGV7jqyd6nrhLrb3ePQUviZniMjGmeMYLTTMWbcoWYzOiipbdYWMCR6csUE5rgfrkjDpiTlA0rqWHXpDNyg`,
          },
        });

        // Process the meetings data as needed
        const userMeetings = meetingsResponse.data;
        res.send(`User Meetings: ${JSON.stringify(userMeetings)}`);
      } catch (error) {
        console.error('Error exchanging code for token or fetching meetings:', error.message);
        res.status(500).send('Error exchanging code for token or fetching meetings');
      }
    }

  async function runOtherFunctions(){

    // console.log('running other functions')
    // console.log(refreshToken)
    await refreshAccessToken(clientID, clientSecret, refreshToken)
    .then(newAccessToken => {
        if (newAccessToken) {
            accessToken = newAccessToken
            console.log('New access token:', newAccessToken);
        } else { 
          console.log('Failed to refresh access token.');
          return res.status(400).json({
            status: 400,
            error: 1,
            reason: 'refresh_changed',
            message:'Failed to refresh access token.',
          })
        }
    })
    .catch(error => {
      console.error('Error:', error);
      return res.status(400).json({
        status: 400,
        error: 1,
        message:error,
      })
    });


    await getMeetings()
      .then(recordings => {
          if (recordings) {
            const playUrls = [];
            const downloadUrls = [];
              // console.log('Meeting recordings:',  recordings.meetings[0].recording_files);
             
              // const recordingFiles = recordings.meetings[0].recording_files;
              //  playUrls = JSON.stringify(recordingFiles.map(file => file.play_url));
              //  downloadUrl = JSON.stringify(recordingFiles.map(file => file.download_url));

            
              
              recordings.meetings.flatMap(meeting => {
                meeting.recording_files.map(file => {
                  playUrls.push(file.play_url); // Push play_url to the array
                });
                meeting.recording_files.map(file => {
                  downloadUrls.push(file.download_url); // Push play_url to the array
                });
              });

              // console.log(downloadUrls)
              // console.log(playUrls)

              return res.status(200).json({
                status: 200,
                success: 1,
                data : recordings,
                play :  playUrls,
                download :  downloadUrls
            })
          } else {
            return res.status(300).json({
              status: 400,
              error: 1,
              message:'error',
            })
          }
      })
      .catch(error => {
        console.error('Error:', error);
          return res.status(400).json({
            status: 400,
            error: 1,
            message:error,
          })
      });
  }
},


//   recordingpp: async (req, res) => {  
  
//     // fetch the user Zoom auth record
//     // --------------------------------
//     // run runotherfunctions to refresh the access token using the first step data
//     // --------------------------------
//     // with the new access token fetch the zoom recordings record
//     // --------------------------------
//     // Store and send back the zoom recordings record

//   let access = res.decoded_access
//   var accessToken = '';
//   let refreshToken = '';
//   let zoomUserId = '';

//   fetch_user_zoom(access.user_id, (err, results)=>{

//     if(results.rowCount > 0){
//       // console.log(results.rows[0].zoom_user_id)
//       // accessToken = results.rows.access_token 
//       refreshToken = results.rows[0].refresh_token 
//       zoomUserId =   results.rows[0].zoom_user_id 

//       runOtherFunctions()
//     }
//     if(err){
//       console.log(err)
//       return res.status(400).json({
//         error: 1,
//         data : err,
//       })
//     }

//   }) 


//     async function getAllMeetingRecordings() {
//     console.log("getAllMeetingRecordings")
//     let allRecordings = []; // Accumulator array to store all recordings
//     let today = new Date(); // Get current date object
//     let fiveYearsAgo = new Date(today); // Get a copy of the current date
//     // fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 4); // Subtract 5 years
//     fiveYearsAgo.setMonth(fiveYearsAgo.getMonth() - 2); // Subtract 6 months
    
//     let hasMore = true; // Flag to track if there are more recordings to fetch
    
//     while (hasMore) {
//         let fromDateTime = new Date(today); // Create a new Date object from 'today'
//         fromDateTime.setDate(fromDateTime.getDate() - 30); // Go back 30 days from 'today'
//         fromDateTime.setUTCHours(0, 0, 0, 0); // Set 'from' time to beginning of day (UTC)

//         let toDateTime = new Date(today); // Create a new Date object from 'today'
//         toDateTime.setUTCHours(23, 59, 59, 999); // Set 'to' time to end of day (UTC)

//         if (fromDateTime < fiveYearsAgo) {
//             // If 'fromDateTime' is earlier than 5 years ago, break out of the loop
//             break;
//         }

//         try {
//             const response = await axios.get(`https://api.zoom.us/v2/users/${zoomUserId}/recordings`, {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//                 params: {
//                     from: fromDateTime.toISOString(),
//                     to: toDateTime.toISOString(),
//                 },
//                 timeout: 10000, // Set timeout to 10 seconds (adjust as needed)
//             });

        
//             allRecordings.push(...response.data.meetings); // Append retrieved recordings

//             hasMore = response.data.next_page_token !== undefined; // Check for next page token
//             today = fromDateTime; // Update 'today' for next iteration
//         } catch (error) {
//             console.error('Error fetching meeting recordings:', error.response ? error.response.data : error.message);
//             // Handle error or retry logic here
//             return res.status(400).json({
//               status: 400,
//               error: 1,
//               err: error.message,
//               message:'Could not fetch recordings',
//             })
//             break; // Exit loop in case of error
//         }
//     }

//     return allRecordings;
//   }


//   async function runOtherFunctions(){

//     // console.log('running other functions')
//     // console.log(refreshToken)
//     await refreshAccessToken(clientID, clientSecret, refreshToken)
//     .then(newAccessToken => {
//         if (newAccessToken) {
//             accessToken = newAccessToken
//            console.log('New access token:', newAccessToken);
//         } else {
//           console.log('Failed to refresh access token.');
//           return res.status(400).json({
//             status: 400,
//             error: 1,
//             message:'Failed to refresh access token.',
//           })
//         }
//     })
//     .catch(error => {
//       console.error('Error:', error);
//       return res.status(400).json({
//         status: 400,
//         error: 1,
//         message:error,
//       })
//     });


//     await getAllMeetingRecordings()
//     .then(recordings => {
//         if (recordings && recordings.length > 0) {
//           const playUrls = [];
//           const downloadUrls = [];
//           const batch_id = uuidv4();
          
//           let totalSize = 0
            
//             // Iterate through each recording
//           recordings.forEach((recording, index) => {  
//             // console.log(index)
//             totalSize += recording.total_size
//             // -------------------------------
            
//               store_recordings_data(recording,access.user_id,recording.total_size,batch_id, (err, results) => { 

//               })

//               // store_recordings_data(recording,access.user_id, (err, results) => { 

//               // })
//                 // Iterate through each recording file of the recording
//                 recording.recording_files.forEach(file => {       
//                     playUrls.push(file.play_url); // Push play_url to the array
//                     downloadUrls.push(file.download_url); // Push download_url to the array
//                 });
//             });

     
//             console.log(totalSize)
//             return res.status(200).json({
//                 status: 200,
//                 success: 1,
//                 data: recordings,
//                 // play: playUrls,
//                 // download: downloadUrls
//             });
//         } else {
//             return res.status(300).json({
//                 status: 400,
//                 error: 1,
//                 message: 'No recordings found',
//             });
//         }
//     })
//     .catch(error => {
//         // console.error('Error:', error);
//         return res.status(400).json({
//             status: 400,
//             error: 1,
//             message: error,
//         });
//     });

//   }

// },

  
recording: async (req, res) => {  
  console.log('RECORDING STARTED')
  // fetch the user Zoom auth record
  // --------------------------------
  // run runOtherfunctions to refresh the access token using the first step data
  // --------------------------------
  // with the new access token fetch the zoom recordings record
  // --------------------------------
  // Store and send back the zoom recordings record

  let access = res.decoded_access;
  let accessToken = '';
  let refreshToken = '';
  let zoomUserId = '';

  fetch_user_zoom(access.user_id, (err, results) => {
      if (results.rowCount > 0) {
          refreshToken = results.rows[0].refresh_token;
          zoomUserId = results.rows[0].zoom_user_id;
          runOtherFunctions();
      } else if (err) {
          console.log(err);
          return res.status(400).json({
              error: 1,
              data: err,
          });
      }
  });

  async function getAllMeetingRecordings() {
    let allRecordings = [];
    let today = new Date();
    let fiveYearsAgo = new Date(today);
    fiveYearsAgo.setMonth(fiveYearsAgo.getMonth() - 10);

    let hasMore = true;
    console.log('Get all records');
    while (hasMore) {
        let fromDateTime = new Date(today);
        fromDateTime.setDate(fromDateTime.getDate() - 30);
        fromDateTime.setUTCHours(0, 0, 0, 0);

        let toDateTime = new Date(today);
        toDateTime.setUTCHours(23, 59, 59, 999);

        if (fromDateTime < fiveYearsAgo) {
            break;
        }
        console.log('Fetching recordings from', fromDateTime.toISOString(), 'to', toDateTime.toISOString());

        try {
            const response = await axios.get(`https://api.zoom.us/v2/users/${zoomUserId}/recordings`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    from: fromDateTime.toISOString(),
                    to: toDateTime.toISOString(),
                },
                timeout: 100000,
            });
            console.log('Response data:', response.data);
            
            allRecordings.push(...response.data.meetings);
            hasMore = response.data.next_page_token !== undefined;
            today = fromDateTime;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout:', error.message);
            } else if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
            } else {
                console.error('Error:', error.message);
            }
            return res.status(400).json({
                status: 400,
                error: 1,
                reason: 'cant_fetch_recording',
                err: error.message,
                message: 'Could not fetch recordings',
            });
            break;
        }
    }

    return allRecordings;
}

  async function runOtherFunctions() {
      try {
          const newAccessToken = await refreshAccessToken(clientID, clientSecret, refreshToken);
        if (newAccessToken) {
            console.log('Access token', newAccessToken)
              accessToken = newAccessToken;
          } else {
              console.log('Failed to refresh access token.');
              return res.status(400).json({
                  status: 400,
                  error: 1,
                  reason: 'cant_refresh_access',
                  message: 'Failed to refresh access token.',
              });
          }

        const recordings = await getAllMeetingRecordings();
          if (recordings.length === 0) {
                console.log('No recordings found for the specified date range.');
                return {
                    status: 201,
                    reason: 'not_subscribed_to_zoom',
                    message: 'No recordings found for the specified date range.',
                    recordings: allRecordings,
                };
            }
          if (recordings && recordings.length > 0) {
              const playUrls = [];
              const downloadUrls = [];
              const batch_id = uuidv4();

              let totalSize = 0;

              recordings.forEach((recording, index) => {
                  totalSize += recording.total_size;
                  store_recordings_data(recording, access.user_id, recording.total_size, batch_id, (err, results) => {
                      if (err) {
                          console.error('Error storing recording data:', err);
                      }
                  });

                  recording.recording_files.forEach(file => {
                      playUrls.push(file.play_url);
                      downloadUrls.push(file.download_url);
                  });
              });

              console.log(totalSize);
              return res.status(200).json({
                  status: 200,
                  success: 1,
                  data: recordings,
              });
          } else {
              // ---------------------------------
              // THIS Error breakes he code
              // ---------------------------------
              // return res.status(300).json({
              //     status: 300,
              //     error: 1,
              //     message: 'No recordings found',
              // });
          }
      } catch (error) {
        console.error('Error:', error.reason || error.error || error);
        return res.status(400).json({
            status: 400,
            error: 1,
            reason: error.error,
            message: error.reason,
        });
      }
  }
},

callback: async (req, res)=>{
    const redirectURI_ = `${process.env.BACKEND_URL}/api/zoom/callback/${req.params.user_id}`; // Update with your actual redirect URI
    let zoom_user_id = '';
    const { code } = req.query;

    // Exchange authorization code for access token
    const tokenURL = 'https://zoom.us/oauth/token';
    const tokenParams = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectURI_,
    };

    const authHeader = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
    const headers = {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };



    try {
      const tokenResponse = await axios.post(tokenURL, querystring.stringify(tokenParams), { headers });
      const accessToken = tokenResponse.data.access_token;

      await getUserId(accessToken)
      .then(userId => {
          if (userId) {
              zoom_user_id = userId
              console.log('User ID:', userId);
          } else {
              console.log('Failed to fetch user ID.');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });

      console.log('this is zoom user_id', zoom_user_id)
      save_user_zoom(tokenResponse,req.params.user_id, zoom_user_id, (err, results)=>{

        if(results){
          console.log('done')
            
          res.redirect(`${process.env.FRONTEND_URL}/dash`);

        }
        if(err){
          console.log(err)
        }

      }) 
    
    } catch (error) {
      console.error('Error exchanging code for token:', error.message);
      res.status(500).send('Error exchanging code for token', error.message);
    }
},


}
