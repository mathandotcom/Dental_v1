const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');
const request = require('request');
const AuthService = require('../services/authService');
const {validationResult} = require('express-validator');

const UserModel = require('../models/user');
const env  = require('../config/env');
const logger = require('../logger/logconfig');

exports.apiFetchUserByEmail =  (req, res, next) => {
    const useremail = req.params.useremail;
    logger.info(`api request for user '${useremail}'`);

    UserModel.fetchByEmail(useremail)
    .then(([user]) => {
        logger.info(JSON.stringify(user[0]));
        return res.status(200).json(user[0]);
    })
    .catch(err => {
        logger.error(`Unable to get user for ${useremail}: ${err.message}`);
        return res.status(401).json({message:`Unable to get user for ${useremail}: ${err.message}`});
    });
};

exports.apiFetchUserById =  (req, res, next) => {
    const id = req.params.id;
    logger.info(`api request for user id: '${id}'`);

    UserModel.fetchById(id)
    .then(([user]) => {
        logger.info(JSON.stringify(user[0]));
        return res.status(200).json(user[0]);
    })
    .catch(err => {
        logger.error(`Unable to get user for ${id}: ${err.message}`);
        return res.status(401).json({message:`Unable to get user for ${id}: ${err.message}`});
    });
};

//http://localhost:3000/api/v1/auth/users
exports.apiFetchUser =  (req, res, next) => {

    UserModel.fetchAllUser()
    .then(([user]) => {
        logger.info(JSON.stringify(user[0]));
        if(user.length > 0){
            return res.status(200).json({status: 'true', message:'', users: user});
        }
        else{
            return res.status(200).json({status: 'false', message:'no user found yet'});
        }
    })
    .catch(err => {
        logger.error(`Unable to get users: ${err.message}`);
        return res.json({status: 'false', message:`Unable to get users: ${err.message}`});
    });
};

