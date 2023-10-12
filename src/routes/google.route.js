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
    getNewStorage
    } = require('../controllers/GoogleController');
const { checkToken, checkTokenUrl } = require('../middlewares/ValidateToken');
const { validateEmail } = require('../middlewares/ValidateToken');

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




module.exports = router