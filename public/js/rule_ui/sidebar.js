/**
 * Created by David on 4/7/2016.
 */

function SidebarModel() {
    var self = this;
    /*
    Public methods
     */
    self.dotClicked = function(dot) {
        var dotData = {
            id: 3,
            type: "DayDecision",
            parent: 2,
            branches: [4, 6, 7],
            ranges: [["NEGATIVE_INFINITY", 30], [30, 50], [50, "POSITIVE_INFINITY"]],
            nodeId: 1,
            datastreamId: 2
        };
        self.curType(dotData.type);
        if (dotData.hasOwnProperty('nodeId')) {
            self.selectedNode(dotData.nodeId);
        }
        if (dotData.hasOwnProperty('datastreamId')) {
            self.selectedDatastream(dotData.datastreamId);
        }
        self.branches(dotData.ranges);
    };

    /*
    Knockout Bindings
     */
    self.curType = ko.observable("");
    self.curType.subscribe(function(newVal) {
        console.log(newVal);
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

    self.selectedDatastream = ko.observable(-1);
    
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

    self.branches = ko.observableArray([[0, 30], [30, 80]]);
    self.addBranch = function() {
        self.branches.push([undefined, undefined]);
    };
    self.branches.subscribe(function() {
        console.log(self.branches());
    });

    self.deleteBranch = function(index) {
        self.branches.splice(index, 1);
    };

    // Converts the minutes of a day (0 - 1440) into a date string for a time input box
    self.toDateString = function(minutes_raw) {
        var hours = Math.floor(minutes_raw / 60);
        var minutes = minutes_raw % 60;
        return ('00' + hours).substr(-2) + ':' + ('00' + minutes).substr(-2);
    };

    self.dotClicked();

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