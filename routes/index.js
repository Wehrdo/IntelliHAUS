/**
 * Created by David on 2/10/2016.
 */

var middleware = require('./customMiddleware');

module.exports = function(app) {
    // Initialize public routes
    var publicRoutes = require('./public_routes');
    app.use('/', publicRoutes);

    // Middleware to use on all private API routes
    var privateMiddleware = [middleware.authVerify, middleware.getUser];
    // API routes are all prefixed by /api
    var apiRoutes = require('./api_routes');
    app.use('/api', privateMiddleware, apiRoutes);

    var htmlRoutes = require('./html_routes');
    app.use('/', privateMiddleware, htmlRoutes);

};