const axios = require('axios');
const qs = require('querystring');


async function refreshAccessToken(clientId, clientSecret, refreshToken) {
    try {
        // Encode client ID and client secret for Basic Authorization
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // Prepare request body
        const requestBody = qs.stringify({
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });

        // Make POST request to refresh token endpoint
        const response = await axios.post('https://zoom.us/oauth/token', requestBody, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Export the controller function
module.exports =  refreshAccessToken;
