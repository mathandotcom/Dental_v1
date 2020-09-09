/*
var checkNotAuthenticated = (req, res, next) => {

    if (req.session.isLoggedIn && req.session.returnTo === '/profile') {
      return next();
    }
    else if (!req.session.isLoggedIn && req.originalUrl === '/updateuser' ) {
      return res.redirect('/login');
    }
    else if (req.session.isLoggedIn) {
      return res.redirect('/');
    }
    else{
      return next();
    }
}
*/

function checkNotAuthenticated(req, res, next) {
  req.session.username = req.body.useremail;
  if (req.isAuthenticated() && req.session.returnTo === '/profile') {
    return next();
  }
  else if (!req.isAuthenticated() && req.originalUrl === '/updateuser' ) {
    return res.redirect('/login');
  }
  else if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  else{
    return next();
  }
}
module.exports = checkNotAuthenticated;