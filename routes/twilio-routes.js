var twi = require('../modules/twilio-module.js')


module.exports = function(app) {    
    app.post('/api/phonecode/:user', function(req, res){       
        twi.sendVerificationCode(req.params.user,req.body.phoneNumber, function(result){res.status(200).send(result)})
    });            
    
    app.get('/api/phonecode/verify/:user', function(req, res){       
        twi.verifyCode(req.params.user,req.body.code,function(result){res.status(200).send(result)})
    });            

    
}