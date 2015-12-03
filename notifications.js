var exports = module.exports = {};
var gcm = require('node-gcm');

exports.sendNotification = function(gcm_id) {
  var message = new gcm.Message();
  message.addData('key1', 'msg1');
  message.addNotification('message', 'Alert!!!');
  var sender = new gcm.Sender('AIzaSyDkGF_h3MydOEmWnJUcR-1pYQbOiEMFxCU');
  var registrationTokens = [];
  registrationTokens.push('clYJUM4btSk:APA91bHRjKLaZvIKpTQeSWuqf5qXLNB4RNWivNT0HQs8TCdFdPRNnxwcVgQS2fU6uD9u-5GgW5w0zwhnfATeqlHs6pfi99QqSeHhKYbWvp2s1z3xfK-J0qneF3MEyEfJo_7fFr1lIrUa');
  sender.sendNoRetry(message, {
    registrationTokens: registrationTokens
  }, function(err, response) {
    if(err) console.error('Error', err);
    else console.log('response',response);
  });
}