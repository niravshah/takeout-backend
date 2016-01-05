var Rating = require('../models/ratings');
var _ = require('underscore');

module.exports = function(logger) {
    
    var module = {}
    var rL = logger.child({module:"ratings"});
    
    module.createNewRating = function(toId, fromId, rating, callback) {
        var newRating = Rating({
            created: new Date,
            toId: toId,
            fromId: fromId,
            rating: rating
        });
        newRating.saveAsync().then(function(rating) {
            callback(null, rating)
        }).
        catch(function(err) {
            callback(err, null)
        })
    }

    module.getRatings = function(id, callback) {
        Rating.findAsync({
            toId: id
        }).then(function(ratings) {
            rL.info({event:'new',result:ratings}, 'Get Ratings Called');
            callback(null, ratings)
        }).
        catch(function(err) {
            callback(err, null)
        })
        
    }

    module.getAvgRating = function(id, callback) {
        Rating.findAsync({
            toId: id
        }).then(function(ratings) {

            var pList = _.pluck(ratings,'rating');
            var reduced = _.reduce(pList,function(memo,num){return parseInt(memo)+parseInt(num)},0)
            var avg = reduced/pList.length
            callback(null, avg)
        }).
        catch(function(err) {
            callback(err, null)
        })
    }

    return module;  

}