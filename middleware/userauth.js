/*
var checkAuthenticated = (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    if (req.session.isLoggedIn) {
      return next();
    }
    res.redirect('/login');
    //res.status(404).json({error:'true', message:'User is not authenticated'});
}
*/
function checkAuthenticated(req, res, next) {
  req.session.returnTo = req.originalUrl;
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


module.exports = checkAuthenticated;
