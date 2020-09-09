var express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenService = require('../services/tokenService');
var localStorage = require('localStorage'), token = {user:'asaasa'};
const env  = require('../config/env');
const logger = require('../logger/logconfig');
const checkAuthenticated = require('../middleware/userauth');
const checkNotAuthenticated = require('../middleware/user-not-auth');
const path = require('path');
var router = express.Router();

const homeController = require('../controller/homeController');



/* GET home page. */
router.get('/', checkAuthenticated, homeController.index_p);
router.get('/home', homeController.index);
router.get('/about', homeController.about);
router.get('/monitor', checkAuthenticated, homeController.monitor);

router.get('/login', checkNotAuthenticated, homeController.login);
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  failureRedirect:'/login',
  failureFlash:true
}),
function(req, res) {
  
  //let token = jwt.sign({username: req.user.username, firstname:req.user.firstname}, env.jwt_SecretKey, { expiresIn: env.expiresIn });
  tokenService.generateToken(req.user)
  .then(data => {
      req.session.user = req.user;
      req.session.authToken = data.token;
      res.redirect(req.session.returnTo || '/');
      req.session.returnTo = '';
    })
  .catch(err => {
    logger.err(err);
    res.redirect(req.session.returnTo || '/');
  });
});

router.get('/register', checkNotAuthenticated, homeController.register);
router.post('/register', checkNotAuthenticated, homeController.registeruser);
router.get('/updateuser', checkNotAuthenticated, homeController.updateuser);
router.post('/updateuser', homeController.updateuserprofile);

router.get('/profile', checkAuthenticated, homeController.profile);
router.get('/configure', checkAuthenticated, homeController.configure);


router.get('/sign/:id', homeController.sign);


router.delete('/logout', (req, res) => {
  req.logOut();
  if(req.session != null && req.session.user != null){
    logger.info(`user '${req.session.user.username}' was logged out `);
    logger.info(`*-------------End of user sesson-------------*\n`);
    
    req.isUserAuthenticated = false;
    req.session.isLoggedIn = false;
    delete req.session.authToken;
    
    req.session.user = null;

  }else{
    logger.info(`user session was not available`);
    logger.info(`*-------------End of user sesson-------------*\n`);
  }
  res.redirect('/login');
});

router.get('/screenshot', (req, res)=>{
  res.sendFile(path.join( __dirname.replace('routes','views'), 'screenshot.html'));
});
module.exports = router;
