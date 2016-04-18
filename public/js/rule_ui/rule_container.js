/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    var self = this;
	var name = null;
	var treeMap = null;

    var id;
    if(!id)id=0;

    /*
    Public methods
     */

	// Given a rule from the database, initialize the container for it
	self.initRule = function(ruleInfo) {
		treeMap = translate(ruleInfo.rule, null);
		name = ruleInfo.name;
		console.log(treeMap);
	};

    // Returns the information about a specific dot
	self.getDot = function(dotId) {
		return treeMap[dotId];
	};

    self.updateRanges = function(dotId, newRanges) {
        treeMap[dotId].ranges = newRanges;
    };

    self.getRule = function() {
        return treeMap;
    };

    // Adds a new branch to the given dot, with the given range
    self.addBranch = function(dotId, range) {
        var dot = treeMap[dotId];
        id++;
        var newDot = {
            "dotId" : id,
            "type" : 'EmptyDecision',
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

    // Set the type for an existing dot
    self.setDotType = function(dotId, newType) {
        treeMap[dotId].type = newType;
        ruleGraphics.updateTree();
    };

    self.deleteDot = function(dotId) {
        var dot = treeMap[dotId];
        // Delete all of its children before deleting this dot
        // Do it in reverse so each child can delete itself from the branches array
        // without disrupting the other children
        while (dot.branches.length !== 0) {
            self.deleteDot(dot.branches[0]);
        }
        // Delete the branch to this dot
        var parent = treeMap[dot.parent];
        parent.branches.splice(parent.branches.indexOf(dotId), 1);
        delete treeMap[dotId];
        ruleGraphics.updateTree();
    };

    // Set the node ID for a node actuator
    // Also set the data attribute for this dot (Keeps the number of items consistent)
    self.setNodeId = function(dotId, nodeId, defaultData) {
        treeMap[dotId].nodeId = nodeId;
        treeMap[dotId].data = defaultData;
    };

    // Update the actuator data for a NodeInput
    self.setNodeData = function(dotId, newData) {
        treeMap[dotId].data = newData;
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