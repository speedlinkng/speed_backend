const express = require('express');
const router = express.Router();
const {ifAdmin} = require("../middlewares/ValidateToken");
const {
    changeUserPassword, 
} = require('../controllers/AuthController');
const {
    getAllUsers, 
    getAllRecords, 
    searchUser,
    searchRecord,
    updateUser,
    getTotalUserCount,
    getTotalRecordCount,
    getTotalCompletedRecordCount,
    getTotalByteUploaded,
    getTotalSubscribers,
    getTotalAmount,
    getCodeForAdmin,

} = require('../controllers/AdminController');


// Get all Users in the system
router.get('/getAllUsers', ifAdmin, getAllUsers)
router.get('/getAllRecords', ifAdmin, getAllRecords)
router.get('/searchUser/:searchTerm', ifAdmin, searchUser)
router.post('/searchRecord', ifAdmin, searchRecord)
router.patch('/updateUser/:id', ifAdmin, updateUser)
router.get('/getTotalUserCount', ifAdmin, getTotalUserCount)
router.get('/getTotalRecordCount', ifAdmin, getTotalRecordCount)
router.get('/getTotalCompletedRecordCount', ifAdmin, getTotalCompletedRecordCount)
router.get('/getTotalByteUploaded', ifAdmin, getTotalByteUploaded)
router.get('/getTotalSubscribers', ifAdmin, getTotalSubscribers)
router.get('/getTotalAmount', ifAdmin, getTotalAmount)
router.post('/changeUserPassword', ifAdmin, changeUserPassword)


// Protect Admin
router.get('/getCodeForAdmin', ifAdmin, getCodeForAdmin)




module.exports = router