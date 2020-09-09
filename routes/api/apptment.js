const  express = require('express');
const isAuth = require('../../middleware/is-auth');
const checkAuthenticated = require('../../middleware/userauth');

var router = express.Router();
const apptController = require('../../controller/appointmentController');

router.post('/upcomingappointment', isAuth, apptController.getUpcomingAppointmentDetailsApi); //upcoming appointment
router.post('/appointmentbydate', isAuth, apptController.getAppointmentDetailsByDateApi);
router.post('/updateappointment', isAuth, apptController.setConfirmationRequestByAptnum);
router.post('/rescheduleappointment', isAuth, apptController.setRescheduleAppointment);
router.get('/appointmentbydatesikka', isAuth, apptController.getAppointmentDetailsByDateSikkaApi);

router.get('/ls-appointment', checkAuthenticated, apptController.getUpcomingAppointmentDetailsApi);
router.post('/ls-appointmentbydate', checkAuthenticated, apptController.getAppointmentDetailsByDateApi);

module.exports = router;
