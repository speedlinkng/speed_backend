const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); 
const {
    refreshDefault, 
    refreshToken, 
    getsize, 
    getuploadsession, 
    uploadchunk,
    uploadchunks,
    auth,
    redirect,
    getDefaultAccess,
    refreshUser,
    getdata,
    getMyStorage,
    getNewStorage,
    docToDrive,
    downloadFolderAsZip,
    getUserBackupDrive
    } = require('../controllers/GoogleController');
const { checkToken, checkTokenUrl } = require('../middlewares/ValidateToken');
const { validateEmail, ifAdmin } = require('../middlewares/ValidateToken');

// Create upload request 


//get upload record

router.get('/auth/:access', checkTokenUrl, auth)
router.get('/redirect', redirect)
router.get('/refresh', refreshUser)
router.get('/refresh/:token', refreshToken)
router.get('/getsize', upload.single('file'), getsize)
router.get('/getuploadsession', getuploadsession)
router.get('/uploadchunk1', upload.single('file'), uploadchunk)
router.get('/uploadchunk2', upload.single('file'), uploadchunks)
//  router.get('/uploadchunk', uploadchunk2)


router.get('/speedlinkaccess', checkToken, getDefaultAccess)
router.get('/mystorage', checkToken, getMyStorage)
router.post('/newstorage', checkToken, getNewStorage)
router.post('/getUserBackupDrive', checkToken, getUserBackupDrive)

// change default drive ifAdmin
router.post('/changeDriveMail', checkToken, ifAdmin, getNewStorage)
router.post('/docToDrive', docToDrive)
router.get('/downloadFolderAsZip/:record_id/:user_google_id/:folder/:storage_email', downloadFolderAsZip)




module.exports = router