const express = require('express');
const router = express.Router();
const {ifAdmin} = require("../middlewares/ValidateToken");
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
    getTotalAmount
} = require('../controllers/AdminController');


// Get all Users in the system
router.get('/getAllUsers', ifAdmin, getAllUsers)
router.get('/getAllRecords', ifAdmin, getAllRecords)
router.get('/searchUser/:searchTerm', ifAdmin, searchUser)
router.post('/searchRecord', ifAdmin, searchRecord)
router.post('/updateUser/:id', ifAdmin, updateUser)
router.get('/getTotalUserCount', ifAdmin, getTotalUserCount)
router.get('/getTotalRecordCount', ifAdmin, getTotalRecordCount)
router.get('/getTotalCompletedRecordCount', ifAdmin, getTotalCompletedRecordCount)
router.get('/getTotalByteUploaded', ifAdmin, getTotalByteUploaded)
router.get('/getTotalSubscribers', ifAdmin, getTotalSubscribers)
router.get('/getTotalAmount', ifAdmin, getTotalAmount)



module.exports = router