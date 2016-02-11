/**
 * Created by David on 2/10/2016.
 */

module.exports = function(app) {
    // Homepage route
    app.get('/', function(request, response) {
        response.end("<h1>This is the homepage.</h1><br /> Please move along...")
    });

    var node = require('./node_route');
    var datapoint = require('./datapoint_route');

    app.use('/node', node);
    app.use('/datapoint', datapoint);
};