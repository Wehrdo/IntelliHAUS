/**
 * Created by David on 4/7/2016.
 */

function SidebarModel() {
    var self = this;
    // Currently selected dot ID
    var curDot = null;
    /*
    Public methods
     */
    self.dotClicked = function(dotId) {
        curDot = dotId;
        var dotData = ruleContainer.getDot(dotId);
        // Update self.data for NodeInput
        if (dotData.type === 'NodeInput') {
            for (var i = 0; i < dotData.data.length; i++) {
                // If an observable already exists in that location, update it
                if (self.data[i]) {
                    self.data[i](dotData.data[i]);
                } else {
                    // Otherwise add a new observable
                    self.data[i] = ko.observable(dotData.data[i]);
                }
            }
            self.selectedNode(dotData.nodeId);
        }
        if (dotData.type === 'DataDecision') {
            self.selectedDatastream(dotData.datastreamId);
        }
        // Convert ranges array to array of objects.
        // Knockout doesn't like arrays of mixed types
        self.ranges(dotData.ranges.map(function(range) {
            return {
                start: range[0],
                end: range[1]
            }
        }));
        self.branches = dotData.branches;
        console.log(dotData.type);
        self.curType(dotData.type);
    };

    self.branchesChanged = function() {
        // Convert the array of range objects back to array of arrays
        var ranges_array = self.ranges().map(function(rangeObj) {
            return [rangeObj.start, rangeObj.end];
        });
        ruleContainer.updateRanges(curDot, ranges_array);
    };

    /*
    Knockout Bindings
     */
    self.curType = ko.observable("");
    self.curType.subscribe(function(newVal) {
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
        ruleContainer.addBranch(curDot, [undefined, undefined]);
        self.ranges.push({
            start: undefined,
            end: undefined
        });
        // self.branches.push(0);
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

    self.createTimeComputed = function(obj, prop) {
        return ko.computed({
            read: function() {
                // Get the minutes from the ranges array
                var minutes_raw = obj[prop];
                if (minutes_raw === 1440) {
                    minutes_raw = 0;
                }
                var hours = Math.floor(minutes_raw / 60);
                var minutes = minutes_raw % 60;
                return ('00' + hours).substr(-2) + ':' + ('00' + minutes).substr(-2);
            },
            write: function(value) {
                self.branchesChanged();
                var hours = Number.parseInt(value.substr(0, 2));
                var minutes = Number.parseInt(value.substr(3, 2));
                var total_minutes = hours*60 + minutes;
                if (total_minutes === 0 && prop === 'end') {
                    total_minutes = 1440;
                }
                obj[prop] = hours*60 + minutes;
            }
        });
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