const  express = require('express');
const serviceAuth = require('../../middleware/service-auth');
const schedulerController = require('../../controller/schedulerController');
var router = express.Router();

router.post('/kickprocess/:token', serviceAuth, schedulerController.triggerScheduler);
router.post('/campaign/:token', serviceAuth, schedulerController.triggerCampaign);

module.exports = router;