/**
 * Created by David on 2/9/2016.
 */

var express = require("express");
var app = express();
var models = require("./models");

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

app.get('/', function(request, response) {
    response.end("Homepage");
});

app.get('/homes', function(request, response) {
    models.User.findAll({
        include: [models.Home]
    }).then(function(users) {
        var toSend = "";
        users.forEach(function(user) {
            user.homes.forEach(function(home) {
                toSend += home.name += ": " + home.created.toString() + "<br/>";
            })
        });
        response.end(toSend);
    });
});


