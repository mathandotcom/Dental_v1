const  express = require('express');
const isAuth = require('../../middleware/is-auth');
const checkAuthenticated = require('../../middleware/userauth');

var router = express.Router();
const financeController = require('../../controller/financeController');
const patientController = require('../../controller/patientController');
const httpController = require('../../controller/httpController');

router.get('/all', isAuth, patientController.patientsApi);
router.get('/sikka', isAuth, patientController.patientsSikkaApi);
router.get('/treamentplan/:id', isAuth, patientController.treatmentPlanApi);
router.get('/treamentplansikka/:id', isAuth, patientController.treatmentPlanSikkaApi);
router.get('/patientinfo/:id', isAuth, patientController.patientInfoApi);
router.get('/patientinfosikka/:id', isAuth, patientController.patientInfoApi);
router.get('/consents/:ct/:id', isAuth, patientController.consentsApi);
router.put('/saveasimage', isAuth, patientController.saveAsImage);
router.get('/doctor', isAuth, patientController.doctorApi);


router.get('/ls-all', checkAuthenticated, patientController.patientsApi);
router.get('/ls-treamentplan/:id', checkAuthenticated, patientController.treatmentPlanApi);
router.get('/ls-patientinfo/:id', checkAuthenticated, patientController.patientInfoApi);
router.get('/ls-consents/:ct/:id', checkAuthenticated, patientController.consentsApi);
router.put('/ls-saveasimage', checkAuthenticated, patientController.saveAsImage);

module.exports = router;
