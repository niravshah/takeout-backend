var subscription = require('./../subscription.js');
var notify = require('./../notifications.js');
var User = require('./../models/user');

module.exports = function(app) {
  
  app.get('/demandnow/notify/:id', function(req, res) {
    User.find({
      accountId: req.params.id
    }, function(err, users) {
      if(users.length) {
        notify.sendNotification(users[0].gcm.replace(/['"]+/g, ''))
        res.status(200).send('Notification Sent to: ', users[0].gcm.replace(/['"]+/g, ''));
      } else {
        res.status(404).send('User Not Found: ', req.params.id);
      }
    });
  });
  
  app.post('/demandnow/gcm', function(req, res) {
    console.log('GCM Token', req.body)
    subscription.registerUserGCMToken(req.body.gcm, req.body.accountId, req.body.personEmail);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });
    
  app.post('/demandnow/activate', function(req, res) {
    console.log('Activation', req.body)
    subscription.updatePassword(req.body.aId, req.body.password);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(req.body)
  });    
  
  app.post('/demandnow/login', function(req, res) {
    console.log(req.body);
    res.setHeader('Cache-Control', 'no-cache');
    subscription.validateTokenFromGoogle(req.body.idToken, req.body, function(err) {
      res.status(500).send('Error')
    }, function(result) {
        console.log(JSON.stringify(result));
      res.status(200).send(JSON.stringify(result))
    })
  });
}