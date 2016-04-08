var arr=["0","1","2","3","4","5","6","7","8","9"];
var svg=d3.select("svg");
function createDecision(n) {}
function createResult(n) {}

function swapDisplay() {
	if(document.getElementById("new-decision").style.display=="none")
	{
		document.getElementById("new-decision").style.display="block";
		document.getElementById("decision-display").style.display="none";
	}
	else
	{
		document.getElementById("new-decision").style.display="none";
		document.getElementById("decision-display").style.display="block";
	}
}
function assessNode(n) {
	swapDisplay();
}
function deleteBranch(node) {
	
}
function addBranch(node) {
	var level=d3.select(node).property("level");
	var index=node.index;
	
	//levelStacks[level.toString()]=levelStacks[level.toString()]|0+i;
	var cIndex=0;
	var k=0;
	//adjust childIndex value
	for(k=0;k<=node.siblings;k++)
	{
		if(k<index)
			cIndex+=nodes[arr[level]][k].childIndex|0;
		else if(k==node.index)
		{
			nodes[arr[level]][k].childIndex=cIndex+1;
			break;
		}			
	}
	//make changes in height for parents etc.
	propogateHeightChanges(node, 1);
	//establish decision name
	//var nameMap={
	//	"timerow" : "Time" ,
	//	"temprow" : "Temperature" };
	//node.name=nameMap[n];
	//change class
	node.className="dot active decision in-progress";
	//change branches
	node.branches+=1;
	if(!nodes[arr[level+1]])
	{
		nodes[arr[level+1]]=[];
	}
	var width=nodes[arr[level+1]].length+1;
	for(k=0;k<1;k++)
	{
		nodes[arr[level+1]].splice(cIndex , 0 ,
		{ "level" : level+1 ,
		"siblings" : width-1 ,
		"index" : cIndex-k ,
		"type" : null ,
		"childIndex" : null ,
		"branches" : 0 ,
		"height" : 1 ,
		"parentNode" : node ,
		"className" : "dot empty" ,
		"name" : null ,
		"nodeId" : null ,
		"userId" : null
		});
	}
	for(k=0;k<width;k++)
	{
		if(k<cIndex)
			nodes[arr[level+1]][k].siblings=width-1;
		else if(k>=cIndex+1)
		{
			nodes[arr[level+1]][k].siblings=width-1;
			nodes[arr[level+1]][k].index+=1;
		}
			
	}
		
	
	
	
}
function drawBranch() {
	var dot = svg.append("circle")
		//.data([{ x: (width / 2)+20, y: (height / 2), r: 20 }])
		//.enter()
		//.append("circle")
		//.attr("r", function(d) { return d.r; })
		//.attr("cx", function(d) { return d.x; })
		//.attr("cy", function(d) { return d.y; });
		.attr("cx",400)
		.attr("cy",300)
		.attr("r",20)
		.attr("class", "dot empty")
		.attr("onclick", "svg.selectAll('.active').classed('active',false);d3.select(this).classed('active',true);chooseDisplay(this.className.animVal);")
		.property("nodedata",nodes["1"][0])
		.call(drag);
	dot.transition()
		.attr("cx",560)
		.duration(500);
}
function propogateHeightChanges(node, size) {
	node.height+=size-1;
	if(node.parentNode)
		propogateHeightChanges(node.parentNode, size);
}

function calculateHeight() {
	var i=0;
	var maxHeight=0;
	var tempHeight=0;
	var widestLevel;
	while(nodes[arr[++i]])
	{
		//do nothing
	}
	var treeDepth=i;
	for(i=0;i<treeDepth;i++)
	{
		for(var j=0;j<nodes[arr[i]].length;j++)
		{
			tempHeight+=nodes[arr[i]][j].height;
		}
		if(tempHeight>maxHeight)
		{
			maxHeight=tempHeight;
			widestLevel=i;
		}
		tempHeight=0;
	}
	return [maxHeight,widestLevel];
}
function displayNewDecisionSidebar() {
	$("#container").load("newnode.html")
}
function displayDecisionSidebar() {
	$("#container").load("decision.html")
}
function displayResultSidebar() {
	$("#container").load("result.html")
}
function chooseDisplay(c) {
	if(c.match(/empty/))
		displayNewDecisionSidebar();
	else if(c.match(/decision/))
		displayDecisionSidebar();
	else if(c.match(/result/))
		displayResultSidebar();
}


function hide(id) {
	document.getElementById(id).style.display="none";
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
	
	
