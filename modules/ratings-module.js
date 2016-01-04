var exports = module.exports = {};
var Rating = require('../models/ratings');

exports.createNewRating = function(toId, fromId, rating, callback) {
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

exports.getRatings = function(id, callback) {
    Rating.findAsync({
        toId: id
    }).then(function(ratings) {
        callback(null, ratings)
    }).
    catch(function(err) {
        callback(err, null)
    })
}