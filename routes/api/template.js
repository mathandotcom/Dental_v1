const  express = require('express');
const isAuth = require('../../middleware/is-auth');
const serviceAuth = require('../../middleware/service-auth');
var router = express.Router();
const categoryController = require('../../controller/categoryController');
const templateController = require('../../controller/templateController');


router.put('/add', isAuth, categoryController.addTemplate);
router.post('/retrieve', isAuth, categoryController.retrieveTemplate);

router.get('/events', isAuth, templateController.retrieveEvents);
router.post('/transformimage', isAuth, templateController.transformImage);


router.post('/trigger', serviceAuth, templateController.triggerService);

module.exports = router;