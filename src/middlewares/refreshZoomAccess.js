const axios = require('axios');
const qs = require('querystring');


async function refreshAccessToken(clientId, clientSecret, refreshToken) {
    console.log('Received refreshToken:', refreshToken);
    try {
        // Encode client ID and client secret for Basic Authorization
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        console.log('Encoded credentials:', credentials);

        // Prepare request body
        const requestBody = qs.stringify({
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });
        console.log('Request body:', requestBody);

        // Make POST request to refresh token endpoint
        const response = await axios.post('https://zoom.us/oauth/token', requestBody, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('Response data:', response.data);

        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
        
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            console.error('Error response data:', error.response.data);
        }
        
        throw error.response ? error.response.data : new Error(error.message);
    }
}

// Export the controller function
module.exports =  refreshAccessToken;
