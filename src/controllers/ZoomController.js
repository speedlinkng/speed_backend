const express = require('express');
const axios = require('axios');
const querystring = require('querystring');


const clientID = 'J38UYpAXQlqlydq5dIn58Q';
const clientSecret = 'G3gbxPjt5GKRNEaMTsYRvpZFM2IlO7vY';
const redirectURI = 'http://localhost:5000/api/zoom/callback'; // Update with your actual redirect URI


module.exports = {

  redirect: (req, res)=>{
    res.redirect('https://google.com');
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

callback: async (req, res)=>{
  const redirectURI_ = `http://localhost:5000/api/zoom/callback/${req.params.user_id}`; // Update with your actual redirect URI
  console.log(redirectURI_)  
  const { code } = req.query;
  console.log(code)
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
    console.log(tokenResponse.data)
    // Use the accessToken as needed
    res.send(`Access Token: ${(tokenResponse.data).access_token}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    res.status(500).send('Error exchanging code for token');
  }
},


}
