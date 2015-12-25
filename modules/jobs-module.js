var exports = module.exports = {};
var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var geoLib = require('geolib');
var Job = require('../models/job');

exports.createNewJob = function(jobId, key, requester_id, pickup_latd, pickup_lngd, drop_latd, drop_lngd, service, address) {
     var val = requester_id + ":" + jobId + ":" + pickup_latd + ":" + pickup_lngd + ":" + drop_latd + ":" + drop_lngd + ":" + address;
     rediscli.set(key, val)
     var jobsKey = "jobs:" + requester_id;
     rediscli.rpush(jobsKey, jobId)
     exports.updateJobStatus(key, "New");
     var newJob = Job({
         jobId: jobId,
         jobKey: key,
         requesterId: requester_id,
         pickupLatd: pickup_latd,
         pickupLong: pickup_lngd,
         dropLatd: drop_latd,
         dropLong: drop_lngd,
         serviceId: service,
         currentStatus: "New",
         servicedby:''
     });
     newJob.saveAsync().then(function(newJob) {}).
     catch(function(err) {})
};

exports.updateJobStatus = function(jobkey, status) {
    rediscli.set(jobkey + ":status", status);
    Job.findAsync({
        jobKey: jobkey
    }).then(function(jobs) {
        if(jobs.length){
            jobs[0].status = status;
            jobs[0].saveAsync().then(function(job){}).catch(function(err){})
        }
    }).catch(function(err) {})
};

exports.assignJob = function(jobkey,assignee){
    
    rediscli.set(jobkey + ":assignee", assignee);
    Job.findAsync({
        jobKey: jobkey
    }).then(function(jobs) {
        if(jobs.length){
            jobs[0].servicedby = assignee;
            jobs[0].saveAsync().then(function(job){}).catch(function(err){})
        }
    }).catch(function(err) {})    
    
}

exports.getJobInfo = function(requester_id, jobid, callback) {
    var key = "job:" + requester_id + ":" + jobid;
    var key1 = "job:" + requester_id + ":" + jobid + ":status";
    var key2 = "job:" + requester_id + ":" + jobid + ":ninja";
    var key3 = key2 + ":current"
    rediscli.mget([key, key1, key3], function(err, response) {
        rediscli.lrange(key2, 0, -1, function(err, result) {
            console.log(result);
            var arr = response.concat(result);
            callback(arr)
        })
    })
};

exports.getJobKeys = function(requester_id, callback) {
    var key = "jobs:" + requester_id;
    rediscli.lrange(key, 0, -1, function(err, response) {
        callback(response)
    });
};