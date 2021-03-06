var nJ = require('./../modules/ninja-module.js');
var marketService = require('../modules/markets-module.js');
var servicesService = require('../modules/services-module.js')

module.exports = function(app) {
    app.get('/api/ninja/:ninjaid/:service/available/:latd/:lngd', function(req, res) {
        nJ.markNinjaAvailableWithLatLng(req.params.ninjaid, req.params.service, req.params.latd, req.params.lngd, function(result) {
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200).send({
                'res': result
            })
        })
    });
    app.get('/api/ninja/:ninjaid/:service/unavailable', function(req, res) {
        nJ.markNinjaUnavailable(req.params.ninjaid, req.params.service).then(function(result) {
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200).send({
                'res': result
            })
        });
    });
    app.get('/api/ninja/:ninjaid', function(req, res) {
        nJ.getNinjaInfo(req.params.ninjaid).then(function(result) {
            res.status(200).send(result)
        });
    });
    app.get('/api/ninja/:ninjaid/status/:service', function(req, res) {
        nJ.getNinjaStatus(req.params.ninjaid, req.params.service, function(err, result) {
            res.setHeader('Cache-Control', 'no-cache');
            if(err) res.status(500).send({
                'error': err
            });
            else res.status(200).send({
                'result': result
            })
        });
    });
    app.get('/api/:service/nearby/:pickup_latd/:pickup_lngd', function(req, res) {
        nJ.findNinjaNearby(req.params.service, req.params.pickup_latd, req.params.pickup_lngd, function(result) {
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200).send(result)
        })
    });
}