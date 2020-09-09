const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const logger = require('./logger/logconfig');

const userModel = require('./models/user');

function initializePassport(passport)
{ 
    const authenticateUser = async (email, password, done) => {
        userModel.fetchByEmail(email)
        .then(async ([users, fieldData]) => {
            if(users == null || users.length <= 0){
                logger.info(`trying to login as  '${email}' `);
                logger.info(`No user found for an email id '${email}' \n`);
                return done(null, false, {message:`No user found for an email id ${email}`, username:email})
            }

            try {
                if(users.length >=1 ){
                    const user = users[0];
                    if(await bcrypt.compare(password, user.password)){
                        logger.info(`user logged as '${user.username}' `);
                        logger.info(`user details:  '${JSON.stringify(user)}' `);
                        return done(null, user);
                    }
                    else{
                        logger.info(`trying to login as '${user.username}' `);
                        logger.info(`password entered '${password}'`);
                        logger.info(`Incorrect password for '${user.username}' \n`);
                        return done(null, false, {message:'Incorrect password', username:email});
                    }
                }
                else{
                    
                    logger.info(`Unable to get user from source for '${user.username}' \n`);
                    return done(null, false, {message:'Unable to get user from source', username:email});
                }
            }
            catch(error){
                return done(error);
            }
        })
        .catch(err => {
            logger.error(`Unable to get user from source: '${err.message}'`);
            logger.error(`Unable to get user from source: '${err.stack}' \n`);
            console.log('Unable to get user from source: ', err);
            return done(null, false, {message:'Unable to get user from source', username:email});
        });
    };
    
    passport.use(new LocalStrategy({usernameField:'useremail', passwordField:'userpassword'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, 
            userModel.fetchById(id)
            .then(([rows, fieldData]) => {
                //console.log('fetchById: ', rows[0]);
                return rows[0];
            })
            .catch(err => {
                console.log('fetchById: ', err);
             }
        ));
    });
}

function generateToken(user)
{
    jwt.sign({user}, 'denken', {expiresIn: '130s'}, (err, token) => {
        console.log(token);
        localStorage.setItem("denken", token);
    });
    
}

module.exports = initializePassport;