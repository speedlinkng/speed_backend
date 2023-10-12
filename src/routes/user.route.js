const express = require('express');
const router = express.Router();
const {createUsers, getUserById, getUsers, updateUsers, deleteUser} = require('../controllers/UserController');
const {login, createUser} = require('../controllers/AuthController');
const {addRecord, getRecord} = require('../controllers/CreateController');
const {checkToken, TRY} = require("../middlewares/ValidateToken")

// login check
const validateLogin = require("../middlewares/ValidateMiddleware")
const {loginSchema, registerSchema} = require("../validations/UserValidation")

router.post('/', createUser)
router.get('/', getUsers)
// router.get('/:id',checkToken, getUserById)
router.patch('/',checkToken, updateUsers)
router.delete('/',checkToken, deleteUser)
router.post('/login', validateLogin(loginSchema), login)



//get upload record
router.get('/get/:record', checkToken, getRecord)

//get upload record
router.get('/getforupload/:record', getRecord)







module.exports = router