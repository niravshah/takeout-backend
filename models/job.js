var mongoose = require('mongoose-bird')();
var Schema = mongoose.Schema;

var jobSchema = new Schema({  
  jobId:String,
  jobKey:String,
  requesterId:String,
  rid:{type: mongoose.Schema.ObjectId, ref: 'User' },
  pickupLatd: String,
  pickupLong:String,
  dropLatd: String,
  dropLong: String,
  serviceId:String,
  currentStatus:String,
  servicedby:String,
  sid:{type: mongoose.Schema.ObjectId, ref: 'User' },
  created:Date,
  address:String
});

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;
