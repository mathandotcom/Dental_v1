const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const logger = require('../logger/logconfig');

var tokenService  = class TokenService{
    static generateToken(user) {
        return new Promise((resolve, reject) => {
            const data =  {
                _id: user.id,
                firstname: user.firstname,
                lastname:user.lastname,
                username: user.username
            };
            const signature = process.env.JWT_SECRET_KEY;
            const expiration = process.env.JWT_TOKEN_EXPIRATION;
            let token = jwt.sign({ data, }, signature, { expiresIn: expiration });
            return resolve({ status: true, user, token });
        });
    };
}


module.exports = tokenService;