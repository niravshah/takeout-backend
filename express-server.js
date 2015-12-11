var express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());

var commonRoutes = require('./routes/common-routes.js')(app);
var ninjaRoutes = require('./routes/ninja-routes.js')(app);
var gridRoutes = require('./routes/grid-routes.js')(app);
var jobRoutes = require('./routes/job-routes.js')(app);
var serviceRoutes = require('./routes/service-routes.js')(app);
var twilioRoutes = require('./routes/twilio-routes.js')(app);

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});



