var services = require('../modules/markets-module.js')
module.exports = function(app) {
    
    app.post('/api/markets', function(req, res) {
        services.createMarket(req.body.shortId,req.body.name,req.body.description).then(function(data) {
            res.redirect('/pf/markets')
        }).
        catch(function(err) {
            res.status(500).send(err)
        })
    });
}