var exports = module.exports = {};
var gcm = require('node-gcm');

exports.sendNotification = function(gcm_id,details) {
  var message = new gcm.Message();
  message.addData('details', details);
  message.addNotification('message', 'A new Job is available!');
  //var gdn_sender = new gcm.Sender('AIzaSyDkGF_h3MydOEmWnJUcR-1pYQbOiEMFxCU');
  var amigo_sender = new gcm.Sender('AIzaSyAvV7P84-Y5ixZIxuB2RP590R2bBUPaRQI');
  var registrationTokens = [];
  registrationTokens.push(gcm_id);
  amigo_sender.sendNoRetry(message, {
    registrationTokens: registrationTokens
  }, function(err, response) {
    if(err) console.error('Error', err);
    else console.log('response',response);
  });
}

exports.notifyJobRejected = function(gcm_id,details) {
  console.log('notifyJobRejected', gcm_id)
  var message = new gcm.Message();
  message.addData('details', details);
  message.addNotification('message', 'Sorry. Cant service this job right now.');
  var gdn_sender = new gcm.Sender('AIzaSyDkGF_h3MydOEmWnJUcR-1pYQbOiEMFxCU');
  var registrationTokens = [];
  registrationTokens.push(gcm_id);
  gdn_sender.sendNoRetry(message, {
    registrationTokens: registrationTokens
  }, function(err, response) {
    if(err) console.error('Error', err);
    else console.log('response',response);
  });
}

exports.notifyJobAccepted= function(gcm_id,details) {
  console.log('notifyJobAccepted', gcm_id)
  var message = new gcm.Message();
  message.addData('details', details);
  message.addNotification('message', 'Job Accepted!');
  var gdn_sender = new gcm.Sender('AIzaSyDkGF_h3MydOEmWnJUcR-1pYQbOiEMFxCU');
  var registrationTokens = [];
  registrationTokens.push(gcm_id);
  gdn_sender.sendNoRetry(message, {
    registrationTokens: registrationTokens
  }, function(err, response) {
    if(err) console.error('Error', err);
    else console.log('response',response);
  });
}