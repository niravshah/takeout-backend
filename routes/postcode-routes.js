var pcodes = require('../modules/postcodes-module.js')
module.exports = function(app) {
    app.get('/api/addresses/:postcode', function(req, res){        
        pcodes.getAddresses(req.params.postcode, function(results){res.status(200).send(results)})        
    });
}