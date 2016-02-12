/**
 * Created by David on 2/10/2016.
 */

module.exports = function(app) {
    // Initialize public routes
    require('./public_routes')(app);

    var node = require('./node_route');
    var datapoint = require('./datapoint_route');
    var user = require('./user_route');
    var home = require('./home_route');

    app.use('/node', node);
    app.use('/datapoint', datapoint);
    app.use('/user', user);
    app.use('/home', home);
};