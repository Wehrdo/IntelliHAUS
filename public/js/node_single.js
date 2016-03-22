/** Information that comes from the server:
 * node name
 * adjusting frequency of data
 * changing output of the ds
 *
 *     var splitURL = window.location.href.split('/');
 var nodeId = splitURL[splitURL.length];
 */


function SingleNodeViewModel(){
    var self = this;
    self.home = ko.observableArray();
    self.node = ko.observableArray();

    //get homes from server
    $.getJSON("http://localhost/api/home/", function(data){
        console.log(data);
        self.home(data.homes);
    });

    self.findNodes = function(homeid){
        console.log(homeid);
        $.getJSON("http://localhost/api/node/?homeid="+homeid, function(data){
            console.log(data);
            self.node(data.nodes);
        })
    };

}


window.addEventListener('load', function() {
    window.SingleNodeViewModel = new SingleNodeViewModel();
    ko.applyBindings(window.SingleNodeViewModel);
    $('#navbar').load('/html/navbar.html');
});