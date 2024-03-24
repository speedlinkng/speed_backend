const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const {save_user_zoom, if_exists, fetch_user_zoom} = require('../services/zoom.services');
const refreshAccessToken = require('../middlewares/refreshZoomAccess');


// const clientID = 'J38UYpAXQlqlydq5dIn58Q';
// const clientSecret = 'G3gbxPjt5GKRNEaMTsYRvpZFM2IlO7vY';
// const redirectURI = 'http://localhost:5000/api/zoom/callback'; // Update with your actual redirect URI
const clientID = 'J1NkT84YTsu_ZhjGYLAbiQ';
const clientSecret = 'lKLFc145Ekp570kcafjVW2XbUL87NH7i';
const redirectURI = 'http://localhost:5000/api/zoom/callback'; // Update with your actual redirect URI



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

refresh: (req, res)=>{
  let access = res.decoded_access
  // console.log(access)
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
  const redirectURI_ = `http://localhost:5000/api/zoom/callback/${access.user_id}`; // Update with your actual redirect URI
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

meeting: async (req, res)=>{
   try{
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

},




recording: async (req, res)=>{  
  let access = res.decoded_access
  var accessToken = '';
  let refreshToken = '';
  let zoomUserId = '';
  fetch_user_zoom(access.user_id, (err, results)=>{

    if(results.rowCount > 0){
      console.log(results.rows[0].zoom_user_id)
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




  async function getMeetingRecordings() {
    const fromDateTime = '2024-02-20T00:00:00Z'; // Specify your start date/time
    const toDateTime = '2024-03-19T23:59:59Z';   // Specify your end date/time
    console.log('accessToken', accessToken)
    try {
        const response = await axios.get(`https://api.zoom.us/v2/users/${zoomUserId}/recordings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                from: fromDateTime,
                to: toDateTime
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching meeting recordings:', error.response ? error.response.data : error.message);
        return null;
    }
}



  async function runOtherFunctions(){

    console.log('running other functions')
    console.log(refreshToken)
    await refreshAccessToken(clientID, clientSecret, refreshToken)
    .then(newAccessToken => {
        if (newAccessToken) {
            accessToken = newAccessToken
            console.log('New access token:', newAccessToken);
        } else {
            console.log('Failed to refresh access token.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });


    await getMeetingRecordings()
      .then(recordings => {
          if (recordings) {
              console.log('Meeting recordings:' );
              
              return res.status(200).json({
                status: 200,
                success: 1,
                data : recordings,
            })
          } else {
              console.log('Failed to fetch meeting recordings.');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }

},





callback: async (req, res)=>{
    const redirectURI_ = `http://localhost:5000/api/zoom/callback/${req.params.user_id}`; // Update with your actual redirect URI
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
      res.status(500).send('Error exchanginsg code for token');
    }
},


}