// {
//     "clinicid": "1",
//     "firstname": "jdfd",
//     "id": 0,
//     "lastname": "3434",
//     "phone": "3434444434",
//     "roleid": "5",
//     "useremail": "scaucek2019@gmail.com",
//     "userpassword": "sdsdsdsd"
// }
http://localhost:3000/api/v1/auth/signup - PUT
exports.apiSignupUser = async (req, res, next) => {
    var error = '';
    try {
        var errors = validationResult(req);

        if(!errors.isEmpty())
        {
            if(errors.errors.length > 0){
                this.error = errors.errors[0].msg;
                error.status  = 200;
                return res.status(200).jsonp({status: 'false', message: this.error});
            }
            else{
                error = new Error('Validation failed');
                error.status  = 200;
                return res.status(200).jsonp({status: 'false', message: this.error});
            }
            error.data  = errors.array();
            if(error.data.length > 0){
                return res.status(error.status).jsonp({message:error.data[0].msg});
            }
            //var dd = error.data.filter(d => d.value === "admin@gmail.com");
            //return res.status(error.status).json({message:error.data});
        }

            var firstname   = req.body.firstname;
            var lastname    = req.body.lastname ? req.body.lastname : '';
            var username    = req.body.useremail;
            var password    = req.body.userpassword;
            var phone       = req.body.phone ? req.body.phone : '';
            var roleid      = req.body.roleid ? req.body.roleid: 0;
            var clinicid      = req.body.clinicid ? req.body.clinicid: 1;
        
        await bcrypt.hash(password, 10).then( hashedPassword => {
            const newuser = new UserModel(null, firstname, lastname, username, hashedPassword, roleid, phone, clinicid);
            newuser.save().then(data => {
                userId = data[0].insertId;
                logger.info(`User '${username}' has successfully registered`);
                logger.info(data[0]);
                return res.status(201).json({status: 'true', message: '', result:`User '${username}' has successfully registered`});
            })
            .catch(error => {
                throw error;
                //return res.status(500).json({message:error.message});
            });
        })
        .catch(err => {
            if(!err.status){
                err.status = 500;
                next(err);
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.apiUpdateUser = async (req, res, next) => {
    try {
        var errors = validationResult(req);
        if(!errors.isEmpty())
        {
            const error = new Error('Validation failed');
            error.status  = 422;
            error.data  = errors.array();
            throw error;
            if(error.data.length > 0){
                return res.status(error.status).jsonp({message:error.data[0].msg});
            }
            //var dd = error.data.filter(d => d.value === "admin@gmail.com");
            //return res.status(error.status).json({message:error.data});
        }
            var id          = req.body.id ? req.body.id : 0;
            var firstname   = req.body.firstname;
            var lastname    = req.body.lastname ? req.body.lastname : '';
            var username    = req.body.useremail;
            var password    = req.body.userpassword ? req.body.userpassword : '';
            var phone       = req.body.phone ? req.body.phone : '';
            var roleid      = req.body.roleid ? req.body.roleid: 0;

        UserModel.fetchById(id).then(([user]) => {
            if(user.length <= 0){
                logger.info(`User update: User '${username}' does not exists`);
                return res.status(200).json({message:`User '${username}' does not exists`});
            }
            else{
                logger.info(JSON.stringify(user[0]));
                const newuser = new UserModel(id, firstname, lastname, user[0].username, password, roleid, phone);
                newuser.update().then(data => {
                    logger.info(`User detail of '${username}' have successfully updated`);
                    logger.info(data[0]);
                    return res.status(201).json({status: "true", message:`User detail have successfully updated`});
                })
                .catch(error => {
                    return res.status(200).json({status:"false", message:error.message});
                });
            }
        })
        .catch(err => {
            logger.error(`Unable to get user for ${id}: ${err.message}`);
            if(!err.status){
                err.status = 500;
                next(err);
            }
            //return res.status(401).json({message:`Unable to get user for ${id}: ${err.message}`});
        });
    } catch (error) {
        next(error);
    }
};

exports.apiUserLogin = (req, res, next) => {
    var errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error('Validation failed');
        error.status  = 422;
        error.data  = errors.array();
        if(error.data.length > 0){
            return res.status(error.status).json({status:false, message:error.data[0].msg});
        }
        //var dd = error.data.filter(d => d.value === "admin@gmail.com");
        //return res.status(error.status).json({message:error.data});
    }
    try {
        var username    = req.body.useremail;
        var password    = req.body.userpassword ? req.body.userpassword : '';

        //var authService = new AauthService();//(req, res);
        AuthService.loginService(username, password, next)
        .then(data => {
            if(data.status){
                var loggedInUser = data.user;
                delete loggedInUser.password;
                return res.status(200).json({status:data.status, message:'successfylly logged in', user: loggedInUser, token:data.token });
            }else{
                return res.status(200).json({status:data.status, message:data.message });
            }
        }).catch(error => {
            return res.status(500).json({status:false, message:error.message });
        });
        
    } catch (error) {
        next(error);
    }
};

exports.apiUpdatePassword = (req, res, next) => {
    var errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const error = new Error('Validation failed');
        error.status  = 422;
        error.data  = errors.array();
        if(error.data.length > 0){
            return res.status(error.status).json({status:false, message:error.data[0].msg});
        }
        //var dd = error.data.filter(d => d.value === "admin@gmail.com");
        //return res.status(error.status).json({message:error.data});
    }

    try {
        var username = req.body.useremail ? req.body.useremail : '';
        var id = req.body.id ? req.body.id :0;
        var oldPassword = req.body.userpassword ? req.body.userpassword : '';
        var newPassword = req.body.newpassword ? req.body.newpassword : '';
        var confirmPassword = req.body.confirmpassword ? req.body.confirmpassword: '';

        if(newPassword !== confirmPassword)
        {
            return res.status(200).json({status:false, message:'Confirm password does not match'});  
        }

        AuthService.changePasswordService(username, oldPassword)
        .then(async (data) => {
            if(data.status){
                if(newPassword === confirmPassword)
                {   
                    await bcrypt.hash(newPassword, 10)
                    .then(hashedPassword => {
                        const updatePasswordUser = new UserModel(id, null, null, username, hashedPassword, null, null);
                        updatePasswordUser.updatePassword()
                        .then(data => {
                            return res.status(200).json({status:true, message:'Password updated successfylly'});
                        })
                        .catch(error => {
                            return res.status(200).json({status:false, message:error.message});
                        })
                    })
                    .catch(err => {
                        if(!err.status){
                            err.status = 500;
                            next(err);
                        }
                    });

                }
            }else{
                return res.status(422).json({status:data.status, message:data.message });
            }
        })
        .catch(error => {
            throw error;
        });


    } catch (error) {
        next(error);
    }
}

exports.persistuser = (req, res, next) => {
    try {
        req.session.user = req.body;
        req.session.isLoggedIn = true;
        req.isUserAuthenticated = true;
        logger.info(`Received user to persist: '${req.body}`);
        logger.info(`'user '${req.body.username}' has been Persisted`);
        res.status(201).json({status:true, message:'loggedIn'});
    } catch (error) {
        req.session.isLoggedIn = false;
        req.isAuthenticated = false;
        next(error);
    }
};
