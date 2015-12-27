var fsm = require('./../modules/jobs-fsm-module.js');

module.exports = function(app) {
    
    app.post('/api/job/:service/:requester_id/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function(req, res) {
        fsm.newJob(req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, req.params.service, req.body.deliveryAddress, function(result) {res.status(200).send(result)});
    });
    
    app.get('/api/job/:jobid/:ninjaid/accept', function(req, res) {        
        fsm.acceptJob(req.params.jobid,req.params.ninjaid, function(result){res.status(200).send(result)})
    });
    
    app.get('/api/job/:jobid/:ninjaid/reject', function(req, res) {        
        fsm.rejectJob(req.params.jobid,req.params.ninjaid, function(result){res.status(200).send(result)})
    });
    
    app.get('/api/job/:jobid/:ninjaid/complete', function(req, res) {        
        fsm.completeJob(req.params.jobid,req.params.ninjaid, function(result){res.status(200).send(result)})
    });

}