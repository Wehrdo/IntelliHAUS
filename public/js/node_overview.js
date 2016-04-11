/**
 * Created by Jordan on 2/28/2016.
 * Updated on 3/2/2016
 *
 */

function NodesViewModel(){
    var self = this;
    self.node = ko.observableArray();

    //get homes from server
    $.getJSON("/api/home/", function(data){
        var first_home = data.homes[0];
        $.getJSON("/api/node/?homeid="+first_home.id, function(data){
            self.node(data.nodes);
        })
    });
}


window.addEventListener('load', function() {
    window.NodesViewModel = new NodesViewModel();
    ko.applyBindings(window.NodesViewModel);
    $('#navbar').load('/html/navbar.html');
});