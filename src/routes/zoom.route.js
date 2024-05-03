const express = require('express');
const router = express.Router();
const {checkToken} = require("../middlewares/ValidateToken");
const {getGoogleData} = require("../middlewares/Generals");
const { Authorize, callback, meeting, refresh, recording, backup} = require('../controllers/ZoomController');



// get url record by id
router.get('/', checkToken, Authorize)
router.get('/callback/:user_id', callback)
router.get('/meeting',checkToken, meeting)
router.post('/backup',checkToken,getGoogleData, backup)
router.get('/refresh',checkToken, refresh)
router.get('/recordings',checkToken, recording)





module.exports = router