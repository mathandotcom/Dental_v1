
const userModel = require('../models/user');

exports.allUser = (req, res, next) => {
  userModel.fetchAll()
    .then(([rows, fieldData]) => {
      
      res.render('users/all', {title:'List of users', users:rows});
    })
    .catch(err => {
      return res.status(501).json({message:'Unable to get users'});
    });
}

exports.getUser = (req, res) => {
  orm.selectAllUser(function(error, users){
    if(error){
      return res.status(501).json({message:'Unable to get users'});
    }
    //return res.json({users:users});
    res.render('users/all', {title:'List of users', users:users});
  });
};