

module.exports = function(app, logger) {
    
    var jFL = logger.child({module:"jobsFsm"});
    var fsm = require('./../modules/jobs-fsm-module.js')(jFL);
    
    app.post('/api/job/:service/:requester_id/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function(req, res) {
        fsm.newJob(req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, req.params.service, req.body.deliveryAddress, function(result) {
            jFL.info({jobid:result.id, event:'new', result:result},'New Job Created')
            res.status(200).send(result)
            //res.status(200).send({message:'success'})
        });
    });

    app.get('/api/job/:jobid/:ninjaid/accept', function(req, res) {        
        fsm.acceptJob(req.params.jobid,req.params.ninjaid, function(result){
            jFL.info({jobid:req.params.jobid, event:'accpet', result:result},'Job Accepted')
            res.status(200).send(result)
        })
    });

    app.get('/api/job/:jobid/:ninjaid/reject', function(req, res) {        
        fsm.rejectJob(req.params.jobid,req.params.ninjaid, function(result){
            jFL.info({jobid:req.params.jobid, event:'reject', result:result},'Job Rejected')
            res.status(200).send(result)
        })
    });

    app.get('/api/job/:jobid/:ninjaid/complete', function(req, res) {        
        fsm.completeJob(req.params.jobid,req.params.ninjaid, function(result){
            jFL.info({jobid:req.params.jobid, event:'complete', result:result},'Job Completed')
            res.status(200).send(result)
        })
    });

}