var mongoose = require('mongoose-bird')();
var Schema = mongoose.Schema;

var jobSchema = new Schema({  
  jobId:String,
  jobKey:String,
  requesterId:String,
  pickupLatd: String,
  pickupLong:String,
  dropLatd: String,
  dropLong: String,
  serviceId:String,
  currentStatus:String,
  servicedby:String
});

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;
