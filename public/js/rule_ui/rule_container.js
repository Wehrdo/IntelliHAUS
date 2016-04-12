/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    /*
    Public methods
     */


if(!id)id=0;
//use pid=null for root node
//setting id=0 starts effectual id count at 1
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
		parentId=pid;
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
		else
		{
			branchPush=translate(tree[type].branches.action, dotId);
			rangePush=tree[type].branches.value;
			if(!rangePush.length)
				rangePush=[rangePush, null];
			branches.push(Object.keys(branchPush)[0]);
			ranges.push(rangePush);
		}
			tree[type].branches[key]
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
    /*
    Private methods
     */
}

window.ruleContainer = new RuleContainer();

document.addEventListener('DOMContentLoaded', function() {
    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var ruleId = splitURL[splitURL.length-1].replace(/\D/g,'');

    $.getJSON('/api/rule/' + ruleId, function(data) {
        if (data.success) {

        } else {
            console.log(data.error);
        }
    });
});