/**
 * Created by Jordan on 2/28/2016.
 * Updated on 3/2/2016
 *
 * The links to the single node pages
 * still needs to be implemented
 */

var NodesViewModel;

//Default data in case there is no data initially
//
$(document).ready(function() {
    var defaultData = {name: "Node Name"};
    NodesViewModel = ko.mapping.fromJS(defaultData);
    ko.applyBindings(NodesViewModel);
    getNodesFromServer();
});

function getNodesFromServer(){

    // Get the home ID from the URL
    var splitURL = window.location.href.split('/');
    var homeID = splitURL[splitURL.length];

    //Collect Data from server
    $.getJSON("/api/node"+homeID, function(data){
        console.log(data);
        mapServerData(data);
    });
}

//map the data to model in function above
function mapServerData(node){
    alert(JSON.stringify(node));
    ko.mapping.fromJS(nodes, NodesViewModel);
}

