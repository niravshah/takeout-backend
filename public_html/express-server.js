var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/subscribe');

var subSchema = mongoose.Schema({    
    email:String,
    src: String
});

var Subscription = mongoose.model('Subscription', subSchema);

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    Subscription.find(function(err,subs){
        res.send(subs);      
    })
  
});

app.post('/subscribe', function(req, res){
    var email = req.body.email;
    var src = req.body.src;
    var newSub = new Subscription({ email: email, src:src });        
    newSub.save(function (err, sub) {
        if (err) return console.error(err);
        console.log('New Sub Created!')    
        res.send(sub);
    });
    
});

app.listen(3000, function () {
  console.log('Express Server listening on port 3000!');
});