/**
 * Created by David on 4/7/2016.
 */

function SidebarModel() {
    /*
    Public methods
     */
    this.dotClicked = function(dot) {
        
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.Sidebar = new SidebarModel();
    $('#navbar').load('/html/navbar.html');
});