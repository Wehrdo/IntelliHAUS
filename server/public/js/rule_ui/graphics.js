/**
 * Created by David on 4/7/2016.
 */

function RuleGraphics() {
	/*
	 Variables
	 */
	var self=this;
	if(typeof id=='undefined')id=0;
	var radius = 20;
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
	var svg=d3.select(".rule-drawing")
		.append("svg")
		.attr("width", "95%")
		.attr("height", window.innerHeight)
		.style("outline","#000000 solid 2px")
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom)
		.on("dblclick.zoom", null)
		.append("g");
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

	/*
	 Public methods
	 */

	//Create tree on page load
	self.createTree = function() {
		var positions=ruleContainer.getPositions();
		//nodes=translate(nodes, null);
		self.posData(positions);
		self.linData(positions);
		drawNodes();
	};
	//Create new 'decision' dot
	self.addDecision = function(nodeData, pid, range) {
		var parentX=nodeData[pid].x;
		var parentY=nodeData[pid].y;
		d3.select(document.getElementById(pid))
			.classed("empty", false);
		var newNode = svg.append("circle")
			.attr("class", "dot decision empty" )
			.attr("cx",  parentX+1 )
			.attr("cy", parentY )
			.attr("r", radius)
			.attr("id", id.toString() )
			.attr("onclick", "ruleGraphics.changeActiveNode(this.id);sidebar.dotClicked(this.id);" );
		var newLine = svg.append("line")
			.attr("class", "branch empty")
			.attr("x1", parentX)
			.attr("y1", parentY)
			.attr("x2", parentX+1)
			.attr("y2", parentY)
			.attr("id", pid+"-"+id)
			.attr("onmouseenter", "d3.select(this).classed('focus', true);")
			.attr("onmouseout", "d3.select(this).classed('focus', false);");
		newLine.moveToBack();
		d3.select(document.getElementById(pid)).classed("empty", false);
		updateTree(nodeData);
	};
	//Create new 'result' dot
	self.addResult = function(nodeData, pid, range) {
		var parentX=nodeData[pid].x;
		var parentY=nodeData[pid].y;
		d3.select(document.getElementById(pid))
			.classed("empty", false);
		var newNode = svg.append("circle")
			.attr("class", "dot result" )
			.attr("cx",  parentX+1 )
			.attr("cy", parentY )
			.attr("r", radius)
			.attr("id", id.toString() )
			.attr("onclick", "ruleGraphics.changeActiveNode(this.id);sidebar.dotClicked(this.id);" );
		var newLine = svg.append("line")
			.attr("class", "branch")
			.attr("x1", parentX)
			.attr("y1", parentY)
			.attr("x2", parentX+1)
			.attr("y2", parentY)
			.attr("id", pid+"-"+id)
			.attr("onmouseenter", "d3.select(this).classed('focus', true);")
			.attr("onmouseout", "d3.select(this).classed('focus', false);");
		newLine.moveToBack();
		d3.select(document.getElementById(pid)).classed("empty", false);
		updateTree(nodeData);
	};

	self.removeTreeElements = function(nodeData, nid, branchId) {
		if((!nodeData[nid]||!nodeData[nid].branches.length)&&!nodeData[nid].default)
			d3.select(document.getElementById(nid)).classed("empty", true);
		remove(document.getElementById(branchId));
		remove(document.getElementById(nid+"-"+branchId));
	};
	self.setDotType = function(dotId, newType) {
		var dotType="dot" + convertType(newType);
		console.log(dotType);
		var dot=d3.select(document.getElementById(dotId));
		if(dot.attr("class").match(/active/))
			dotType=dotType+" active";
		dot.attr("class", dotType);
		console.log(dot.attr("class"));
	};
	self.addDefault = function(nodeData, pid) {
		var parent=nodeData[pid];
		var parentX=parent.x;
		var parentY=parent.y;
		d3.select(document.getElementById(pid))
			.classed("empty", false);
		var newNode = svg.append("circle")
			.attr("class", "dot decision empty" )
			.attr("cx",  parentX+1 )
			.attr("cy", parentY )
			.attr("r", radius)
			.attr("id", id.toString() )
			.attr("onclick", "ruleGraphics.changeActiveNode(this.id);sidebar.dotClicked(this.id);" );
		var newLine = svg.append("line")
			.attr("class", "branch default")
			.attr("x1", parentX)
			.attr("y1", parentY)
			.attr("x2", parentX+1)
			.attr("y2", parentY)
			.attr("id", pid+"-"+id)
			.attr("onmouseenter", "d3.select(this).classed('focus', true);")
			.attr("onmouseout", "d3.select(this).classed('focus', false);");
		newLine.moveToBack();
		updateTree(nodeData);
	}
	self.changeActiveNode = function(nid) {
		d3.selectAll(".dot")
			.classed("active", false);
		d3.select(document.getElementById(nid))
			.classed("active", true);
	}
	self.linData = function(nodeData) {
		lineData=[];
		for(var key in nodeData)
		{
			var i;
			if(nodeData[key].default)
			{
				var def=nodeData[nodeData[key].default];
				lineData.push({
					"x1" : nodeData[key].x,
					"y1" : nodeData[key].y,
					"x2" : def.x,
					"y2" : def.y,
					"id" : nodeData[key].dotId+"-"+def.dotId,
					"type" : "default"
				});
			}
			for(i = 0; i < nodeData[key].branches.length; i++)
			{
				var branch=nodeData[nodeData[key].branches[i]];
				lineData.push({
					"x1" : nodeData[key].x,
					"y1" : nodeData[key].y,
					"x2" : branch.x,
					"y2" : branch.y,
					"id" : nodeData[key].dotId+"-"+branch.dotId,
					"type" : null
				});
			}
		}
	};
	self.posData = function(nodeData) {
		positionData=[];
		for(var key in nodeData)
		{
			positionData.push({
				"id" : nodeData[key].dotId,
				"x" : nodeData[key].x,
				"y" : nodeData[key].y,
				"type" : nodeData[key].type
			});
		}
	};
	self.updateTreeDep = function(nodeData) {
		updateTree(nodeData);
	};
	self.updateTreeInd = function() {
		var positions=RuleContainer.getPositions();
		updateTree(positions);
	};
	self.conflictedBranch = function(pid, branchId) {
		d3.select(document.getElementById(pid+"-"+branchId))
			.attr("class", "branch conflicted");
	};
	self.acceptedBranch = function(pid, branchId) {
		d3.select(document.getElementById(pid+"-"+branchId))
			.attr("class", "branch");
	};
	self.incompleteBranch = function(pid, branchId) {
		d3.select(document.getElementById(pid+"-"+branchId))
			.attr("class", "branch incomplete");
	};
	self.emptyBranch = function(pid, branchId) {
		d3.select(document.getElementById(pid+"-"+branchId))
			.attr("class", "branch empty");
	};
	/*self.eventDecision = function(nid) {
		d3.select(document.getElementById(nid))
			.classed("event-decision", true)
			//.classed("data-decision", false)
			//.classed("time-decision";
	};
	self.dataDecision = function(nid) {
		d3.select(document.getElementById(nid))
			.attr("class", "data-decision");
	};
	self.timeDecision = function(nid) {
		d3.select(document.getElementById(nid))
			.attr("class", "time-decision");
	};
	self.dayDecision = function(nid) {
		d3.select(document.getElementById(nid))
			.attr("class", "day-decision");
	};*/
	
	/*
	 Private methods
	 */

	//Moves all svg elements to their desired location transitionally
	function updateTree(nodeData) {
		self.posData(nodeData);
		self.linData(nodeData);
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
	function convertType(type) {
		if(type=="EmptyDecision")
			return " decision empty";
		else if(type=="EventDecision")
			return " decision event-d";
		else if(type=="DataDecision")
			return " decision data-d";
		else if(type=="TimeDecision")
			return " decision time-d";
		else if(type=="DayDecision")
			return " decision day-d";
		else if(type=="NodeInput")
			return " result";
		return "";
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
	function remove(e) {
		e.parentElement.removeChild(e);
	}


	function drawNodes() {
		var lines=svg.selectAll(".branch")
			.data(lineData)
			.enter()
			.append("line")
			.attr("class", function(d){ return ("branch" + ((d.type)?(" "+d.type):"")); })
			//			.attr("stroke-width", 2)
			//			.attr("stroke", "black")
			.attr("x1", function(d) { return d.x1; })
			.attr("y1", function(d) { return d.y1; })
			.attr("x2", function(d) { return d.x2; })
			.attr("y2", function(d) { return d.y2; })
			.attr("id", function(d) { return d.id.toString(); })
			.attr("onmouseenter", function(d) { return "d3.select(this).classed('focus', true);" })
			.attr("onmouseout", function(d) { return "d3.select(this).classed('focus', false);" });
		var dots = svg.selectAll(".dot")
			.data(positionData)
			.enter()
			.append("circle")
			.attr("class", function(d) { return "dot"+convertType(d.type); })
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", radius)
			.attr("id", function(d) { return d.id.toString(); })
			.attr("onclick", function(d) { return "ruleGraphics.changeActiveNode(this.id);sidebar.dotClicked(this.id);"});
	}
}

document.addEventListener('DOMContentLoaded', function() {
	window.ruleGraphics = new RuleGraphics();
});