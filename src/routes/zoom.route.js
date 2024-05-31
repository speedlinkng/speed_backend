const express = require('express');
const router = express.Router();
const {checkToken} = require("../middlewares/ValidateToken");
const {getGoogleData} = require("../middlewares/Generals");
const { Authorize, callback, meeting, refresh, recording, backup, fetchBackupEvent, recordingDB} = require('../controllers/ZoomController');



// get url record by id
router.get('/', checkToken, Authorize)
router.get('/callback/:user_id', callback)
router.get('/meeting',checkToken, meeting)
router.post('/backup', checkToken, getGoogleData, (req, res) => {
    // Pass io object from req.app to the backup controller function
    backup(req, res, req.app.get('io'));
  });
router.get('/refresh',checkToken, refresh)
router.get('/recordings',checkToken, recording)
router.get('/recordings_from_db',checkToken, recordingDB)
router.get('/fetchBackupEvent',checkToken, fetchBackupEvent)





module.exports = (io) => {
    // Return the router with io object attached
    return router;
  };