
module.exports = function(app,logger) {
    
    var ratings = require('./../modules/ratings-module.js')(logger);

    app.get('/api/ratings/:id', function(req, res) {
        ratings.getRatings(req.params.id, function(err, result) {
            if(err) res.status(400).send({
                'msg': err
            });
            else res.status(200).send({
                'result': result
            })
        });
    });
    app.get('/api/ratings/:id/avg', function(req, res) {
        ratings.getAvgRating(req.params.id, function(err, result) {
            if(err) res.status(400).send({
                'msg': err
            });
            else res.status(200).send({
                'result': result
            })
        });
    });
    app.post('/api/ratings/:from/:rating/:to', function(req, res) {
        ratings.createNewRating(req.params.to, req.params.from, req.params.rating, function(err, result) {
            if(err) res.status(400).send({
                'msg': err
            });
            else res.status(200).send({
                'result': result
            })
        });
    });
}