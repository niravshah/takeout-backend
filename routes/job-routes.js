var nJ = require('./../ninja.js');
var jobs = require('./../jobs.js')

module.exports = function(app){


app.get('/job/:service/:requester_id/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function(req, res) {
  aSync.waterfall([
    function(callback) {
      var key = "ninja:job:" + req.params.requester_id + ":" + shortid.generate();
      jobs.createNewJob(key, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd);
      callback(null, key);
    },
    function(jobkey, callback) {
      nJ.findNinjaForJob(jobkey, req.params.service, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, function(result) {})
      jobs.updateJobStatus(jobkey, 'Ninja Found');
      callback(null, jobkey);
    },
    function(jobkey, callback) {
      nJ.requestPickup(jobkey);
      jobs.updateJobStatus(jobkey, 'Pickup Requested')
      res.status(200).send(jobkey);
    }
  ])
});

app.get('/job/:requester_id/:jobid/reject', function(req, res) {
  var key = "ninja:job:" + req.params.requester_id + ":" + req.params.jobid
  nJ.rejectJob(key)
  res.send('Rejecting Job!');
});

app.get('/job/:requester_id', function(req, res) {
  jobs.getJobs(req.params.requester_id, function(result) {
    res.status(200).send(result)
  });
});

app.get('/job/:requester_id/:jobid', function(req, res) {
  jobs.getJobInfo(req.params.requester_id, req.params.jobid, function(result) {
    res.status(200).send(result)
  });
});




}