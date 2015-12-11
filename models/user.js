//var mongoose = require('mongoose');
var mongoose = require('mongoose-bird')();

var Schema = mongoose.Schema;

var userSchema = new Schema({  
  personName:String,
  personEmail:String,
  accountId:String,
  personPhoto:String,
  gcm: Schema.Types.Mixed, 
  active: Boolean,
  new: Boolean,
  verified: Boolean,
  location: String,
  password: String,
  defaultService:String,
  defaultServiceName:String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
