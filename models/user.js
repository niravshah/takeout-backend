//var mongoose = require('mongoose');
var mongoose = require('mongoose-bird')();

var Schema = mongoose.Schema;

var dateMin = [Date(), 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];

var userSchema = new Schema({  
  personName:String,
  personEmail:String,
  accountId:String,
  personPhoto:String,
  gcm: Schema.Types.Mixed,   
  rgcm: Schema.Types.Mixed,   
  new: Boolean,
  verified: Boolean,
  active: Boolean,
  valid_till_m:String,
  valid_till_y:String,
  connected:Boolean,
  location: String,
  password: String,
  defaultService:String,
  defaultServiceName:String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
