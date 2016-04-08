/**
 * Created by David on 4/7/2016.
 */

function SidebarModel() {
    var self = this;
    /*
    Public methods
     */
    self.dotClicked = function(dot) {
        
    };

    /*
    Knockout Bindings
     */
    self.curType = ko.observable("");
    self.curType.subscribe(function(newVal) {
        console.log("Changed type");
    })
}

document.addEventListener('DOMContentLoaded', function() {
    window.sidebar = new SidebarModel();
    ko.applyBindings(window.sidebar, document.getElementById("all-sidebars"));
    $('#navbar').load('/html/navbar.html');
});