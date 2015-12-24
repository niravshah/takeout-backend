var exports = module.exports = {};
var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var geoLib = require('geolib');
var Job = require('../models/job');


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