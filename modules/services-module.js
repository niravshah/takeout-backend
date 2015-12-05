var exports = module.exports = {};
var Service = require('../models/service');

exports.setAllServices = function(rC, eC) {
    var services = []
    var newService = Service({
        serviceId: 's1',
        serviceName: 'Takeaway Delivery',
        serviceDescription: 'Our Freelancers can help you reach your takeaway orders to your Customers',
        servicePhoto: 'http://riva.com.au/wp-content/uploads/2012/11/delivery.jpg',
        active: true,
        new: false
    });
    newService.saveAsync().then(function(result) {
        rC(result)
    }).
    catch(function(err) {
        eC(err)
    })
}

exports.getAllServices = function(rC,eC) {
    Service.findAsync({}).then(function(docs) {rC(docs)}).catch(function(err){eC(err)});
}