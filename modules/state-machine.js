var exports = module.exports = {};
var fsm = require('./fsm-module.js');
var jobs = require('./jobs-module.js');
var nots = require('./notifications-module.js');
var nJ = require('./ninja-module.js');
var aSync = require('async');
var geoLib = require('geolib');
var nodecache = require("node-cache");

var jobCache = new nodecache();
var jfsm = new fsm.jFSM();
var global = {}

exports.newJob = function(jobId, key, requester_id, pickup_latd, pickup_lngd, drop_latd, drop_lngd, service, deliveryAddress, fcallback){   
    console.log('newJob Module Function')
    var job = {id : jobId, key:key, pickup_latd:pickup_latd,pickup_lngd:pickup_lngd, service:service, grid:'',list:''}
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
                jobs.updateJobStatus(key, 'Ninja Found');
                jfsm.newJob(job);
                global[jobId] = job
                fcallback(job);    
            }else{
                jobs.updateJobStatus(key, 'No Ninja Available');
                fcallback(job);  
            }
        }
    ]);
}

exports.acceptJob = function(jobid,ninjaid, callback){
    jfsm.accept(global[jobid])
    callback({val:'test'});
}

exports.rejectJob = function(jobid,ninjaid, callback){
    jfsm.reject(global[jobid])
    callback({val:'test'});
}

exports.completeJob = function(jobid,ninjaid, callback){
    jfsm.complete(global[jobid])
    callback({val:'test'});
}