/**
 * Created by David on 2/10/2016.
 */
var jwt = require('jsonwebtoken');
var models = require('../models');

// TODO: Make this secret for real
var SECRET = "hahaThisIsntSecret";

var authVerify = function(req, res, next) {
    var token = req.cookies.accessToken || req.body.accessToken || req.query.accessToken || req.headers['x-access-token'];
    if (!token) {
        res.status(403).json({
            success: false,
            message: 'No token given'
        });
        return;
    }
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) {
            res.status(403).json({
                success: false,
                message: "Unable to validate token"
            });
        }
        else {
            req.parsedToken = {username: decoded};
            next();
        }
    });
};

var getUser = function(req, res, next) {
    models.User.findOne({
        where: {username: req.parsedToken.username.toLowerCase()}
    }).then(function(user) {
        if (user) {
            req.user = user;
            next();
        }
        else {
            res.status(400).end("Could not find user " + req.parsedToken.username);
        }
    })
};

module.exports = function(app) {
    // Initialize public routes
    require('./public_routes')(app);

    var node = require('./node_route');
    var datapoint = require('./datapoint_route');
    var user = require('./user_route');
    var home = require('./home_route');

    var privateMiddleware = [authVerify, getUser];
    app.use('/node', privateMiddleware, node);
    app.use('/datapoint', privateMiddleware, datapoint);
    app.use('/user', privateMiddleware, user);
    app.use('/home', privateMiddleware, home);
};