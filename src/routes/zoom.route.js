const express = require('express');
const router = express.Router();
const {checkToken} = require("../middlewares/ValidateToken");
const { Authorize, callback, meeting, refresh, recording} = require('../controllers/ZoomController');



// get url record by id
router.get('/', checkToken, Authorize)
router.get('/callback/:user_id', callback)
router.get('/meeting', meeting)
router.get('/refresh',checkToken, refresh)
router.get('/recordings',checkToken, recording)





module.exports = router