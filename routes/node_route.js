/**
 * Created by David on 2/10/2016.
 */

var express = require('express');
var router = express.Router();
var models = require('../models');
var middleware = require('./customMiddleware');

router.get('/', [middleware.getHome], function(req, res) {
    models.Node.findAll({where: {
        HomeId: req.home.id
    }}).then(function(nodes) {
        res.json({
            success: true,
            nodes: nodes
        })
    });
});

var genNames = function(n) {
    var arr = [];
    for (var i = 0; i < n; ++i) {
        arr.push("Input " + i.toString());
    }
    return arr;
};

router.post('/', [middleware.getHome], function(req, res) {
    var name = (req.body.name || "Your Node");
    var inputTypes =(req.body.inputTypes || []);
    var inputNames =(req.body.inputNames || genNames(inputTypes.length));
    var outputType =(req.body.outputType || "");
    var outputName =(req.body.outputName || "Output");

    var newNode = models.Node.build({
        name: name,
        inputTypes: inputTypes,
        inputNames: inputNames,
        outputType: outputType,
        outputName: outputName,
        HomeId: req.home.id
    });
    newNode.save()
        .then(function() {
            res.status(201).json({
                success: true,
                id: newNode.id
            })
        })
        .catch(function (error) {
            res.status(400).json({
                success: false,
                error: error.toString()
            })
        });
});
module.exports = router;