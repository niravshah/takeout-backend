var express = require('express');
var bodyParser = require('body-parser')

var nJ = require('./ninja.js');
var jobs = require('./jobs.js')
var subscription = require('./subscription.js')
var notify = require('./notifications.js')

var aSync = require('async');
var shortid = require('shortid');

var app = express();
app.use(bodyParser.json());


var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/demandnow/notify', function(req, res) {
    notify.sendNotification()    
    res.status(200).send('done');
});

app.post('/demandnow/gcm', function(req, res) {
  console.log('GCM Token',req.body)
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send(req.body)
});


app.post('/demandnow/login', function(req, res) {
  console.log(req.body);  
  res.setHeader('Cache-Control', 'no-cache');
  subscription.validateTokenFromGoogle(req.body.idToken, req.body, function(err){res.status(500).send('Error')},function(result){res.status(200).send({active:true})})
 
});

app.get('/available', function(req, res) {
  nJ.getAllAvailableGrids().then(function(val) {
    res.status(200).send(val)
  });
});

app.get('/available/:grid', function(req, res) {
  nJ.getAvailableGrid(req.params.grid).then(function(result) {
    res.status(200).send(result)
  })
});

app.get('/ninja/:ninjaid', function(req, res) {
  nJ.getNinjaInfo(req.params.ninjaid).then(function(result) {
    res.status(200).send(result)
  });
});

app.get('/ninja/:ninjaid/available/:latd/:lngd', function(req, res) {
  nJ.markNinjaAvailable(req.params.ninjaid, req.params.latd, req.params.lngd, function(result) {
    res.status(200).send(result)
  })
});
app.get('/ninja/:ninjaid/unavailable', function(req, res) {
  nJ.markNinjaUnavailable(req.params.ninjaid).then(function(result) {
    res.sendStatus(result)
  });
});
app.get('/job/:requester_id/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function(req, res) {
  aSync.waterfall([
    function(callback) {
      var key = "ninja:job:" + req.params.requester_id + ":" + shortid.generate();
      jobs.createNewJob(key, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd);
      callback(null, key);
    },
    function(jobkey, callback) {
      nJ.findNinjaForJob(jobkey, req.params.requester_id, req.params.pickup_latd, req.params.pickup_lngd, req.params.drop_latd, req.params.drop_lngd, function(result) {})
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
app.get('/nearby/:pickup_latd/:pickup_lngd', function(req, res) {
  //console.log("findNinjaNearby",req.params.pickup_latd, req.params.pickup_lngd)
  nJ.findNinjaNearby(req.params.pickup_latd, req.params.pickup_lngd, function(result) {
    res.status(200).send(result)
  })
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