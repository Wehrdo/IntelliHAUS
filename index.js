/// <reference path="./typefiles/header.d.ts" />
var express = require("express");
var Models = require("./models");
var app = express();
app.set('port', (process.env.PORT || 5000));
var models = new Models(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/intellihaus');
var s = models.sequelize;
models.db.sequelize.sync().then(function () {
    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
    });
});
app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', function (request, response) {
    response.render('pages/index');
});
app.get('/homes ', function (request, response) {
    models.db.User.findAll({
        include: [models.db.Home]
    }).then(function (users) {
        var toSend = "";
        for (var _i = 0; _i < users.length; _i++) {
            var user = users[_i];
            for (var _a = 0, _b = user.homes; _a < _b.length; _a++) {
                var home = _b[_a];
                toSend += home.name + ": " + home.created.toString() + "<br/>";
            }
        }
        response.send(toSend);
    });
});
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
//# sourceMappingURL=index.js.map