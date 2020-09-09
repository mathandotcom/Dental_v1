
const  express = require('express');
const isAuth = require('../middleware/is-auth');
const checkAuthenticated = require('../middleware/userauth');
var router = express.Router();
const smsController = require('../controller/smsController');


router.get('/', checkAuthenticated, smsController.smsui);

module.exports = router;
