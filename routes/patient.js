var express = require('express');
var checkAuthenticated = require('../middleware/userauth');
var router = express.Router();

const patientController = require('../controller/patientController');
const financeController = require('../controller/financeController');

router.get('/patientsApi', checkAuthenticated, financeController.patientsApi);
router.get('/all', patientController.patients);
router.get('/profile', patientController.patients);

router.get('/consent/:consenttype/:id', checkAuthenticated, financeController.consent);
router.get('/exconsent/:consenttype/:id', checkAuthenticated, financeController.exconsent);
module.exports = router;