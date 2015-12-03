var nJ = require('./../ninja.js');

module.exports = function(app){

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

  app.get('/nearby/:pickup_latd/:pickup_lngd', function(req, res) {
    nJ.findNinjaNearby(req.params.pickup_latd, req.params.pickup_lngd, function(result) {
      res.status(200).send(result)
    })
  });


}