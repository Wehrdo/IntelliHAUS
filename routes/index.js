/**
 * Created by David on 2/10/2016.
 */

var middleware = require('./customMiddleware');

module.exports = function(app) {
    // Initialize public routes
    require('./public_routes')(app);

    var node = require('./node_route');
    var datapoint = require('./datapoint_route');
    var user = require('./user_route');
    var home = require('./home_route');

    var privateMiddleware = [middleware.authVerify, middleware.getUser];
    app.use('/node', privateMiddleware, node);
    app.use('/datapoint', privateMiddleware, datapoint);
    app.use('/user', privateMiddleware, user);
    app.use('/home', privateMiddleware, home);
};