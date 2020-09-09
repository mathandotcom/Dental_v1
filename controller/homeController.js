const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');
const request = require('request')

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const UserModel = require('../models/user');
const env  = require('../config/env');
const logger = require('../logger/logconfig');
var users = [];

const InitializePassport = require('../passport-auth');
InitializePassport(passport);

exports.index_p = (req, res, next) => {
  logger.info('Redirected to home page');
  res.render('index', { title: 'Passport Home page', path:'/', user:req.session.user });
};

exports.index = (req, res, next) => {
  logger.info('Redirected to home page');
  res.render('home/api', { title: 'Api Home page', path:'/'});
};

exports.about =  (req, res, next) => {
  res.render('about', { title: 'About us page',user:req.session.user   });
};

exports.monitor =  (req, res, next) => {
  res.render('monitor', { title: 'Monitor page',user:req.session.user   });
};

exports.sign =  (req, res, next) => {
  res.render('home/sign', { title: 'Sign page',user:req.session.user   });
};

exports.login = (req, res) => {
  
  const registermessage =  req.session.message;
  delete req.session.message;
  res.render('home/login.hbs', {
    title:'Login', 
    username: req.session.username, 
    message: registermessage,
    layout: 'layout/home'
  })
};

exports.loginuser = passport.authenticate('local', {
   successRedirect: '/',
   failureRedirect:'/login',
   failureFlash:true,
 });
 

exports.register = (req, res) => {
  let message = req.flash('error');
  let newuser = req.flash('newUser');
  let user = null;
  if(message.length > 0){
    message = message[0];
    newuser = JSON.parse(JSON.stringify(newuser[0]));
  }
  else{
    message = null
  }
  res.render('home/register.hbs', {title:'Register', errorMessage:message, newuser:newuser,layout: 'layout/home'});
}

exports.updateuser = (req, res) => {
  res.render('home/profupdate.hbs', {title:'Update User', user:req.session.user});
}


exports.registeruser = async (req, res, next) => {
  var addUser = false;
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user  = {
      id: Date.now().toString(),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.useremail,
      password:hashedPassword,
      phone: req.body.phone,
      roleid:0
    };
    
    UserModel.fetchByEmail(user.username)
    .then(([userData]) => {
      if(userData.length > 0){
        let errorMessage = `User with this Email '${user.username}' already exists.  Please try with another email id`;
        req.flash('error', errorMessage);
        req.flash('newUser', user);
        return res.redirect('/register')
        //return res.render('home/register.hbs', {title:'Register', message:'Oops, ' + errorMessage});
      }
      const newuser = new UserModel(null, user.firstname,user.lastname,user.username, user.password, user.roleid, user.phone);
      newuser.save()
      .then(data => {
        user.id = data[0].insertId;
        req.session.username = user.username;
        req.session.message = 'Awesome, you have successfully registered';
        res.redirect('/login');
      })
      .catch(err => {
        //res.status(501).json({message:`Unable to get users ${error}`});
        console.log('Error :', err);
        res.render('home/register.hbs', {title:'Register', message:'Oops, somthing went wrong.'});
      });
    })
    .catch(err => {
      console.log(err);
    });
  }
  catch(errors){
    console.log(errors);
    res.redirect('/register');
  }
};


exports.updateuserprofile = async (req, res) => {
  var addUser = false;
  try {
    const user  = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.session.user.username,
      id: parseInt(req.body.id),
      phone: req.body.phone,
      roleid:0
    };
    const newuser = new UserModel(user.id, user.firstname,user.lastname,user.username, user.password, user.roleid, user.phone);

    newuser.update()
    .then(() => {
      req.session.user = user;
      req.session.updateMessage = 'User detail has been updated successfully';
      res.redirect('/profile');
      //res.render('home/profile',{title:'Home', message:'User detail has been updated successfully', user:req.session.user});
    })
    .catch(err => {
      console.log('Oops! Something went wrong');
    });
  }
  catch(errors){
    console.log(errors);
    res.redirect('/register');
  }
};

exports.profile =  (req, res, next) => {
  const updateMessage = req.session.updateMessage;
  delete req.session.updateMessage;

  UserModel.fetchByEmail(req.session.user.username)
  .then(([userData]) => {
    if(userData.length >= 0){
      logger.info(`Success: User profile was updated for'${req.session.user.username}'`);
      req.session.user = userData[0];
      res.render('home/profile', { title: 'User Profile', user:userData[0], message:updateMessage});
    }
  })
  .catch(err => {
    logger.info(err + ` on user update for '${req.session.user.username}' `)
    res.render('home/profile', { title: 'User Profile', user:req.session.user, message:updateMessage});
  });
  
};

exports.configure = (req, res, next) => {
  res.render('settings/configure', { title: 'Configuration Setup', user:req.session.user, message:''});
};
