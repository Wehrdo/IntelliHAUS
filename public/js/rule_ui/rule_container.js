/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    var self = this;
	var name = null;
	var treeMap = null;
	var index = null;
	var svg=d3.select("svg");
	l=0;
	if(typeof id=='undefined')id=0;

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
		self.sortBranches(dotId);
		var positions=prepareTreeUpdate();
		//RuleGraphics.updateTree(positions);
		self.checkBranches(dotId);
    };
	//TODO: implement infinite values
	self.sortBranches = function(dotId) {
		var ranges = treeMap[dotId].ranges;
		var branches = treeMap[dotId].branches;
		var i,j,iMin;
		for (j = 0; j < ranges.length; j++) 
		{
			iMin = j;
			for(i = j+1; i < ranges.length; i++) 
                if (ranges[i][0] < ranges[iMin][0]) 
					iMin = i;
			if(iMin != j) 
			{
				var temp=ranges[j];
				ranges[j]=ranges[iMin];
				ranges[iMin]=temp;
				temp=branches[j];
				branches[j]=branches[iMin];
				branches[iMin]=temp;
			}
		}
	}
	self.checkBranches = function(dotId) {
		var ranges = treeMap[dotId].ranges;
		var branches = treeMap[dotId].branches;
		var i;
		if(!ranges.length)
			return;
		if(ranges[0][0] > ranges[0][1])
			RuleGraphics.BranchConflict(dotId, branches[0]);
		for(i = 0; i < ranges.length-1; i++)
		{
			if(ranges[i][1] > ranges[i+1][0] || ranges[i+1][0] == "NEGATIVE_INFINITY" || ranges[i][1] == "POSITIVE_INFINITY")
			{
				ruleGraphics.branchConflict(dotId, branches[i]);
				ruleGraphics.branchConflict(dotId, branches[i+1]);
			}
			else if(ranges[i+1][0] > ranges[i+1][1])
				ruleGraphics.branchConflict(dotId, branches[i+1]);
		}
	}

    self.getRule = function() {
        return treeMap;
    };
	
	self.getPositions = function() {
		return prepareTreeUpdate();
	}

    // Adds a new branch to the given dot, with the given range
    self.addBranch = function(dotId, range) {
        var dot = treeMap[dotId];
        id++;
        var newDot = {
            "dotId" : id.toString(),
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
		var positions=prepareTreeUpdate();
        ruleGraphics.addDecision(positions, dotId, range);
    };

    // Set the type for an existing dot
    self.setDotType = function(dotId, newType) {
        treeMap[dotId].type = newType;
        ruleGraphics.setDotType(dotId, newType);
    };

    self.deleteDot = function(pid, branchId) {
        var i=treeMap[pid.toString()].branches.indexOf(branchId);
		if(i > -1)
		{
			treeMap[pid.toString()].branches.splice(i,1);
			treeMap[pid.toString()].ranges.splice(i,1);
			treeMap=removeSubtree(treeMap, pid, branchId);
			var positions=prepareTreeUpdate();
			ruleGraphics.updateTreeDep(positions);
		}
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
    
    // Set the ID to use for a datastream in a DataDecision
    self.setDatastream = function(dotId, dsId) {
        treeMap[dotId].datastreamId = dsId;
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
            "dotId": dotId.toString(),
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
	function prepareTreeUpdate() {
		var leafNodes=prepareLeafNodes(treeMap);
		var x="";
		for(key in leafNodes)
			x+=key+":"+leafNodes[key]+"\n";
		var depths=setTreeDepth(treeMap);
		var positions=calculatePositions(depths, "1", leafNodes);
		return positions;
	}
	/* function initNode(pid) {
		treeMap[id.toString()]={
			"dotId" : id,
			"type" : "EmptyDecision",
			"parent" : pid,
			"branches" : [],
			"ranges" : [],
			"nodeId" : null,
			"data" : null,
			"dataStreamId" : null
		};
	} */
	function removeSubtree(nodeData, pid, branchId) {
		ruleGraphics.removeTreeElements(nodeData, pid, branchId);
		if(!nodeData[branchId].branches.length)
		{
			//Do nothing for now
		}
		else
		{
			for(var i = 0; i < nodeData[branchId].branches.length; i++)
			{
				nodeData=removeSubtree(branchId, nodeData[branchId].branches[i]);
			}
		}
		delete nodeData[branchId];
		return nodeData;
	}
	
	function prepareLeafNodes(nodeData)
	{
    	index=1;
		return getLeafNodes(nodeData, "1");
	}
	
	function getLeafNodes(nodeData, dotId) {
		var leafNodes = {};
    	var branches=nodeData[dotId].branches;
    	if(!branches.length)
    		leafNodes[dotId]=index++;
    	else
    	{
    		var i;
    		for(i = 0; i < branches.length; i++)
    		{
    			var leaves=getLeafNodes(nodeData, branches[i]);
				for(var key in leaves)
					leafNodes[key]=leaves[key];
    		}
    	}
    	return leafNodes;
    }
	function setDepths(nodeData, dotId, depth) {
    	var branches=nodeData[dotId].branches;
    	if(!branches.length)
    	{
    		
    	}
    	else
    	{
    		var i;
    		for(i = 0; i < branches.length; i++)
    		{
    			x=setDepths(nodeData, branches[i], depth+1);
    			nodeData[branches[i]]=x[branches[i]];
    		}
    	}
    	nodeData[dotId].depth=depth;
    	return nodeData;
    }
	function setTreeDepth(nodeData) {
    	return setDepths(nodeData, 1, 0);
    }
	function calculatePositions(nodeData, dotId, leafNodes) {
    	var branches=nodeData[dotId].branches;
    	var x;
    	var y=0;
    	var temp={};
    	if(!branches.length)
    	{
    		x=nodeData[dotId].depth*160+400;
    		y=400+(parseInt(leafNodes[dotId])-(Object.keys(leafNodes).length|0)/2)*80;
    	}
    	else
    	{
    		var i;
    		for(i = 0; i < branches.length; i++)
    		{
    			if(branches[i].y)
    			{
    				y+=branches[i].y;
    			}
    			else
    			{
    				temp=calculatePositions(nodeData, branches[i], leafNodes);
    				nodeData[branches[i]]=temp[branches[i]];
    				y+=nodeData[branches[i]].y;
    			}
    		}
    		y/=branches.length;
    		x=nodeData[dotId].depth*160+400;
    	}
    	nodeData[dotId].x=x;
    	nodeData[dotId].y=y;
    	return nodeData;
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
            ruleGraphics    .createTree();
        } else {
            console.log(data.error);
        }
    });
});