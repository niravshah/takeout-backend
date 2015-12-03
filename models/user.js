var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({  
  personName:String,
  personEmail:String,
  accountId:String,
  personPhoto:String,
  gcm: Schema.Types.Mixed, 
  active: Boolean,
  location: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;