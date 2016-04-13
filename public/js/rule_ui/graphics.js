/**
 * Created by David on 4/7/2016.
 */

function RuleGraphics() {
    /*
    Public methods
     */
    function setHeights(nodeData, id) {
	var height=0;
	if(nodeData[id.toString()].branches==[])
		height=2;
	else
	{
		var i;
		for(i=0;i<nodeData[id.toString()].branches.length;i++)
		{
			height+=setHeights(nodeData, nodeData[id.toString()].branches[i])[branches[i].toString()].height;
		}
	}
	nodeData[id.toString()].height=height;
	return nodeData;
    }
    this.updateTree = function() {

    };

    
    /*
    Private methods
     */
}

document.addEventListener('DOMContentLoaded', function() {
    window.ruleGraphics = new RuleGraphics();
});