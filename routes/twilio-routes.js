var twi = require('../modules/twilio-module.js')


module.exports = function(app) {    
    app.get('/api/code/:to', function(req, res){       
        twi.sendVerificationCode(req.params.to,'441202835085','1234', function(result){res.status(200).send(result)})
    });        
    
}