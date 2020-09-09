const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

var authenicateUser = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if(!bearerHeader){
    const error = new Error('Not authenticated');
    error.status = 401;
    throw error;
  }

  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    const beaerToken = bearer[1];
    const token = beaerToken;
    let decodeToken;
    try{
      decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
    catch(error){
      error.status = 500;
      throw error;
    }
    if(!decodeToken){
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }

    req.userId = decodeToken.data._id;
    req.username = decodeToken.data.username;
    req.firstname = decodeToken.data.firstname;
    req.loggedUser = {
        id:decodeToken.data._id,
        username:decodeToken.data.username,
        firstname:decodeToken.data.firstname,
        lastname:decodeToken.data.lastname,
    }
    next();
  } 
  else {
    const error = new Error('Not authenticated');
    error.status = 403;
    throw error;
  } 
}

module.exports = authenicateUser;