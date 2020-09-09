const  express = require('express');
const isAuth = require('../../middleware/is-auth');
const checkAuthenticated = require('../../middleware/userauth');
const serviceAuth = require('../../middleware/service-auth');
var router = express.Router();
const smsController = require('../../controller/smsController');
const templateController = require('../../controller/templateController');

router.post('/sendsms', isAuth, smsController.sendSmsApi);
router.post('/sendmessage', isAuth, smsController.sendMessageApi);
router.post('/remindsms', isAuth, smsController.remindSmsApi);
router.post('/remindsmssikka', isAuth, smsController.remindSmsBySikkaApi);
router.post('/remindsmsaptnum', isAuth, smsController.remindSmsByAptNumApi);
router.get('/chatpatients', isAuth, smsController.getPatientsWithLastMessage);
router.post('/chatmessage', isAuth, smsController.getChatMessages);


router.post('/ls-sendsms', checkAuthenticated, smsController.sendSmsApi);
router.post('/ls-remindsms', smsController.remindSmsApi);
router.post('/ls-remindsmsaptnum', checkAuthenticated, smsController.remindSmsByAptNumApi);

router.post('/rsms', smsController.receiveSmsApi);
router.get('/autoreminder/:id', smsController.autoReminder);
router.post('/sendreminder', smsController.sendReminderApi);
//auto trigger - token = 0206a31c-e032-44e6-98a1-7ac40abef233
router.get('/trigger/:token', serviceAuth, templateController.autoTriggerApi);

module.exports = router;