var sMarket = require('../modules/markets-module.js');
var sServices = require('../modules/services-module.js')
module.exports = function(app) {
    app.get('/now', function(req, res) {
        sMarket.getAllMarketsAsync().then(function(data) {
            res.render('market-form', {
                pagename: 'markets form',
                markets: data
            });
        })
    });
    app.get('/now/markets', function(req, res) {
        sMarket.getAllMarketsAsync().then(function(data) {
            res.render('market-form', {
                pagename: 'markets form',
                markets: data
            });
        })
    });
    app.post('/now/markets', function(req, res) {
        res.rediect('/api/market')
    });
    app.get('/now/services', function(req, res) {
        sServices.getAllServicesAsync().then(function(data) {
            //console.log(data);
            res.render('service-form', {
                pagename: 'services form',
                services: data
            });
        }).
        catch(function(err) {})
    });
    app.post('/now/services/new', function(req, res) {
        sServices.createService(req.body.marketShortId, req.body.shortId, req.body.serviceName, req.body.serviceDescription, "", req.body.active).then(function(data) {
            res.redirect('/now/services')
        }).
        catch(function(err) {
            res.status(500).send(err)
        })
    });
    app.get('/now/providers', function(req, res) {
        sMarket.getAllMarketsAsync().then(function(data) {
            sServices.getAllServicesByMarketplaceAsync(data[0]._id).then(function(data1) {
                //console.log(data1)
                res.render('provider-form', {
                    pagename: 'providers form',
                    markets: data,
                    services: data1
                });
            }).
            catch(function(err) {
                console.log('ERROR:' + err)
            })
        }).
        catch(function(err) {
            console.log('ERROR:' + err)
        })
    });
    app.get('/now/providers/:market', function(req, res) {
        sMarket.getMarketById(req.params.market).then(function(data) {
            sServices.getAllServicesByMarketplaceAsync(data[0]._id).then(function(data1) {
                res.render('provider-form', {
                    pagename: 'providers form',
                    markets: data,
                    services: data1
                });
            }).
            catch(function(err) {
                console.log('ERROR:' + err)
            });
        }).
        catch(function(err) {
            console.log('ERROR:' + err)
        })
    })
    app.post('/now/providers/available', function(req, res) {
        //console.log(req.body);
        var redirect_url = "/api/ninja/" + req.body.shortId + "/" + req.body.serviceId + "/available/" + req.body.latitude + "/" + req.body.longitude
        res.redirect(redirect_url);
    });
    app.get('/now/requesters', function(req, res) {
        sMarket.getAllMarketsAsync().then(function(data) {
            sServices.getAllServicesByMarketplaceAsync(data[0]._id).then(function(data1) {
                //console.log(data1)
                res.render('requester-form', {
                    pagename: 'requesters form',
                    markets: data,
                    services: data1
                });
            }).
            catch(function(err) {
                console.log('ERROR:' + err)
            })
        }).
        catch(function(err) {
            console.log('ERROR:' + err)
        })
    });
}