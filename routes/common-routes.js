    var subscription = require('./../modules/subscription-module.js');
var notify = require('./../modules/notifications-module.js');
var User = require('./../models/user');

module.exports = function(app) {  
  
  app.post('/api/gcm', function(req, res) {
    //console.log('GCM Token', req.body)
    subscription.registerUserGCMToken(req.body.gcm, req.body.accountId, req.body.personEmail,false);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });
    
  app.post('/api/gcm/ninja', function(req, res) {
    //console.log('GCM Token', req.body)
    subscription.registerUserGCMToken(req.body.gcm, req.body.accountId, req.body.personEmail,true);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });    
    
  app.post('/api/activate', function(req, res) {
    subscription.updatePassword(req.body.aId, req.body.password, req.body.personName);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });  
    
 app.post('/api/:accountid/update/image', function(req, res) {
    subscription.updateImage(req.params.accountid, req.body.personPhoto);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });      
  
  app.post('/api/login', function(req, res) {
    //console.log(req.body);
    res.setHeader('Cache-Control', 'no-cache');
    subscription.validateTokenFromGoogle('gdn',req.body.idToken, req.body, function(err) {
      res.status(500).send('Error')
    }, function(result) {
        //console.log(JSON.stringify(result));
        res.status(200).send(JSON.stringify(result))
    })
  });
    
  app.post('/api/ninja/login', function(req, res) {
    //console.log(req.body);
    res.setHeader('Cache-Control', 'no-cache');
    subscription.validateTokenFromGoogle('ninja',req.body.idToken, req.body, function(err) {
      res.status(500).send('Error')
    }, function(result) {
        //console.log(JSON.stringify(result));
        res.status(200).send(JSON.stringify(result))
    })
  });    
}