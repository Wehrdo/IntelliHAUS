/**
 * Created by David on 4/7/2016.
 */

function RuleGraphics() {
    /*
    Public methods
     */
    
    var leafNodes={};
    var index=1;
    if(!id)var id=0;
    var radius=20;
    var margin = {top: 20, right: 20, bottom: 30, left: 40};
    var width = 960 - margin.left - margin.right;
    var height = 710 - margin.top - margin.bottom;
    var drag = d3.behavior.drag()  
    	.on('dragstart', dragstarted)
    	.on('drag', dragged)
    	.on('dragend', dragended);
    var zoom = d3.behavior.zoom()
        .scaleExtent([1/5, 5])
        .on("zoom", zoomed);
    var svg;
	var positionData=[{
    	"id":null,
    	"x":null,
    	"y":null,
    	"type":null}];
    var lineData=[{
    	"x1":null,
    	"y1":null,
    	"x2":null,
    	"y2":null,
		"id":null
    }];
    var nodes;
	var depths;
	var positions;
    //Create tree on page load
    this.createTree = function() {
		nodes=ruleContainer.getRule();
		//nodes=translate(nodes, null);
		prepareTreeUpdate();
		drawNodes(positionData, lineData);
    };
	//Create new 'decision' dot
	this.addDecision = function(nid) {
		var parentX=positions[nid].x;
		var parentY=positions[nid].y;
		initNode(nid);
		nodes[nid.toString()].branches.push(id);
		nodes[nid.toString()].ranges.push([null, null]);
		prepareTreeUpdate();
		var newNode = svg.append("circle")
			.attr("class", "dot empty" )
			.attr("cx",  parentX+1 )
			.attr("cy", parentY )
			.attr("r", radius)
			.attr("id", id )
			.attr("onclick", "svg.selectAll('.active').classed('active',false);d3.select(this).classed('active',true);");
		var newLine = svg.append("line")
			.attr("class", "branch")
			.attr("x1", parentX)
			.attr("y1", parentY)
			.attr("x2", parentX+1)
			.attr("y2", parentY)
			.attr("id", nid+"-"+id)
			.attr("onmouseenter", "d3.select(this).classed('focus', true);")
			.attr("onmouseout", "d3.select(this).classed('focus', false);");
		newLine.moveToBack();
		updateTree();
	}
	//Create new 'result' dot
	this.addResult = function(nid) {
		var parentX=positions[nid].x;
		var parentY=positions[nid].y;
		initNode(nid);
		nodes[nid.toString()].branches.push(id);
		nodes[nid.toString()].ranges.push([null, null]);
		prepareTreeUpdate();
		var newNode = svg.append("circle")
			.attr("class", "dot result" )
			.attr("cx",  parentX+1 )
			.attr("cy", parentY )
			.attr("r", radius)
			.attr("id", id )
			.attr("onclick", "svg.selectAll('.active').classed('active',false);d3.select(this).classed('active',true);");
		var newLine = svg.append("line")
			.attr("class", "branch")
			.attr("x1", parentX)
			.attr("y1", parentY)
			.attr("x2", parentX+1)
			.attr("y2", parentY)
			.attr("id", nid+"-"+id)
			.attr("onmouseenter", "d3.select(this).classed('focus', true);")
			.attr("onmouseout", "d3.select(this).classed('focus', false);");
		newLine.moveToBack();
		updateTree();
	}
	//Can be used for both changing branch ranges and visually reordering them. For use after RuleContainer sorts branches.
	this.updateBranches = function(pid, newBranchOrderArr, newRangeOrderArr) {
		nodes[pid.toString()].branches=newBranchOrderArr;
		nodes[pid.toString()].ranges=newRangeOrderArr;
		prepareTreeUpdate();
		updateTree();
	}
	
	this.removeBranch = function(pid, branchId) {
		var i=nodes[pid.toString()].branches.indexOf(branchId);
		if(i > -1)
		{
			nodes[pid.toString()].branches.splice(i,1);
			nodes[pid.toString()].ranges.splice(i,1);
			removeSubtree(pid, branchId);
			prepareTreeUpdate();
			updateTree();
			if(nodes[pid.toString()].branches.length==0)
				d3.select("#"+pid).classed("empty", true);
		}
		
	}
	//Pass rule data from RuleContainer to RuleGraphics without tree creation
	this.loadRuleData = function(newData) {
		nodes=newData;
		// TODO : Possibly add some checks to ensure nothing drastic has changed. My hope is that there is never a need for this method to be called.
	}
	
	/*
    Private methods
     */
	function prepareTreeUpdate() {
		prepareLeafNodes(nodes);
		depths=setDepths(nodes);
		positions=calculatePositions(depths, 1);
		posData(positions);
		linData(positions);
	}
	//Moves all svg elements to their desired location transitionally
	function updateTree() {
		for(var key in positionData)
		{
			var dot=d3.select(document.getElementById(positionData[key].id));
			dot.transition()
				.attr("cx", positionData[key].x)
				.attr("cy", positionData[key].y)
				.duration(500);
		}
		for(var key in lineData)
		{
			var line=d3.select(document.getElementById(lineData[key].id));
			line.transition()
				.attr("x1", lineData[key].x1)
				.attr("y1", lineData[key].y1)
				.attr("x2", lineData[key].x2)
				.attr("y2", lineData[key].y2)
				.duration(500);
		}
	}
	function initNode(pid) {
		id++;
		nodes[id.toString()]={
			"dotId" : id,
			"type" : "EmptyDecision",
			"parent" : pid,
			"branches" : [],
			"ranges" : [],
			"nodeId" : null,
			"data" : null,
			"dataStreamId" : null
		};
	}
    function dragstarted(d) {
      //d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
    }
    
    function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }
    
    function dragended(d) {
      d3.select(this).classed("dragging", false);
      //swapDisplay();
    }
    function zoomed() {
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    
    //Move d3 element to end of siblings
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
	//Move d3 element to first of siblings
    d3.selection.prototype.moveToBack = function() { 
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        }); 
    };
	//Recursively remove branch and all descendants
	function removeSubtree(pid, branchId) {
		var branchDot=document.getElementById(branchId.toString());
		branchDot.parentElement.removeChild(branchDot);
		var branchLine=document.getElementById(pid+"-"+branchId);
		branchLine.parentElement.removeChild(branchLine);
		if(!nodes[branchId.toString()].branches.length)
		{
			//Do nothing for now
		}
		else
		{
			for(var i=0;i<nodes[branchId.toString()].branches.length;i++)
			{
				removeSubtree(branchId, nodes[branchId.toString()].branches[i]);
			}
		}
		delete nodes[branchId.toString()];
	}
	//Update leafNodes object
    function prepareLeafNodes(nodeData) {
    	leafNodes={};
    	index=1;
    	return getLeafNodes(nodeData, 1);
    }
    //Extension of prepareLeafNodes(). Recursively find leaf nodes.
    function getLeafNodes(nodeData, dotId) {
    	var branches=nodeData[dotId.toString()].branches;
    	if(!branches.length)
    	{
    		leafNodes[dotId.toString()]=index++;
    	}
    	else
    	{
    		var i;
    		for(i=0;i<branches.length;i++)
    		{
    			getLeafNodes(nodeData, branches[i]);
    		}
    	}
    	return nodeData;
    }
    
    function setDepths(nodeData, dotId, depth) {
    	var branches=nodeData[dotId.toString()].branches;
    	if(!branches.length)
    	{
    		
    	}
    	else
    	{
    		var i;
    		for(i=0;i<branches.length;i++)
    		{
    			x=setDepths(nodeData, branches[i], depth+1);
    			nodeData[branches[i].toString()]=x[branches[i].toString()];
    		}
    	}
    	nodeData[dotId.toString()].depth=depth;
    	return nodeData;
    }
	
    function setDepths(nodeData) {
    	return setDepths(nodeData, 1, 0);
    }
    
    
    
    function calculatePositions(nodeData, dotId) {
    	var branches=nodeData[dotId.toString()].branches;
    	var x;
    	var y=0;
    	var temp={};
    	if(!branches.length)
    	{
    		x=nodeData[dotId.toString()].depth*160+400;
    		y=400+(leafNodes[dotId.toString()]-Object.keys(leafNodes).length/2)*80;
    	}
    	else
    	{
    		var i;
    		for(i=0;i<branches.length;i++)
    		{
    			if(branches[i].y)
    			{
    				y+=branches[i].y;
    			}
    			else
    			{
    				temp=calculatePositions(nodeData, branches[i]);
    				nodeData[branches[i].toString()]=temp[branches[i].toString()];
    				y+=nodeData[branches[i].toString()].y;
    			}
    		}
    		y/=branches.length;
    		x=nodeData[dotId.toString()].depth*160+400;
    	}
    	nodeData[dotId.toString()].x=x;
    	nodeData[dotId.toString()].y=y;
    	return nodeData;
    }
    function linData(nodeData) {
    	lineData=[];
    	for(var key in nodeData)
    	{
    		var i;
    		for(i=0;i<nodeData[key].branches.length;i++)
    		{
    			var branch=nodeData[nodeData[key].branches[i].toString()];
    			lineData.push({
    				"x1": nodeData[key].x,
    				"y1": nodeData[key].y,
    				"x2": branch.x,
    				"y2": branch.y
    			});
    		}
    	}
    }
    function posData(nodeData) {
    	positionData=[];
    	for(var key in nodeData)
    	{
    		positionData.push({
    			"id": nodeData[key].dotId,
    			"x": nodeData[key].x,
    			"y": nodeData[key].y,
    			"type":nodeData[key].type
    		});
    	}
    }
    	
    function drawNodes(p, l) {
    	svg = d3.select(".rule-drawing")
    		.append("svg")
    		.attr("width", "95%")
    		.attr("height", window.innerHeight)
    		.style("outline","#000000 solid 2px")
    		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    		.call(zoom)
    		.on("dblclick.zoom", null)
    		.append("g");
    	var lines=svg.selectAll(".branch")
    		.data(l)
    		.enter()
    		.append("line")
			.attr("class", "branch")
//			.attr("stroke-width", 2)
//			.attr("stroke", "black")
			.attr("x1", function(d) { return d.x1; })
			.attr("y1", function(d) { return d.y1; })
			.attr("x2", function(d) { return d.x2; })
			.attr("y2", function(d) { return d.y2; })
			.attr("id", function(d) { return d.id; })
			.attr("onmouseenter", function(d) { return "d3.select(this).classed('focus', true);" })
			.attr("onmouseout", function(d) { return "d3.select(this).classed('focus', false);" });
    	var dots = svg.selectAll(".dot")  
    		.data(p)
    		.enter()
    		.append("circle")
    		.attr("class", function(d) { return "dot "+((d.type=="NodeInput")?"result":"decision"); })
    		.attr("cx", function(d) { return d.x; })
    		.attr("cy", function(d) { return d.y; })
    		.attr("r", radius)
    		.attr("onclick", function(d) { return "d3.select('svg').selectAll('.active').classed('active',false);d3.select(this).classed('active',true);sidebar.dotClicked(" + d.id + ");"});
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.ruleGraphics = new RuleGraphics();
});