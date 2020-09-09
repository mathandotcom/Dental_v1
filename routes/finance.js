var express = require('express');
var checkAuthenticated = require('../middleware/userauth');
var router = express.Router();

const financeController = require('../controller/financeController');

router.get('/patientsApi', checkAuthenticated, financeController.patientsApi);

router.get('/payoption/:id', checkAuthenticated, financeController.payoption);

router.get('/consent/:consenttype/:id', checkAuthenticated, financeController.consent);
router.get('/exconsent/:consenttype/:id', checkAuthenticated, financeController.exconsent);
module.exports = router;