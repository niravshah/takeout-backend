var nJ = require('./ninja.js')
var express = require('express');
var app = express();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/available', function (req, res) {
  nJ.getAllAvailableGrids(function(result){res.status(200).send(result)})
});

app.get('/available/:grid', function (req, res) {
  nJ.getAvailableGrid(req.params.grid, function(result){res.status(200).send(result)})
});


app.get('/ninja/:ninjaid', function (req, res) {
  nJ.getNinjaInfo(req.params.ninjaid, function(result){res.status(200).send(result)})
});

app.get('/ninja/:ninjaid/available/:latd/:lngd', function (req, res) {
  nJ.markNinjaAvailable(req.params.ninjaid,req.params.latd,req.params.lngd,function(result){res.status(200).send(result)})
});

app.get('/ninja/:ninjaid/unavailable', function (req, res) {
  nJ.markNinjaUnavailable(req.params.ninjaid, function(result){res.status(200).send(result)})
});

app.get('/job/:pickup_latd/:pickup_lngd/:drop_latd/:drop_lngd', function (req, res) {
  nJ.findNinjaForJob(req.params.pickup_latd, req.params.pickup_lngd,req.params.drop_latd, req.params.drop_lngd, function(result){res.status(200).send(result)})
});

app.get('/nearby/:pickup_latd/:pickup_lngd', function (req, res) {
  nJ.findNinjaNearby(req.params.pickup_latd, req.params.pickup_lngd, function(result){res.status(200).send(result)})
});

