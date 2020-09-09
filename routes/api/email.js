const  express = require('express');
const isAuth = require('../../middleware/is-auth');
var router = express.Router();
const emailController = require('../../controller/emailController');

router.post('/sendAsync', isAuth, emailController.sendMailApi);

module.exports = router;