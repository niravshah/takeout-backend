//var mongoose = require('mongoose');
var mongoose = require('mongoose-bird')();

var Schema = mongoose.Schema;



var customerSchema = new Schema({  
    accountId:String,
    customerId:String,
    sourceId:String,
    saccountid:String
});

var Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
