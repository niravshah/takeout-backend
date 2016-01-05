var exports = module.exports = {};
var gcm = require('node-gcm');
var Chance = require('chance');
var chance = new Chance();
var partner_sender = new gcm.Sender('AIzaSyAvV7P84-Y5ixZIxuB2RP590R2bBUPaRQI');
var customer_sender = new gcm.Sender('AIzaSyDkGF_h3MydOEmWnJUcR-1pYQbOiEMFxCU');

var sendNotif = function(gcm_id,message, sender){
  var notsId = chance.integer({min: 0});
  message.addData('notsId',notsId);
  var registrationTokens = [];
  registrationTokens.push(gcm_id);
  sender.sendNoRetry(message, {
    registrationTokens: registrationTokens
  }, function(err, response) {
    if(err) console.error('Error', err);
    else console.log('response',response.results);
  });   
}

exports.notifyJobRejected = function(gcm_id,details) {
  console.log('notifyJobRejected', gcm_id)
  var message = new gcm.Message();
  message.addData('details', details);
  message.addData('type','JOB');
  message.addNotification('message', 'Sorry. Cant service this job right now.');
  sendNotif(gcm_id,message, customer_sender)
}

exports.notifyJobAccepted= function(gcm_id,details) {
  console.log('notifyJobAccepted', gcm_id)
  var message = new gcm.Message();
  message.addData('details', details);
  message.addData('type','JOB');
  message.addNotification('message', 'Job Accepted!');  
  sendNotif(gcm_id,message, customer_sender)
}

exports.sendCustomerNotification= function(gcm_id,details) {
  var message = new gcm.Message();
  message.addData('details', details);
  message.addData('type', 'PAYMENT');
  message.addNotification('message', 'Thanks. Payment has been processed.');  
  sendNotif(gcm_id,message, customer_sender)
}

exports.sendRecieverNotification = function(gcm_id,details) {
  var message = new gcm.Message();
  message.addData('details', details);
  message.addData('type', 'PAYMENT');
  message.addNotification('message', 'A new Payment has been recieved!');
  sendNotif(gcm_id,message,partner_sender);
}

exports.sendNotification = function(gcm_id,details,notsid) {
  console.log('sendNotification', details)
  var message = new gcm.Message();
  message.addData('details', details);
  message.addData('type','JOB');
  message.addData('notsId',notsid);
  message.addNotification('message', 'A new Job is available!');
  sendNotif(gcm_id,message,partner_sender);
}

exports.sendCancelNotification = function(gcm_id,notsid) {
  console.log('sendCancelNotification', details)
  var message = new gcm.Message();
  message.addData('details', "");
  message.addData('type','JOB');
  message.addData('notsId',notsid);
  message.addData('action',"cancel");
  sendNotif(gcm_id,message,partner_sender);
}

