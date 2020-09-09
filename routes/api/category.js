const  express = require('express');
const isAuth = require('../../middleware/is-auth');
var router = express.Router();
const categoryController = require('../../controller/categoryController');


router.get('/all', isAuth, categoryController.categoryApi);
router.post('/templatetypes', isAuth, categoryController.templateTypeName);
//router.put('/addtemplate', isAuth, categoryController.addTemplate);
//router.put('/retrieve', isAuth, categoryController.addTemplate);


module.exports = router;