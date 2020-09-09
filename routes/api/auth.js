const express = require('express');
const passport = require('passport');
const {body} = require('express-validator');
const authController = require('../../controller/authcontroller');
const userModel = require('../../models/user');

var router = express.Router();

//const InitializePassport = require('../../passport-auth');
//InitializePassport(passport);

router.get('/user/email/:useremail', authController.apiFetchUserByEmail);
router.get('/user/id/:id', authController.apiFetchUserById);
router.get('/users', authController.apiFetchUser);

router.put('/signup', [
    body('useremail').isEmail().withMessage('Please enter valid email address').custom((value, {req}) => {
        return userModel.fetchByEmail(value).then(([userData]) => {
            if(Array.isArray(userData) && userData.length){
                let errorMessage = `User '${value}' is already exists.  Please try with another email id`;
                return Promise.reject(errorMessage);
            }
        });
    }).normalizeEmail(),
    body('userpassword','Password should be at least 8 char long').trim().isLength({min:8}).withMessage('Password should be at least 8 char long'),
    body('firstname', 'First Name is required').trim().not().isEmpty(),
    body('firstname','First Name should be at least 2 chat long').trim().isLength({min:2}),
    body('phone').trim().not().isEmpty().withMessage('Please enter phone number')
    .trim().isLength({min:10}).withMessage('Phone number should be minimum of 10 char long')
    .trim().isNumeric().withMessage('Invalid phone number')

], authController.apiSignupUser);

router.put('/update', [
    body('useremail').isEmail().withMessage('Please enter valid email address').normalizeEmail(),
    body('firstname', 'First Name is required').trim().not().isEmpty()
    .trim().isLength({min:2}).withMessage('First Name should be at least 2 chat long'),
    body('phone').trim().not().isEmpty().withMessage('Please enter phone number')
    .trim().isLength({min:10}).withMessage('Phone number should be minimum of 10 char long')
    .trim().isNumeric().withMessage('Invalid phone number')

], authController.apiUpdateUser);

/*
router.post('/login', passport.authenticate('local',{
    
}),
    // .then(() => {
    //     console.log('pass in pass');
    // })
    // .catch(err => {
    //     console.log('error in pass');
    // }),
  function(req, res) {
    
    let token = jwt.sign({username: req.user.username, firstname:req.user.firstname}, env.jwt_SecretKey, { expiresIn: '1h' });
    req.session.user = req.user;
    req.session.token = token;
  
    res.status().json({status:'success'});
  });
*/

router.post('/login', [
    body('useremail').isEmail().withMessage('Please enter valid email address')
    /*
    .custom((value, {req}) => {
        return userModel.fetchByEmail(value).then(([userData]) => {
            if(Array.isArray(userData) && userData.length <=0 ){
                let errorMessage = `User with this Email '${value}' does not exists.  Please try with another email id`;
                return Promise.reject(errorMessage);
            }
        });
    })*/
    .normalizeEmail(),
    body('userpassword','Password should be at least 8 char long').trim().isLength({min:8}).withMessage('Password should be at least 8 char long'),

],
authController.apiUserLogin);

router.post('/changePassword', [
    body('useremail').isEmail().withMessage('Please enter valid email address')
    .custom((value, {req}) => {
        return userModel.fetchByEmail(value).then(([userData]) => {
            if(Array.isArray(userData) && userData.length <=0 ){
                let errorMessage = `User with this Email '${value}' does not exists.  Please try with another email id`;
                return Promise.reject(errorMessage);
            }
        });
    })
    .normalizeEmail(),
    body('userpassword','Password should be at least 8 char long').trim().isLength({min:8}).withMessage('Password should be at least 8 char long'),
    body('newpassword','New password should be at least 8 char long').trim().isLength({min:8}).withMessage('New password should be at least 8 char long'),
    body('confirmpassword','Confirm password should be at least 8 char long').trim().isLength({min:8}).withMessage('Confirm password should be at least 8 char long'),

],
authController.apiUpdatePassword);

module.exports = router;