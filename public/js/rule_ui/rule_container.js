/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    /*
    Public methods
     */
function assignIds(jsonObj, id) {
	id++;
	if(globalId<id)
		globalId=id;
	if(jsonObj.nodeInput)
	{
		jsonObj.nodeInput.dotId=id;
	}
	else if(jsonObj.decision)
	{
		var temp;
		for(var key in jsonObj.decision)
			temp=jsonObj.decision[key].branches;
		if(!temp)
			jsonObj.decision.dotId=id;
		var i=0;
		for(i=0;i<temp.length;i++)
			jsonObj.decision.dotId=assignIds(temp[i],id).decision.dotId;
	}
	return jsonObj;
}



function translateData(jsonObj, pid) {
	if(pid==null)
		jsonObj=assignIds(jsonObj,0);
	var newObj={};
	var temp1,
		temp2,
		branchTemp,
		dotId,
		type,
		parentId=pid,
		branches,
		ranges,
		nodeId,
		data,
		dataStreamId;
		branches=[];
		ranges=[];
		parentId=pid;
	if(temp1=constructedObj.decision)
	{
		data=null;
		nodeId=null;
		dotId=temp1.dotId;
		for(var key in temp1)
			temp2=temp1[type=key];
		branchTemp=temp2.branches;
		dataStreamId=(temp1.dataStreamId)? temp1.dataStreamId : null;
		if(branchTemp)
			for(var key in branchTemp.action)
			{
				var nameless=translateData(branchTemp.action[key], dotId);
				for(var key2 in nameless)
				{
					newObj[key2]=nameless[key2];
					branches.push(parseInt(key2));
					var i=0;
					if(typeof branchTemp.value == 'number')
						ranges.push([branchTemp.value,null]);
					else
						ranges.push(branchTemp.value);
				}
			}
	}
	else if(temp1=constructedObj.nodeInput)
	{
		dotId=temp1.dotId;
		type="nodeInput";
		nodeId=temp1.nodeId;
		data=temp1.data;
		dataStreamId=null;
	}
	newObj[dotId.toString()]={
		"dotId" : dotId,
		"type" : type,
		"parent" : parentId,
		"branches" : branches,
		"ranges" : ranges,
		"nodeId" : nodeId,
		"data" : data,
		"dataStreamId" : dataStreamId};
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