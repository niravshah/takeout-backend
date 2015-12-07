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
    
    var newService2 = Service({
        serviceId: 's2',
        serviceName: 'Window Cleaners',
        serviceDescription: 'Our Freelancers can help you clean your storefront windows',
        servicePhoto: 'http://www.windowcleanerslondon.co/wp-content/uploads/2015/03/window-cleaner.jpg?quality=100.3015030822570',
        active: true,
        new: false
    });
    newService2.saveAsync().then(function(result) {
        rC(result)
    }).
    catch(function(err) {
        eC(err)
    })
    
    
}

exports.getAllServices = function(rC,eC) {
    Service.findAsync({}).then(function(docs) {rC(docs)}).catch(function(err){eC(err)});
}