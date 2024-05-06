const express = require('express');
const router = express.Router();
const {paystack,webhook,verify,cancel,toFree } = require('../controllers/PaystackController');
const {checkToken} = require("../middlewares/ValidateToken");
const bodyParser = require('body-parser');
router.use(bodyParser.raw({ type: 'application/json' }));
    

router.get('/', checkToken, paystack)
router.post('/webhook', webhook)
router.get('/verify', verify)
router.get('/cancel',checkToken, cancel)
router.get('/tofree',checkToken, toFree)

module.exports = router