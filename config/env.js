const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    sessionSecret: process.env.SESSION_SECRET,
    jwt_SecretKey: process.env.JWT_SECRET_KEY,
    port: process.env.PORT
  };