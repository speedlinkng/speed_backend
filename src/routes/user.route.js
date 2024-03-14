const express = require('express');
const router = express.Router();
const {createUsers, getUserById, getUsers, updateUsers, deleteUser} = require('../controllers/UserController');
const {login, createUser, logout, forgot, verifyrecovery, changeForgotPassword, setNewPassword, set_newPhoneNumber} = require('../controllers/AuthController');
const {addRecord, getRecord} = require('../controllers/CreateController');
const {checkToken, TRY, protectRoute, ifAdmin} = require("../middlewares/ValidateToken")

// login check
const {validateSignup,validateLogin} = require("../middlewares/ValidateMiddleware")
const {loginSchema, registerSchema} = require("../validations/UserValidation")

router.post('/', validateSignup(registerSchema), createUser)
router.get('/', getUsers)
router.post('/forgot', forgot)
router.patch('/',checkToken, updateUsers)
router.delete('/',checkToken, deleteUser)
router.post('/login', validateLogin(loginSchema), login)
router.get('/logout', checkToken, logout)
router.post('/setNewPassword', checkToken, setNewPassword)
router.post('/set_newPhoneNumber', checkToken, set_newPhoneNumber)





//get upload record
router.get('/get/:record', checkToken, getRecord)

//get upload record
router.get('/getforupload/:record', getRecord)

//verify the recovery id link in mail
router.get('/verifyrecovery/:verify_id', verifyrecovery)

//change the fogot password
router.post('/changeForgotPassword', changeForgotPassword)

changeForgotPassword



module.exports = router