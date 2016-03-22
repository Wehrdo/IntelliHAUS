/**
 * Created by Jordan on 2/28/2016.
 * Updated on 3/2/2016
 *
 */

function NodesViewModel(){
    var self = this;
    self.home = ko.observableArray();
    self.node = ko.observableArray();

    //get homes from server
    $.getJSON("api/home/", function(data){
        console.log(data);
        self.home(data.homes);
    });

    //get all nodes for each home
    self.listNodes = function(homeid){
        console.log(homeid);
        $.getJSON("api/node/?homeid="+homeid, function(data){
            console.log(data);
            self.node(data.nodes);
        })
    };


}




window.addEventListener('load', function() {
    window.NodesViewModel = new NodesViewModel();
    ko.applyBindings(window.NodesViewModel);
    $('#navbar').load('/html/navbar.html');
});