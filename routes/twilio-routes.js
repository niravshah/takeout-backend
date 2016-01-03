var twi = require('../modules/twilio-module.js')
module.exports = function(app) {
    app.post('/api/phonecode/:user', function(req, res) {
        twi.sendVerificationCode(req.params.user, req.body.phoneNumber, function(result) {
            res.status(200).send(result)
        })
    });
    app.post('/api/phonecode/verify/:user', function(req, res) {
            twi.verifyCode(req.params.user, req.body.code, function(err, result) {
                    if(err) {
                        res.status(400).send(err)
                    } else {
                        res.status(200).send(result)
                    }
            })
    });
}