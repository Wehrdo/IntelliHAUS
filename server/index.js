/**
 * Created by David on 2/9/2016.
 */

var express = require("express");
var app = express();
var models = require("./models");
var routes = require("./routes");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
var config = require("./" + (process.env.NODE_ENV || "dev") + "_config");

app.set('port', config.port);

models.sequelize.sync().then(function() {
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Initialize routes
routes(app);

