var nJ = require('./../modules/ninja-module.js');
var jobs = require('./../modules/jobs-module.js');
var aSync = require('async');
var shortid = require('shortid');

module.exports = function(app) {
    
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