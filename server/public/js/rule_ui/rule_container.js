/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    var self = this;
	var name = null;
	var treeMap = null;
	var index = null;
    var rule_id = null;
	var svg=d3.select("svg");
	l=0;
	if(typeof id=='undefined')id=0;
    /*
    Public methods
     */

	// Given a rule from the database, initialize the container for it
	self.initRule = function(ruleInfo, this_rule_id) {
		treeMap = translate(ruleInfo.rule, null);
		name = ruleInfo.name;
        rule_id = this_rule_id;
		console.log(treeMap);
	};

    self.save = function() {
        var translated = detranslate(treeMap, "1");
        console.log(translated);
        $.ajax({
            url: '/api/rule/' + rule_id,
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                rule: translated
            }),
            success: function(data) {
                if (data.success) {
                    console.log("success");
                } else {
                    console.log("error: " + data.error);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseJSON.error.toString());
            }
        })
    };

    // Returns the information about a specific dot
	self.getDot = function(dotId) {
		return treeMap[dotId];
	};

    self.updateRanges = function(nid, newRanges) {
        treeMap[nid].ranges = newRanges;
		var arr=checkBrokenBranches(treeMap, nid);
		// sortBranches(nid, arr);
		// var positions=prepareTreeUpdate();
		// ruleGraphics.updateTreeDep(positions);
		// //checkBranches(nid);
    };

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
            "datastreamId" : null,
			"default" : null,
			"lifetime" : null};
        dot.branches.push(newDot.dotId);
        dot.ranges.push(range);
        treeMap[newDot.dotId] = newDot;
		var positions=prepareTreeUpdate();
        ruleGraphics.addDecision(positions, dotId, range);
    };

    // Set the type for an existing dot
    self.setDotType = function(dotId, newType) {
        treeMap[dotId].type = newType;
		console.log(newType);
		
		if(newType=="EventDecision")
		{
			id++;
			treeMap[dotId].default = id.toString();
			treeMap[id.toString()]={
				"dotId" : id.toString(),
				"type" : 'EmptyDecision',
				"parent" : dotId,
				"branches" : [],
				"ranges" : [],
				"nodeId" : null,
				"data" : [],
				"datastreamId" : null,
				"default" : null,
				"lifetime" : 1
				};
			var positions=prepareTreeUpdate();
			ruleGraphics.addDefault(positions, dotId);
			ruleGraphics.setDotType(dotId, newType);
		}
	};
	self.deleteAllBranches = function(nid) {
		//console.log(treeMap[nid].branches);
		//console.log(treeMap[nid].branches.length);
		if(treeMap[nid].type=="EventDecision")
		{
			self.deleteBranch(treeMap[nid].default);
		}
		var branches=treeMap[nid].branches;
		var length=branches.length;
		for(var i = 0; i < length; i++)
		{
			self.deleteBranch(branches[0]);
		}
	}
	self.getParent = function(nid) {
		//console.log(treeMap[nid].parent);
		return treeMap[nid].parent;
	}
    self.deleteBranch = function(branchId) {
		
		var pid=treeMap[branchId].parent;
		if(treeMap[pid].default)
		{
			treeMap=removeSubtree(treeMap, pid, treeMap[pid].default);
			var positions=prepareTreeUpdate();
			ruleGraphics.updateTreeDep(positions);
		}
        var i=treeMap[pid].branches.indexOf(branchId);
		if(i > -1)
		{
			treeMap[pid].branches.splice(i,1);
			treeMap[pid].ranges.splice(i,1);
			
			treeMap=removeSubtree(treeMap, pid, branchId);
			var positions=prepareTreeUpdate();
			ruleGraphics.updateTreeDep(positions);
		}
		ruleGraphics.changeActiveNode(pid);
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
	self.setLifetime = function(dotId, lt) {
        treeMap[dotId].lifetime = lt;
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
            parentId = pid,
			def = null,
			lifetime = null;
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
			if(type=="EventDecision")
			{
				lifetime=tree[type].lifetime;
				var default_translated = translate(tree[type].default, dotId);
                for (var key in default_translated)
                    temp[key] = default_translated[key];
                // TODO: Don't assume Object.keys() has the order items were added
				def = Object.keys(default_translated)[0];
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
                    rangePush = [rangePush, undefined];
                branches.push(Object.keys(branchPush)[0]);
                ranges.push(rangePush);
            }
            else {

            }
        }
        newObj[dotId.toString()] = {
            "dotId": dotId.toString(),
            "type": type,
            "parent": (parentId)? parentId.toString():null,
            "branches": branches,
            "ranges": ranges,
            "nodeId": nodeId,
            "data": data,
            "datastreamId": datastreamId,
			"lifetime" : lifetime,
			"default" : def
        };
        for (var key in temp) {
            newObj[key] = temp[key];
        }
        return newObj;
    }
	function sortBranches(dotId, branchArr) {
		var ranges = treeMap[dotId].ranges;
		var branches = treeMap[dotId].branches;
		var i,j,iMin;
		for (j = 0; j < branchArr.length; j++) 
		{
			iMin = branchArr[j];
			for(i = j+1; i < branchArr.length; i++) 
                if (ranges[branchArr[i]][0] < ranges[iMin][0]) 
					iMin = branchArr[i];
			if(iMin != branchArr[j]) 
			{
				var temp=ranges[branchArr[j]];
				ranges[branchArr[j]]=ranges[branchArr[iMin]];
				ranges[branchArr[iMin]]=temp;
				temp=branches[branchArr[j]];
				branches[branchArr[j]]=branches[branchArr[iMin]];
				branches[branchArr[iMin]]=temp;
			}
		}
		treeMap[dotId].ranges=ranges;
		treeMap[dotId].branches=branches;
	}
	function checkBranches(dotId) {
		var ranges = treeMap[dotId].ranges;
		var branches = treeMap[dotId].branches;
		var i;
		if(!ranges.length)
			return;
		if(ranges[0][0] > ranges[0][1])
			ruleGraphics.branchConflict(dotId, branches[0]);
		else
			ruleGraphics.branchAccept(dotId, branches[0]);
		for(i = 0; i < ranges.length-1; i++)
		{
			if((ranges[i][1] > ranges[i+1][0]) || ranges[i+1][0] == "NEGATIVE_INFINITY" || ranges[i][1] == "POSITIVE_INFINITY")
			{
				ruleGraphics.conflictedBranch(dotId, branches[i]);
				ruleGraphics.conflictedBranch(dotId, branches[i+1]);
			}
			else if(ranges[i+1][0] > ranges[i+1][1])
				ruleGraphics.conflictedBranch(dotId, branches[i+1]);
			else
				ruleGraphics.acceptedBranch(dotId, branches[i+1]);
		}
	}
	function checkBrokenBranches(nodeData, nid) {
		var branchArr=[];
		var ranges=nodeData[nid].ranges;
		var branches=nodeData[nid].branches;
		console.log(ranges);
		for(var i = 0; i < ranges.length; i++)
		{
			if(ranges[i][0]===undefined&&ranges[i][1]===undefined)
			{
				console.log("empty");
				ruleGraphics.emptyBranch(nid, branches[i]);
			}
			else if(typeof (ranges[i][0])!="number"||typeof (ranges[i][1])!="number")
			{
				console.log("incomplete");
				ruleGraphics.incompleteBranch(nid, branches[i]);
			}
			else if(typeof (ranges[i][0])=="number" && typeof (ranges[i][1])=="number")
			{
				console.log("accepted");
				branchArr.push(i.toString());
				ruleGraphics.acceptedBranch(nid, branches[i]);
			}
			console.log(i);
		}
		return branchArr;
	}
	function prepareTreeUpdate() {
		var newObject = jQuery.extend(true, {}, treeMap);
		var defaults=makeDefaults(newObject);
		var leafNodes=prepareLeafNodes(defaults);
		var depths=setTreeDepth(defaults);
		var positions=calculatePositions(defaults, "1", leafNodes);
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
			"datastreamId" : null
		};
	} */
	function removeSubtree(nodeData, pid, branchId) {
		ruleGraphics.removeTreeElements(nodeData, pid, branchId);
		if(!nodeData[branchId])
			return nodeData;
		if(nodeData[branchId].default)
		{
			
		}
		if(!nodeData[branchId].branches.length)
		{
			delete nodeData[branchId];
		}
		else
		{
			var branches = nodeData[branchId].branches;
			for(var i = 0; i < branches.length; i++)
			{
				nodeData=removeSubtree(nodeData, branchId, branches[i]);
			}
		}
		delete nodeData[branchId];
		return nodeData;
	}
	function listDescendants(nodeData, obj, branchId) {
		if(nodeData[branchId].branches.length)
		{
			for(var i = 0; i < nodeData[branchId].branches.length; i++)
			{
				var temp = listDescendants(nodeData, obj, nodeData[branchId].branches[i]);
				for(var key in temp.nodes)
					obj.nodes[key]=temp.nodes[key];
				for(var key in temp.lines)
					obj.lines[key]=temp.lines[key];
			}
		}
		else
		{
			obj={
				"nodes" : branchId,
				"lines" : nodeData[branchId].parent+"-"+branchId
			}
		}
		return obj;
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
		{
			
    		leafNodes[dotId]=index++;
    	}
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
    function makeDefaults(nodeData) {
        for(var i=0; i < Object.keys(nodeData).length; i++)
        {
            var obj=Object.keys(nodeData)[i];
            var type=nodeData[obj].type;
            if(type=="EventDecision")
            {
                nodeData[obj].branches.push(nodeData[obj]["default"]);
                nodeData[obj].ranges.push([null, null]);
            }
        }
        return nodeData;
    }
    function detranslate(nodeData, nid, isFirst) {
        var forServer={};
        var node=nodeData[nid];
        if (node === null) {
            return null;
        }
        var type=node.type;
        var nodeId=node.nodeId;
        var data=node.data;
        if(type=="NodeInput") {
            forServer[type]={
                "nodeId" : nodeId,
                "data" :data
            };
            return forServer;
        }
        else if (type == "EmptyDecision") {
            return null;
        }
        else
        {
            forServer[type] = {};
            forServer[type].branches=[];
            var i = 0;
            for(var key in node.branches) {
                forServer[type].branches.push({
                    "value": (type == "EventDecision") ? node.ranges[i][0] : node.ranges[i],
                    "action": detranslate(nodeData, node.branches[i], 0)
                });
                i++;
            }
            if(type=="EventDecision")
            {
                forServer[type].lifetime = node.lifetime;
                forServer[type]["default"] = detranslate(nodeData, node.default);
                forServer[type].datastreamId = node.datastreamId;
            }
            else if(type=="DataDecision")
            {
                forServer[type].datastreamId = node.datastreamId;
            }
            return forServer;
        }
    }
	//console.log(detranslate(treeMap, "1", true));
}

window.ruleContainer = new RuleContainer();

document.addEventListener('DOMContentLoaded', function() {
    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var ruleId = splitURL[splitURL.length-1].replace(/\D/g,'');

    $.getJSON('/api/rule/' + ruleId, function(data) {
        if (data.success) {
			ruleContainer.initRule(data.rule, ruleId);
            ruleGraphics.createTree();
			sidebar.dotClicked("1");
        } else {
            console.log(data.error);
        }
    });
	
});