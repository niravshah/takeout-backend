var services = require('../modules/services-module.js')

module.exports = function(app) {
    app.get('/api/services/init', function(req, res) {
        services.setAllServices(function(result) {
            res.status(200).send(result)
        }, function(err) {
            res.status(500).send(err)
        })
    });
    
    app.get('/api/services', function(req, res) {
        services.getAllServices(function(results) {
            res.status(200).send(results),
            function(error) {
                res.send(500).send(error)
            }
        })
    });
    
}