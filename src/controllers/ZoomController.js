const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const querystring = require('querystring');
const {save_user_zoom, if_exists, fetch_user_zoom, store_recordings_data} = require('../services/zoom.services');
const refreshAccessToken = require('../middlewares/refreshZoomAccess');

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
async function uploadFile(drive, fileName, fileStream, onUploadProgress) {
    const fileMetadata = {
        name: fileName
    };
    const media = {
        mimeType: 'application/octet-stream',
        body: fileStream
    };
    const res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
        onUploadProgress
    });
    console.log('File uploaded with ID:', res.data.id);
}

// Main function
async function main() {

  const sourceUrl = 'https://us06web.zoom.us/rec/download/4r8l7hGTmyFLBp1Q52dqeV1MzTBjLwpxeCc3JL3Pj1QGuS9Sc3AnWwqSFbYrwLpweF5LxKs65W45zmVR.GwH3wycwuuZsIEdb';
    const fileName = 'Name_of_the_file_on_Google_Drive.mp4';

    // Variables to track progress
    let bytesDownloaded = 0;
    let bytesUploaded = 0;

    // Download progress callback
    const onDownloadProgress = (progressEvent) => {
        bytesDownloaded = progressEvent.loaded;
        console.log(`Downloaded ${bytesDownloaded} bytes`);
    };

    // Upload progress callback
    const onUploadProgress = (progressEvent) => {
        bytesUploaded = progressEvent.bytesRead;
        console.log(`Uploaded ${bytesUploaded} bytes`);
    };

    // Download the file from the source
    const fileStream = await downloadFile(sourceUrl, onDownloadProgress);

    // Authenticate with Google Drive
    const drive = await authenticateWithDrive();

    // Upload the file to Google Drive
    await uploadFile(drive, fileName, fileStream, onUploadProgress);
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

backup: (req, res)=>{
  let access = res.decoded_access
  let tok_data = res.tok_data
  console.log(tok_data)
    console.log(access)
    console.log('SORRRYYYYYYYYYYYYY')
  let json = JSON.parse(tok_data);
  oauth3Client.setCredentials(json); 
  main().catch(console.error);

},

  
refresh: (req, res)=>{
  let access = res.decoded_access
  console.log(access)
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
  // console.log(redirectURI_)  
  const authorizeURL = 'https://zoom.us/oauth/authorize';
    const queryParams = {
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirectURI_,
    };
  
    const authorizationURL = `${authorizeURL}?${querystring.stringify(queryParams)}`;
    // console.log(authorizationURL)
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
        // console.log(results.rows[0].zoom_user_id)
        // accessToken = results.rows.access_token 
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
            // console.log('New access token:', newAccessToken);
        } else {
          console.log('Failed to refresh access token.');
          return res.status(400).json({
            status: 400,
            error: 1,
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


recording: async (req, res)=>{  
  let access = res.decoded_access
  var accessToken = '';
  let refreshToken = '';
  let zoomUserId = '';
  fetch_user_zoom(access.user_id, (err, results)=>{

    if(results.rowCount > 0){
      // console.log(results.rows[0].zoom_user_id)
      // accessToken = results.rows.access_token 
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




  async function getAllMeetingRecordings() {
    let allRecordings = []; // Accumulator array to store all recordings
    let today = new Date(); // Get current date object
    let fiveYearsAgo = new Date(today); // Get a copy of the current date
    // fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 4); // Subtract 5 years
    fiveYearsAgo.setMonth(fiveYearsAgo.getMonth() - 2); // Subtract 6 months
    
    let hasMore = true; // Flag to track if there are more recordings to fetch
    
    while (hasMore) {
        let fromDateTime = new Date(today); // Create a new Date object from 'today'
        fromDateTime.setDate(fromDateTime.getDate() - 30); // Go back 30 days from 'today'
        fromDateTime.setUTCHours(0, 0, 0, 0); // Set 'from' time to beginning of day (UTC)

        let toDateTime = new Date(today); // Create a new Date object from 'today'
        toDateTime.setUTCHours(23, 59, 59, 999); // Set 'to' time to end of day (UTC)

        if (fromDateTime < fiveYearsAgo) {
            // If 'fromDateTime' is earlier than 5 years ago, break out of the loop
            break;
        }

        try {
            const response = await axios.get(`https://api.zoom.us/v2/users/${zoomUserId}/recordings`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    from: fromDateTime.toISOString(),
                    to: toDateTime.toISOString(),
                },
                timeout: 10000, // Set timeout to 10 seconds (adjust as needed)
            });

        
            allRecordings.push(...response.data.meetings); // Append retrieved recordings

            hasMore = response.data.next_page_token !== undefined; // Check for next page token
            today = fromDateTime; // Update 'today' for next iteration
        } catch (error) {
            console.error('Error fetching meeting recordings:', error.response ? error.response.data : error.message);
            // Handle error or retry logic here
            break; // Exit loop in case of error
        }
    }

    return allRecordings;
  }




  async function runOtherFunctions(){

    // console.log('running other functions')
    // console.log(refreshToken)
    await refreshAccessToken(clientID, clientSecret, refreshToken)
    .then(newAccessToken => {
        if (newAccessToken) {
            accessToken = newAccessToken
            // console.log('New access token:', newAccessToken);
        } else {
          console.log('Failed to refresh access token.');
          return res.status(400).json({
            status: 400,
            error: 1,
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


    await getAllMeetingRecordings()
    .then(recordings => {
        if (recordings && recordings.length > 0) {
            const playUrls = [];
            const downloadUrls = [];
            
            // Iterate through each recording
          recordings.forEach(recording => {  
            // console.log('Start THIOS TEST')
            // console.log(recording)
              store_recordings_data(recording,access.user_id, (err, results) => { 

              })
                // Iterate through each recording file of the recording
                recording.recording_files.forEach(file => {       
                    playUrls.push(file.play_url); // Push play_url to the array
                    downloadUrls.push(file.download_url); // Push download_url to the array
                });
            });

     

            return res.status(200).json({
                status: 200,
                success: 1,
                data: recordings,
                // play: playUrls,
                // download: downloadUrls
            });
        } else {
            return res.status(300).json({
                status: 400,
                error: 1,
                message: 'No recordings found',
            });
        }
    })
    .catch(error => {
        // console.error('Error:', error);
        return res.status(400).json({
            status: 400,
            error: 1,
            message: error,
        });
    });

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
