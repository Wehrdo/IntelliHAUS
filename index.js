/**
 * Created by David on 2/9/2016.
 */

var express = require("express");
var app = express();
var models = require("./models");
var routes = require("./routes");

app.set('port', 5000);

models.sequelize.sync().then(function() {
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
});


app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Initialize routes
routes(app);


