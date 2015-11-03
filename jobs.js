var exports = module.exports = {};

var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var geoLib = require('geolib');

exports.createNewJob = function(key,requester_id,pickup_latd, pickup_lngd,drop_latd, drop_lngd){    
  var val = requester_id + ":" + pickup_latd + ":" + pickup_lngd + ":" + drop_latd + ":" + drop_lngd;
  rediscli.set(key,val)
  exports.updateJobStatus(key,"New");
};

exports.updateJobStatus = function(jobkey,status){
  rediscli.set(jobkey + ":status",status);
};

exports.getJobInfo = function(requester_id, jobid, callback){
  var key = "ninja:job:" + requester_id + ":" + jobid;
  var key1 = "ninja:job:" + requester_id + ":" + jobid + ":status";
  var key2 = "ninja:job:" + requester_id + ":" + jobid + ":ninja";
  var key3 = key2 + ":current"
  rediscli.mget([key,key1,key3],function(err, response){    
    rediscli.lrange(key2, 0, -1, function(err,result){
      console.log(result);
      var arr = response.concat(result);
      callback(arr)
    })
  })
}

exports.getJobs = function(requester_id, callback){
  var key = "ninja:job:" + requester_id + ":*";  
  rediscli.keys(key,function(err, response){
    callback(response)
  })
}