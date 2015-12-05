var mongoose = require('mongoose-bird')();
var Schema = mongoose.Schema;

var serviceSchema = new Schema({  
  serviceId:String,
  serviceName:String,
  serviceDescription:String,
  servicePhoto:String,
  active: Boolean,
  new: Boolean
});

var Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
