/**
 * Created by Jordan on 2/28/2016.
 * Updated on 3/2/2016
 *
 * The links to the single node pages
 * still needs to be implemented
 */

function Node(name, index){
    var self = this;
    self.name = name;
    self.index = index;
}

/**function Home(name, homeid){
    var self = this;
    self.name = name;
    self.homeid = homeid;
}*/


function NodesViewModel(){
    var self = this;
    self.home = ko.observableArray();
    self.node = ko.observableArray();

    $.getJSON("api/home/", function(data){
        console.log(data);
        self.home(data.homes);
    });

    self.listNodes = function(homeid){
        console.log(homeid);
        $.getJSON("api/node/?homeid="+homeid, function(data){
            console.log(data);
            self.node(data.nodes);
        })
    }
}

window.addEventListener('load', function() {
    window.NodesViewModel = new NodesViewModel();
    ko.applyBindings(window.NodesViewModel);
    $('#navbar').load('/html/navbar.html');
});