/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
	var name = null;
	var treeMap = null;

    var id;
    if(!id)id=0;

    /*
    Public methods
     */

	// Given a rule from the database, initialize the container for it
	this.initRule = function(ruleInfo) {
		treeMap = translate(ruleInfo.rule, null);
		name = ruleInfo.name;
		console.log(treeMap);
	};

    // Returns the information about a specific dot
	this.getDot = function(dotId) {
		return treeMap[dotId];
	};

    this.updateRanges = function(dotId, newRanges) {
        treeMap[dotId].ranges = newRanges;
    };

    this.getRule = function() {
        return treeMap;
    };

    // Adds a new branch to the given dot, with the given range
    this.addBranch = function(dotId, range) {
        var dot = treeMap[dotId];
        id++;
        var newDot = {
            "dotId" : id,
            "type" : '',
            "parent" : dot.dotId,
            "branches" : [],
            "ranges" : [],
            "nodeId" : null,
            "data" : [],
            "datastreamId" : null};
        dot.branches.push(newDot.dotId);
        dot.ranges.push(range);
        treeMap[newDot.dotId] = newDot;
        ruleGraphics.updateTree();
    };

    //
    this.setDotType = function(dotId, newType) {
        treeMap[dotId].type = newType;
        ruleGraphics.updateTree();
    };


	/*
	 Private methods
	 */

	//use pid=null for root node
	//setting id=0 starts effectual id count at 1
	function translate(tree, pid) {
        var newObj = {};
        var temp = {};
        var branchPush = {};
        var rangePush;
        id++;
        var dotId = id,
            type = (tree)?Object.keys(tree)[0]:"EmptyDecision",
            branches = [],
            ranges = [],
            nodeId = null,
            data = [],
            datastreamId = null,
            parentId = pid;
        if (type == 'EmptyDecision')
        {}
        else if (type == 'NodeInput') {
            data = tree[type].data;
            nodeId = tree[type].nodeId;
        }
        else {
            if (tree[type].datastreamId) {
                datastreamId = tree[type].datastreamId;
            }
            if (tree[type].branches.length) {
                var i;
                for (i = 0; i < tree[type].branches.length; i++) {
                    branchPush = translate(tree[type].branches[i].action, dotId);
                    for (var key in branchPush)
                        temp[key] = branchPush[key];
                    rangePush = tree[type].branches[i].value;
                    if (!rangePush.length)
                        rangePush = [rangePush, null];
                    branches.push(Object.keys(branchPush)[0]);
                    ranges.push(rangePush);
                }
            }
            else if (tree[type].branches.action) {
                branchPush = translate(tree[type].branches.action, dotId);
                rangePush = tree[type].branches.value;
                if (!rangePush.length)
                    rangePush = [rangePush, null];
                branches.push(Object.keys(branchPush)[0]);
                ranges.push(rangePush);
            }
            else {

            }
        }
        newObj[dotId.toString()] = {
            "dotId": dotId,
            "type": type,
            "parent": parentId,
            "branches": branches,
            "ranges": ranges,
            "nodeId": nodeId,
            "data": data,
            "datastreamId": datastreamId
        };
        for (var key in temp) {
            newObj[key] = temp[key];
        }
        return newObj;
    }
}

window.ruleContainer = new RuleContainer();

document.addEventListener('DOMContentLoaded', function() {
    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var ruleId = splitURL[splitURL.length-1].replace(/\D/g,'');

    $.getJSON('/api/rule/' + ruleId, function(data) {
        if (data.success) {
			ruleContainer.initRule(data.rule);
            ruleGraphics    .updateTree();
        } else {
            console.log(data.error);
        }
    });
});