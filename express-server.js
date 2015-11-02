var nJ = require('./ninja.js')
var express = require('express');
var app = express();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/available', function (req, res) {
  nJ.findAvailable(function(result){res.status(200).send(result)})
});

app.get('/ninja/:ninjaid/available/:latd/:lngd', function (req, res) {
  nJ.markAvailable(req.params.ninjaid,req.params.latd,req.params.lngd,function(result){res.status(200).send(result)})
});
