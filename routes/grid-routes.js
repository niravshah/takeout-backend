var nJ = require('./../ninja.js');

module.exports = function(app){

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

}