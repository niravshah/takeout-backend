var exports = module.exports = {};
var google_client_id = "1054636785796-j4ekc1r25nlmq0ut4fgehdqbi3i1o1on.apps.googleusercontent.com"
var superagent = require('superagent');
var User = require('./models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gdn');
exports.gdnTest = function(id) {
  return gdn.get(id);
}

exports.registerUserGCMToken = function(token, aId, personEmail, eC, rC) {
  User.find({
    accountId: aId
  }, function(err, users) {
    if(users.length) {
      console.log('Token',token)
      users[0].gcm = '"' + token + '"';
      console.log(users[0])
      users[0].save(function(err){if(err) throw err; console.log('GCM ID Updated!')});
    } else {
      console.log('GCM - No Corresponding User Found')
    }
  })
}

exports.validateTokenFromGoogle = function(token, userProps, errCallback, resCallback) {
  superagent.get("https://www.googleapis.com/oauth2/v3/tokeninfo").query({
    id_token: token
  }).end(function(err, resp) {
    if(err) {
      errCallback(err)
    }
    if(resp.body.aud == google_client_id) {
      User.find({
        accountId: resp.body.sub
      }, function(err, user) {
        if(err) throw err
        if(user.length) {
          //console.log('Existing User:', user);  
          resCallback(user)
        } else {
          var newUser = User({
            personName: userProps.personName,
            personEmail: userProps.personEmail,
            accountId: userProps.accountId,
            personPhoto: userProps.personPhoto,
            active: true,
            gcm:''
          });
          //console.log('Saving User:', newUser)
          newUser.save(function(err, newUsr) {
            if(err) throw err
            //console.log('New User:', newUsr);
            resCallback(newUsr)
          });
        }
      });
    }
  });
}