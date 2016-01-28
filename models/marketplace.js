var mongoose = require('mongoose-bird')();
var Schema = mongoose.Schema;

var marketplaceSchema = new Schema({  
  shortId:String,
  name:String,
  description:String,
});

var Marketplace = mongoose.model('Marketplace', marketplaceSchema);

module.exports = Marketplace;
