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
    self.curType = ko.observable("nodeInput");
    self.curType.subscribe(function(newVal) {
        console.log(newVal);
        console.log("Changed type");
    });

    // All the datastreams of the user
    self.datastreams = ko.observableArray([]);
    // The datastreams that are continuous
    self.continuousDatastreams = ko.computed(function() {
        return self.datastreams().filter(function(elem) {
            return elem.datatype === "continuous";
        });
    });

    // The datastreams that are discrete
    self.discreteDatastreams = ko.computed(function() {
        return self.datastreams().filter(function(elem) {
            return elem.datatype === "discrete";
        });
    });

    self.nodes = ko.observableArray([]);
    self.selectedNode = ko.observable(-1);
    self.getActiveNode = ko.computed(function() {
        var nodes = self.nodes();
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id == self.selectedNode()) {
                return nodes[i];
            }
        }
        // fallback of node with no inputs
        return {inputNames: []};
    });

}

document.addEventListener('DOMContentLoaded', function() {
    window.sidebar = new SidebarModel();
    ko.applyBindings(window.sidebar, document.getElementById("all-sidebars"));


    $.getJSON('/api/home', function(data) {
        if (data.success) {
            $.getJSON('/api/node?homeid=' + data.homes[0].id, function(data) {
                if (data.success) {
                    var nodes_w_inputs = data.nodes.filter(function(node) {
                        return node.inputNames.length != 0;
                    });
                    sidebar.nodes(nodes_w_inputs);
                } else {
                    console.log("Error getting nodes: " + data.error);
                }
            });
        } else {
            console.log("Error getting homes: " + data.error);
        }
    });


    $.getJSON('/api/datastream', function(data) {
        if (data.success) {
            sidebar.datastreams(data.datastreams);
        } else {
            console.log("Error getting datastreams: " + data.error);
        }
    });

    $('#navbar').load('/html/navbar.html');
});