/**
 * Created by David on 2/10/2016.
 */


var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.end("All nodes");
});

module.exports = router;