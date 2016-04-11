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
            type: "DataDecision",
            parent: 2,
            branches: [4, 6, 7],
            ranges: [[0, 2], [2, 4], [4, 0]],
            nodeId: 1,
            data: [35],
            datastreamId: 2
        };
        self.curType(dotData.type);
        if (dotData.hasOwnProperty('nodeId')) {
            self.selectedNode(dotData.nodeId);
        }
        if (dotData.hasOwnProperty('datastreamId')) {
            self.selectedDatastream(dotData.datastreamId);
        }
        if (dotData.hasOwnProperty('branches')) {
            self.ranges(dotData.ranges);
            self.branches = dotData.branches;
        }
        if (dotData.hasOwnProperty('data')) {
            self.data = dotData.data.map(function(singleInput) {
                return ko.observable(singleInput);
            });
        }
        console.log(self.data);
    };

    self.branchesChanged = function() {
        console.log("Branches changed");
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
    // All nodes that belong to a user
    self.nodes = ko.observableArray([]);
    // Currently selected node for NodeInput
    self.selectedNode = ko.observable(-1);
    // Returns the node with the currently selected ID
    self.getActiveNode = ko.computed(function() {
        var matches = self.nodes().filter(function(node) {
            return node.id == self.selectedNode();
        });
        if (matches.length != 0) {
            return matches[0];
        } else {
            // fallback to node with no inputs
            return {inputNames: []};
        }
    });


    // Array to hold the data that is sent to the node
    self.data = [];

    // The branches from this node
    self.branches = [];
    // The ranges for each corresponding branch
    self.ranges = ko.observableArray();

    // Add a new branch
    self.addBranch = function() {
        self.ranges.push([undefined, undefined]);
        self.branches.push(0);
        // TODO: Call ruleContainer.addBranch().
        // TODO: The branches array might get updated already
    };
    // Subscribe to changes of the range array
    // TODO: Get notified when the range value changes
    self.ranges.subscribe(self.branchesChanged);

    // Remove a branch
    self.deleteBranch = function(index) {
        self.ranges.splice(index, 1);
        // TODO: Notify ruleContainer
        self.branches.splice(index, 1);
    };

    // Converts the minutes of a day (0 - 1440) into a date string for a time input box
    self.toDateString = function(minutes_raw) {
        var hours = Math.floor(minutes_raw / 60);
        var minutes = minutes_raw % 60;
        return ('00' + hours).substr(-2) + ':' + ('00' + minutes).substr(-2);
    };

    // Array of days of the week for a DayDecision
    self.days = [{name: 'Sunday', id: 0},
                {name: 'Monday', id: 1},
                {name: 'Tuesday', id: 2},
                {name: 'Wednesday', id: 3},
                {name: 'Thursday', id: 4},
                {name: 'Friday', id: 5},
                {name: 'Saturday', id: 6}];

    // Returns the name of the day if the range were inclusive
    // Users would expect the day to be inclusive
    self.inclusiveEndDay = function(item) {
        var dayToShow = (((item.id-1)%7)+7)%7;
        return self.days[dayToShow].name;
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