var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({  
  personName:String,
  personEmail:String,
  accountId:String,
  personPhoto:String,
  gcm:String, 
  active: Boolean,
  location: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;