/**
 * Created by David on 2/10/2016.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.end("All nodes");
});

router.post('/', function(req, res) {
    console.log(req.body);
    res.json(req.body);
});
module.exports = router;