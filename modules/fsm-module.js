var machina = require('machina');
var exports = module.exports = {};
var jobs = require('./jobs-module.js');
var nots = require('./notifications-module.js');
var nJ = require('./ninja-module.js');
var aSync = require('async');
var geoLib = require('geolib');
var redis = require("redis");
var bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var rediscli = redis.createClient();
var Chance = require('chance');
var chance = new Chance();

exports.jFSM = machina.BehavioralFsm.extend( {
    namespace: "jobs-fsm",
    initialState: "start",
    states: {    
        start:{
            _onEnter:function(job){         
                job.list.shift(); 
                if(job.list.length>0){
                    
                    job.currentNinja = job.list[0].key                
                    console.log(job.id + ' : checkoutCurrentNinja _onEnter : Calling :',job.currentNinja);  
                    
                    nJ.markNinjaUnavailable(job.currentNinja,job.service);
                    var key2 = job.key + ":ninja:current";
                    rediscli.set(key2, job.currentNinja , function(err, res) {
                        if(err){
                            console.log('ERROR - Setting Current Ninja to Redis:', err);                                    
                            this.handle(job,"reset");                                                                        
                        }else{ 
                            console.log("Current Ninja Set", res);
                            this.handle(job,"contactNinja");
                        }
                    }.bind(this));                    
                    
                }else{
                    this.handle(job,"terminateJob")
                }
            },
            terminateJob:"jobTerminated",
            contactNinja:"contactNinja",
            reset:"reset"
        },
        reset:{
             _onEnter: function(job) {
                 console.log(job.id + ":Reset");
                 this.handle(job,"restart");
             },
            restart:"start"
        },
        contactNinja: {
             _onEnter: function(job) {
                 console.log(job.id + ' : contactNinja _onEnter : Calling :',job.currentNinja);   
                 jobs.updateJobStatus(job.key, 'looking_for_amigos');
                 job.notsid =  chance.integer({min: 0});
                 nJ.requestPickup(job.key, job.notsid);
                 job.timer = setTimeout( function() {
                     this.logger.info({jobid:job.id,event:'timeout',ninja:job.currentNinja}, "Ninja Rejected")
                     console.log("Timeout",job.id)
                     job.isTimeout = true;
                     nJ.unRequestPickup(job.currentNinja, job.notsid);
                     this.handle(job, "timeout" );
                 }.bind( this ), 30000 );                 
            },
            accept: "jobAccepted",
            reject: "jobRejected",
            timeout: "jobRejected",
            _onExit: function( client ) {
                clearTimeout( client.timer );
            }
        },
        jobRejected: {
            _onEnter:function(job){           
                var listKey = "ninja:available:" + job.service + ":" + job.grid;
                var ninjaKey = "ninja:" + job.currentNinja + ":location";
                if(!job.isTimeout){
                    nJ.markNinjaAvailable(job.currentNinja,job.service);
                }else{
                    job.isTimeout = false;
                    nJ.updateStrikesAndStatus(job.currentNinja,job.service);
                }
                
                console.log(job.id + ' : ninjaRejected',job.currentNinja);
                if(job.list.length > 0){
                    this.handle(job,"restart")    
                }else{
                    this.handle(job,"terminateJob")    
                }
            },
            restart:"start",
            terminateJob:"jobTerminated"
        },
        jobTerminated : {
            _onEnter:function(job){                
                this.logger.info({jobid:job.id,event:'terminated'}, "Job Terminated")
                jobs.updateJobStatus(job.key, 'no_amigo_available');
                nJ.notifyJobRejected(job.requester_id,job.key);
                console.log('Cant find any more Ninjas! Exiting',job.id)
            }
        },
        jobAccepted: {
            _onEnter:function(job){                 
                jobs.updateJobStatus(job.key, 'in_progress');
                jobs.assignJob(job.key,job.currentNinja);
                jobs.updateJobServicedBy(job.key,job.currentNinja);
                nJ.notifyJobAccepted(job.requester_id,job.key);
                console.log('Job Accepted',job.id)
            }
        }
    },
    newJob: function(job, logger) {
        logger.info({jobid:job.id,event:'start'}, "Starting new Job")
        this.logger = logger;
        this.handle(job, "start");
    },
    accept: function(job){
        this.handle(job, "accept" );        
    },
    reject: function(job){
        this.handle(job, "reject" );        
    }
 
} );

