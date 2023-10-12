const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {login, createUser, getMe} = require('../controllers/AuthController');
const {checkToken} = require("../middlewares/ValidateToken");
const {getGoogleData} = require("../middlewares/Generals");
const {addRecord, getRecord, getRecordById, getSettingById, checkOnline} = require('../controllers/CreateController');
const { uploadToDrive } = require('../controllers/UploadController');




//check token valid 
router.get('/check', checkToken, getMe)
// Create upload request 
router.post('/create', checkToken, getGoogleData, addRecord)
// get all of a users rcords/ upload request 
router.get('/getrecords', checkToken, getRecord)
// get url record by id
router.get('/getrecordbyid/:id', checkToken, getRecordById)
router.get('/getrecordbyidnoauth/:id', getRecordById)
router.get('/getsettingbyidnoauth/:id', getSettingById)

router.get('/getsettingbyidnoauth/:id', getSettingById)
router.post('/checkonline', checkOnline)
//check token valid 
// router.get('/uploads', checkToken, getRecord)

// UPLOAD TO DRIVE
router.post('/upload', upload.single('file'), uploadToDrive)




module.exports = router