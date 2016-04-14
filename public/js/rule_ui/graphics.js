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
    	"children":null}];
    var lineData=[{
    	"x1":null,
    	"y1":null,
    	"x2":null,
    	"y2":null
    }];
    
    this.updateTree = function() {
		var nodeData=WHATEVER_THE_DATA_IS_CALLED;
		var nodes=translate(nodeData, null);
		prepareLeafNodes(nodes, 1);
		var depths=setDepths(nodes, 1, 0);
		var positions=calculatePositions(depths, 1);

		posData(positions);
		linData(positions);
		drawNodes(positionData, lineData);
    };

    
    /*
    Private methods
     */
	function translate(tree, pid){
		var newObj={};
		var temp={};
		var branchPush={};
		var rangePush;
		id++;
		var dotId=id,
			type=Object.keys(tree)[0],
			branches=[],
			ranges=[],
			nodeId=null,
			data=null,
			datastreamId=null,
			parentId=pid;
		if(type=='NodeInput')
		{
			data=tree[type].data;
			nodeId=tree[type].nodeId;
		}
		else
		{
			if(tree[type].datastreamId)
				datastreamId=tree[type].datastreamId;
			if(tree[type].branches.length)
			{
				var i;
				for(i=0;i<tree[type].branches.length;i++)
				{
					branchPush=translate(tree[type].branches[i].action, dotId);
					for(var key in branchPush)
						temp[key]=branchPush[key];
					rangePush=tree[type].branches[i].value;
					if(!rangePush.length)
						rangePush=[rangePush, null];
					branches.push(Object.keys(branchPush)[0]);
					ranges.push(rangePush);
				}
			}
			else if(tree[type].branches.action)
			{
				branchPush=translate(tree[type].branches.action, dotId);
				rangePush=tree[type].branches.value;
				if(!rangePush.length)
					rangePush=[rangePush, null];
				branches.push(Object.keys(branchPush)[0]);
				ranges.push(rangePush);
			}
			else
			{

			}
		}
		newObj[dotId.toString()]={
			"dotId" : dotId,
			"type" : type,
			"parent" : parentId,
			"branches" : branches,
			"ranges" : ranges,
			"nodeId" : nodeId,
			"data" : data,
			"dataStreamId" : datastreamId};
		for(var key in temp)
		{
			newObj[key]=temp[key];
		}
		return newObj;
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
    
    
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() { 
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        }); 
    };
    function setHeights(nodeData, dotId) {
    	var height=0;
    	var branches=nodeData[dotId.toString()].branches;
    	if(!branches.length)
    	{
    		height=2;
    	}
    	else
    	{
    		var i;
    		for(i=0;i<branches.length;i++)
    		{
    			x=setHeights(nodeData, branches[i]);
    			height+=x[branches[i].toString()].height;
    			nodeData[branches[i].toString()]=x[branches[i].toString()];
    		}
    	}
    	nodeData[dotId.toString()].height=height;
    	return nodeData;
    }

    
    
    
    function prepareLeafNodes(nodeData) {
    	leafNodes={};
    	index=1;
    	return getLeafNodes(nodeData, 1);
    }
    
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
    	d3.select("svg").remove();
    	svg = d3.select("body")
    		.append("svg")
    		.attr("width", "80%")
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
    		.attr("stroke-width", 2)
    		.attr("stroke", "black")
    		.attr("x1", function(d) { return d.x1; })
    		.attr("y1", function(d) { return d.y1; })
    		.attr("x2", function(d) { return d.x2; })
    		.attr("y2", function(d) { return d.y2; });
    	var dots = svg.selectAll(".dot")  
    		.data(p)
    		.enter()
    		.append("circle")
    		.attr("class", "dot decision")
    		.attr("cx", function(d) { return d.x; })
    		.attr("cy", function(d) { return d.y; })
    		.attr("r", radius)
    		.attr("onclick", "svg.selectAll('.active').classed('active',false);d3.select(this).classed('active',true);");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.ruleGraphics = new RuleGraphics();
});