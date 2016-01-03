var exports = module.exports = {};
var fsm = require('./fsm-module.js');
var jobs = require('./jobs-module.js');
var nots = require('./notifications-module.js');
var nJ = require('./ninja-module.js');
var aSync = require('async');
var geoLib = require('geolib');
var nodecache = require("node-cache");
var shortid = require('shortid');
var redis = require("redis");
var rediscli = redis.createClient();


var jobCache = new nodecache();
var jfsm = new fsm.jFSM();
var global = {}

exports.newJob = function(requester_id, pickup_latd, pickup_lngd, drop_latd, drop_lngd, service, deliveryAddress, fcallback){   
    
    var jobId = shortid.generate();
    var key = "job:" + requester_id + ":" + jobId;

    var job = {id : jobId, key:key, pickup_latd:pickup_latd,pickup_lngd:pickup_lngd, service:service, grid:'',list:'',requester_id:requester_id}
    jobs.createNewJob(jobId, key, requester_id, pickup_latd, pickup_lngd, drop_latd, drop_lngd, service,deliveryAddress);
    aSync.waterfall([
        function(callback) {
            nJ.reverseGeocode(pickup_latd, pickup_lngd, callback)
        },
        function(postcode, callback) {
            nJ.postcodeToGrid(postcode, callback)
        },
        function(grid, callback) {
            nJ.gridToNinjaLocations(service,grid, callback);
        },
        function(gridNinjas, grid,callback) {            
            nJ.locationPoints(true, pickup_latd, pickup_lngd, gridNinjas, callback, grid);
        },
        function(points,grid, callback) {                        
            var plist = geoLib.orderByDistance(points['self'], points)
            callback(null,job, plist,grid)            
        },
        function(job,list,grid){
                 
            if(list.length > 1){
                job.list = list;            
                job.grid = grid;       
                jobs.updateJobStatus(key, 'looking_for_amigos');
                jfsm.newJob(job);
                global[jobId] = job
                fcallback(job);    
            }else{
                jobs.updateJobStatus(key, 'no_amigo_available');
                fcallback(job);  
            }
        }
    ]);
}

exports.acceptJob = function(jobid,ninjaid, callback){
    console.log('acceptJob',jobid,global[jobid],global)
    jfsm.accept(global[jobid])
    callback({msg:'job_accepted'});
}

exports.rejectJob = function(jobid,ninjaid, callback){
    jfsm.reject(global[jobid])
    callback({msg:'job_rejected'});
}

exports.completeJob = function(jobid,ninjaid, callback){
    //console.log('completeJob',jobid,global[jobid],global)
    var job = global[jobid];
    jobs.updateJobStatus(job.key, 'payment_pending');
    nJ.updateNinjaStatus(job.currentNinja,job.service,'available');
    
    var listKey = "ninja:available:" + job.service + ":" + job.grid
    var ninjaKey = "ninja:" + job.currentNinja + ":location"    
    rediscli.sadd(listKey,ninjaKey,function(err,res){});
    delete global[jobid]
    callback({msg:'job_marked_complete'});
}