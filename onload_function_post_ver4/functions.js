var arr=["0","1","2","3","4","5","6","7","8","9"];

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

function createBranches(n, node) {
	//return if no branches requested
	var branches=parseInt(document.getElementById(n).children[1].firstElementChild.value);
	if(branches==0)
		return;
	var level=d3.select(node).property("level");
	var index=node.index;
	var oldBranches=d3.select(node).property("branches")|0;
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
			nodes[arr[level]][k].childIndex=cIndex+branches;
			break;
		}			
	}
	//make changes in height for parents etc.
	propogateHeightChanges(node, branches);
	//establish decision name
	var nameMap={
		"timerow" : "Time" ,
		"temprow" : "Temperature" };
	node.name=nameMap[n];
	//change class
	node.className="dot active decision in-progress";
	//change branches
	node.branches=n;
	if(!nodes[arr[level+1]])
	{
		nodes[arr[level+1]]=[{}];
		
	}
	var width=nodes[arr[level+1]].length+branches-oldBranches;
	alert(width);
	for(k=0;k<branches;k++)
	{
		nodes[level+1].splice(cIndex , oldBranches ,
		{ "level" : level+1 ,
		"siblings" : width-1 ,
		"index" : cIndex+branches-k-1 ,
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
		else if(k>=cIndex+branches-oldBranches)
		{
			nodes[arr[level+1]][k].siblings=width-1;
			nodes[arr[level+1]][k].index+=branches-oldBranches;
		}
			
	}
		
	
	
	
}
function drawBranches() {
	d3.select("svg").selectAll().remove();
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
	
	
