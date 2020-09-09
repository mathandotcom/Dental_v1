const  express = require('express');
const isAuth = require('../middleware/is-auth');
const checkAuthenticated = require('../middleware/userauth');
var router = express.Router();
const appointmentController = require('../controller/appointmentController');

router.get('/', checkAuthenticated, appointmentController.appointment_reminder);

module.exports = router;