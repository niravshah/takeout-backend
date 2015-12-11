var twi = require('../modules/twilio-module.js')


module.exports = function(app) {    
    app.get('/api/code/:user/:phone', function(req, res){       
        twi.sendVerificationCode(req.params.user,req.params.phone, function(result){res.status(200).send(result)})
    });            
    
    app.get('/api/code/verify/:user/:code', function(req, res){       
        twi.verifyCode(req.params.user,req.params.code,'441202835085','1234', function(result){res.status(200).send(result)})
    });            

    
}