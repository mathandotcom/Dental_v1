const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const logger = require('../logger/logconfig');

dotenv.config();
var authService  = class AuthService{
     
    static loginService(email, password, next) {
        return new Promise((resolve, reject) => {
            userModel.fetchByEmail(email)
                .then(async ([users, fieldData]) => {
                    if (users == null || users.length <= 0) {
                        logger.info(`trying to login as  '${email}' `);
                        logger.info(`No user found for an email id '${email}' \n`);
                        return resolve({ status: false, message: `Oops, No such user exist` }); // with this email '${email}'
                    }
                    try {
                        if (users.length >= 1) {
                            const user = users[0];
                            if (await bcrypt.compare(password, user.password)) {
                                logger.info(`user logged as '${user.username}' `);
                                logger.info(`user details:  '${JSON.stringify(user)}' `);
                                //return done(null, user);
                                var token = generateToken(user);
                                console.log(`Token: ${token}`);
                                return resolve({ status: true, user, token });
                            }
                            else {
                                logger.info(`trying to login as '${user.username}' `);
                                logger.info(`password entered '${password}'`);
                                logger.info(`Incorrect password for '${user.username}' \n`);
                                return resolve({ status: false, message: 'Incorrect password' });
                            }
                        }
                        else {

                            logger.info(`Unable to get user from source for '${user.username}' \n`);
                            return resolve({ status: false, message: 'Unable to get user from source' });
                        }
                    }
                    catch (error) {
                        logger.error(`Error on authenticate user : ${error.stack}`);
                        return reject({ status: false, message: error.message });
                    }
                })
                .catch(err => {
                    logger.error(`Unable to get user from source: '${err.message}'`);
                    logger.error(`Unable to get user from source: '${err.stack}' \n`);
                    console.log('Unable to get user from source: ', err);
                    return reject({ status: false, message: 'Unable to get user from source' });
                });
        });
    }

    static changePasswordService(email, password, next) {
        return new Promise((resolve, reject) => {
            userModel.fetchByEmail(email)
                .then(async ([users, fieldData]) => {
                    if (users == null || users.length <= 0) {
                        logger.info(`trying to login as  '${email}' `);
                        logger.info(`No user found for an email id '${email}' \n`);
                        return resolve({ status: false, message: `User does not exists for an email '${email}'` });
                    }
                    try {
                        if (users.length >= 1) {
                            const user = users[0];
                            if (await bcrypt.compare(password, user.password)) {
                                logger.info(`user logged as '${user.username}' `);
                                logger.info(`user details:  '${JSON.stringify(user)}' `);
                                var token = generateToken(user);
                                return resolve({ status: true, user, token });
                            }
                            else {
                                logger.info(`trying to verify logged in user to change password for '${user.username}' `);
                                logger.info(`password entered '${password}'`);
                                logger.info(`Old password does not match '${user.username}' \n`);
                                return resolve({ status: false, message: 'Current password does not match' });
                            }
                        }
                        else {

                            logger.info(`Unable to get user from source for '${user.username}' \n`);
                            return resolve({ status: false, message: 'Unable to get user from source' });
                        }
                    }
                    catch (error) {
                        logger.error(`Error on authenticate user : ${error.stack}`);
                        return reject({ status: false, message: error.message });
                    }
                })
                .catch(err => {
                    logger.error(`Unable to get user from source: '${err.message}'`);
                    logger.error(`Unable to get user from source: '${err.stack}' \n`);
                    console.log('Unable to get user from source: ', err);
                    return reject({ status: false, message: 'Unable to get user from source' });
                });
        });
    }

}

function generateToken(user) {

    const signature = process.env.JWT_SECRET_KEY;
    const expiration = process.env.JWT_TOKEN_EXPIRATION;

    const data =  {
      _id: user.id,
      firstname: user.firstname,
      lastname:user.lastname,
      username: user.username,
      expiry: expiration
    };

    return jwt.sign({ data, }, signature, { expiresIn: expiration });
  }

module.exports = authService;