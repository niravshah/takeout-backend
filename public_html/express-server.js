var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/subscribe', function(req, res){
    var email = req.body.email;
    console.log(email)
    res.send('Thanks!');
});

app.listen(3000, function () {
  console.log('Express Server listening on port 3000!');
});