var mongoose = require('mongoose-bird')();
var Schema = mongoose.Schema;

var ratingsSchema = new Schema({  
  toId:String,
  fromId:String,
  rating:String,
  created:Date
});

var Ratings = mongoose.model('Ratings', ratingsSchema);

module.exports = Ratings;
