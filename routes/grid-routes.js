var nJ = require('./../ninja.js');

module.exports = function(app){

  app.get('/:service/available', function(req, res) {
    nJ.getAllAvailableGrids(req.params.service).then(function(val) {
      res.status(200).send(val)
    });
  });

  app.get('/available/:service/:grid', function(req, res) {
    nJ.getGridNinjas(req.params.service, req.params.grid).then(function(result) {      
      res.status(200).send(result)
    })
  });

}