var nJ = require('./../modules/ninja-module.js');
var jobs = require('./../modules/jobs-module.js');
var aSync = require('async');
var shortid = require('shortid');

module.exports = function(app) {
  

    app.get('/api/jobs/:requester_id/live', function(req, res) {
        jobs.findLiveJobsByRequesterId(req.params.requester_id,function(err,result){
            if(err) res.status(500).send({msg:'Error while retrieving jobs'})
            else {
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).send(result)
            }
        })
    });
    
    app.get('/api/jobs/:requester_id/pending', function(req, res) {
        jobs.findAllPaymentPendingJobs(req.params.requester_id,function(err,result){
            if(err) res.status(500).send({msg:'Error while retrieving jobs'})
            else {
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).send(result)
            }
        })
    });    
    
     app.get('/api/jobs/:requester_id/all', function(req, res) {
        jobs.findAllJobsByRequesterId(req.params.requester_id,function(err,result){
            if(err) res.status(500).send({msg:'Error while retrieving jobs'})
            else {
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).send(result)
            }
        })
    });

    app.get('/api/jobs/asignee/:asignee_id/:status', function(req, res) {
        jobs.findJobsByAssigneeAndStatus(req.params.asignee_id,req.params.status,function(err,result){
            if(err) res.status(500).send({msg:'Error while retrieving jobs'})
            else res.status(200).send({data:result})
        })
    });
    
    app.get('/api/job/:requester_id/:jobid', function(req, res) {
        jobs.getJobInfo(req.params.requester_id, req.params.jobid, function(result) {
            res.status(200).send({'result': result})
        });
    });
}