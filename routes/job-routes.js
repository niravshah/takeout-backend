var nJ = require('./../modules/ninja-module.js');
var jobs = require('./../modules/jobs-module.js');
var aSync = require('async');
var shortid = require('shortid');

module.exports = function(app) {
    app.post('/api/job/:service/:requester_id/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function(req, res) {
        aSync.waterfall([
            function(callback) {
                var jobId = shortid.generate();
                var key = "job:" + req.params.requester_id + ":" + jobId
                jobs.createNewJob(jobId, key, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, req.params.service,req.body.deliveryAddress);
                callback(null, key);
            },
            function(jobkey, callback) {
                console.log(jobkey)
                nJ.findNinjaForJob(jobkey, req.params.service, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, function(result) {
                    jobs.updateJobStatus(jobkey, 'Ninja Found');
                    callback(null, jobkey);                    
                })
            },
            function(jobkey, callback) {
                nJ.requestPickup(jobkey);
                jobs.updateJobStatus(jobkey, 'Pickup Requested')
                res.status(200).send({
                    'jobkey': jobkey
                });
            }
        ])
    });
    
    app.get('/api/job/:requester_id/:jobid/reject', function(req, res) {
        var key = "ninja:job:" + req.params.requester_id + ":" + req.params.jobid
        nJ.rejectJob(key);
        res.status(200).send({'result': 'Rejecting Job!'})
    });
    
    app.get('/api/job/:requester_id/:jobid/accept', function(req, res) {
        var key = "ninja:job:" + req.params.requester_id + ":" + req.params.jobid
        //nJ.rejectJob(key);
        res.status(200).send({'result': 'Accepting Job!'})
    });

    
    app.get('/api/jobs/:requester_id', function(req, res) {
        aSync.waterfall([
            function(callback) {
                jobs.getJobKeys(req.params.requester_id, function(result) {
                    callback(null, result)
                });
            },
            function(results, callback2) {
                var respObj = {};
                aSync.each(results, function(jobid, cback) {
                    jobs.getJobInfo(req.params.requester_id, jobid, function(arr) {
                        respObj[jobid] = arr;
                        cback();
                    })
                },function(err){
                    callback2(null, respObj)    
                });
            },
            function(result, callback) {
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).send(result)
            }
        ]);
    });
    app.get('/api/job/:requester_id/:jobid', function(req, res) {
        jobs.getJobInfo(req.params.requester_id, req.params.jobid, function(result) {
            res.status(200).send({'result': result})
        });
    });
}