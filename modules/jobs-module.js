var exports = module.exports = {};
var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var geoLib = require('geolib');

var Job = require('../models/job');
var User = require('../models/user');

exports.createNewJob = function(jobId, key, requester_id, pickup_latd, pickup_lngd, drop_latd, drop_lngd, service, address) {
     
    var val = requester_id + ":" + jobId + ":" + pickup_latd + ":" + pickup_lngd + ":" + drop_latd + ":" + drop_lngd + ":" + address;
    rediscli.set(key, val)
    var jobsKey = "jobs:" + requester_id;
    rediscli.rpush(jobsKey, jobId)
    
    exports.updateJobStatus(key, "New");

    User.findAsync({
        accountId: requester_id
    }).then(function(user) {

        var newJob = Job({
            jobId: jobId,
            jobKey: key,
            requesterId: requester_id,
            rid:user[0]._id,
            pickupLatd: pickup_latd,
            pickupLong: pickup_lngd,
            dropLatd: drop_latd,
            dropLong: drop_lngd,
            serviceId: service,
            currentStatus: "new",
            servicedby:'',
            created: new Date,
            address:address
        });
    
        newJob.saveAsync().then(function(newJob) {}).catch(function(err) {})
    });
    
};

exports.updateJobStatus = function(jobkey, status) {
    rediscli.set(jobkey + ":status", status);
    Job.findAsync({
        jobKey: jobkey
    }).then(function(jobs) {
        if(jobs.length){
            jobs[0].currentStatus = status;
            jobs[0].saveAsync().then(function(job){}).catch(function(err){})
        }
    }).catch(function(err) {})
};

exports.updateJobServicedBy = function(jobkey, ninja) {
  
    User.findAsync({
        accountId: ninja
    }).then(function(user) {
        Job.findAsync({
            jobKey: jobkey
        }).then(function(jobs) {
            if(jobs.length){
                jobs[0].sid = user[0]._id;
                jobs[0].saveAsync().then(function(job){}).catch(function(err){})
            }
        }).catch(function(err) {})    
    });
     
}

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

exports.findJobsByRequesterId = function(requester,callback){
     Job.findAsync({
        requesterId: requester
    }).then(function(jobs) {
        if(jobs.length){
           callback(null,jobs)
        }else{
            console.log('No Live Jobs found')
            callback(null,[])
        }
    }).catch(function(err) {
         callback(err,null)
     })       
}

exports.findLiveJobsByRequesterId = function(requester,callback){
     Job.findAsync({
        requesterId: requester,
        currentStatus:{ $in: ['new', 'in_progress','looking_for_drivers'] }
    }).then(function(jobs) {
        if(jobs.length){
           callback(null,jobs)
        }else{
            console.log('No Live Jobs found')
            callback(null,[])
        }
    }).catch(function(err) {
         callback(err,null)
     })       
}

exports.findPaymentPendingJobsByRequester = function(requester,callback){
          
    Job.find({
        requesterId: requester,
        currentStatus:{ $in: ['payment_pending'] }
    }).populate('sid').exec(function(err,jobs){
        if(err){
            callback(err,null)
        }else if(jobs.length){
            var results = jobs.map(function(job){
                return {jobId:job.jobId,currentStatus:job.currentStatus, address: job.address, date: job.created,servicedby:job.sid.personName, sid:job.sid.accountId,sphoto:job.sid.personPhoto}
            })            
            console.log('findPaymentPendingJobsByRequester', results)
            callback(null,results)
        }else{
            console.log('No Jobs found')
            callback(null,[])
        }     
    })
}


exports.findJobsByServicer = function(requester,callback){
     Job.findAsync({
        servicedby: requester
    }).then(function(jobs) {
        if(jobs.length){
           callback(null,jobs)
        }else{
            console.log('No Live Jobs found')
            callback(null,[])
        }
    }).catch(function(err) {
         callback(err,null)
     })       
}

exports.findLiveJobsByServicer = function(requester,callback){
     Job.findAsync({
        servicedby: requester,
        currentStatus:{ $in: ['new', 'in_progress','looking_for_drivers'] }
    }).then(function(jobs) {
        if(jobs.length){
           callback(null,jobs)
        }else{
            console.log('No Live Jobs found')
            callback(null,[])
        }
    }).catch(function(err) {
         callback(err,null)
     })       
}

exports.findPaymentPendingJobsByServicer = function(servicer,callback){
    
                
    Job.find({
        servicedby: servicer,
        currentStatus:{ $in: ['payment_pending'] }
    }).populate('rid').exec(function(err,jobs){
        if(err){
            callback(err,null)
        }else if(jobs.length){
            var results = jobs.map(function(job){
                return {jobId:job.jobId,currentStatus:job.currentStatus, address: job.address, date: job.created, rname:job.rid.personName, rid:job.rid.accountId,rphoto:job.rid.personPhoto}
            })            
            console.log('findPaymentPendingJobsByServicer', results)
            callback(null,results)
        }else{
            console.log('No Jobs found')
            callback(null,[])
        }
    });

         
}





exports.findJobsByAssigneeAndStatus = function(asignee,status,callback){
     Job.findAsync({
        servicedby: asignee,
        currentStatus:status
    }).then(function(jobs) {
        if(jobs.length){
           callback(null,jobs)
        }else{
            console.log('No Jobs found')
            callback(null,[])
        }
    }).catch(function(err) {
         callback(err,null)
     })   
}

exports.getJobInfo = function(requester_id, jobid, callback) {
    var key = "job:" + requester_id + ":" + jobid;
    var key1 = "job:" + requester_id + ":" + jobid + ":status";
    var key2 = "job:" + requester_id + ":" + jobid + ":ninja";
    var key3 = key2 + ":current"
    rediscli.mget([key, key1, key3], function(err, response) {
        rediscli.lrange(key2, 0, -1, function(err, result) {
            //console.log(result);
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