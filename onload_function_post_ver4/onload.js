
currentNode=null;
//levelStacks={"0":[1] , "1":[0]};
tableNodes=[document.getElementById("timerow")];
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

var svg = d3.select("body")
	.append("svg")
    .attr("width", "80%")
    .attr("height", window.innerHeight)
	.style("outline","#000000 solid 2px")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom)
	.on("dblclick.zoom", null)
	.append("g");
var rect = svg.append("rect")
	.attr("class","overlay")
    .attr("width", width)
    .attr("height", height);
var key=["level","index","type","childIndex","branches","height","parent"];
nodes={
	"0" : [{ "level" : 0 ,
		"siblings" : 0 ,
		"index" : 0 ,
		"type" : "decision" ,
		"childIndex" : null ,
		"branches" : 0 ,
		"height" : 1 ,
		"parentNode" : null,
		"className" : "empty",
		"name" : null ,
		"nodeId" : null ,
		"userId" : null}] ,
	"1" : null
	};
var root = svg.selectAll(".dot")  
	.data([{ x: (width / 2), y: (height / 2), r: 20 }])
	.enter()
	.append("circle")
	.attr("class", "dot empty")
	.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; })
	.attr("r", function(d) { return d.r; })
	.attr("onclick", "svg.selectAll('.active').classed('active',false);d3.select(this).classed('active',true);assessNode(currentNode);")
	.property("nodedata",nodes["0"][0])
	.call(drag);

rootNode=nodes["0"][0];
currentNode=rootNode;



