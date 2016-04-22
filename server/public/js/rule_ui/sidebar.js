/**
 * Created by David on 4/7/2016.
 */

function SidebarModel() {
    var self = this;
    // Currently selected dot ID
    curDot = null;
    /*
     Public methods
     */
    self.dotClicked = function(dotId) {
        curDot = dotId;
        var dotData = ruleContainer.getDot(dotId);
        // Update self.data for NodeInput
        if (dotData.type === 'NodeInput') {
            // Create observables for actuator data
            self.data(createDataKoArray(dotData.data));
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
        self.curType(dotData.type);
        console.log(dotId);
    };

    self.branchesChanged = function() {
        // Convert the array of range objects back to array of arrays
        var ranges_array = self.ranges().map(function(rangeObj) {
            return [rangeObj.start, rangeObj.end];
        });
        ruleContainer.updateRanges(curDot, ranges_array);
    };
    self.currentDot = function() {
        return curDot;
    };

    /*
     Knockout Bindings
     */
    self.curType = ko.observable("InitialValue");

    // Type was selected for a previously EmptyDecision
    self.setDotType = function() {
        ruleContainer.setDotType(curDot, self.curType());
    };

    self.deleteDot = function() {
        ruleContainer.deleteAllBranches(curDot);
        ruleContainer.setDotType(curDot, "EmptyDecision");
        self.dotClicked(curDot);
    };
    self.removeDot = function() {
        var pid=ruleContainer.getParent(curDot);
        if(pid!=null)
        {
            ruleContainer.deleteBranch(curDot);
            self.dotClicked(pid);
        }
    }

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
    self.datastreamChanged = function() {
        ruleContainer.setDatastream(curDot, self.selectedDatastream());
    };

    // All nodes that belong to a user
    self.nodes = ko.observableArray([]);
    // Currently selected node for NodeInput
    self.selectedNode = ko.observable(-1);
    // Called when the select box was changed for a nodeInput
    self.nodeToActuateChanged = function() {
        var start_data = self.getActiveNode().inputNames.map(function(name) {
            return 0;
        });
        self.data(createDataKoArray(start_data));
        ruleContainer.setNodeId(curDot, self.selectedNode(), start_data);
    };
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


    function createDataKoArray(data) {
        return data.map(function(inData) {
            var data_observable = ko.observable(inData);
            data_observable.subscribe(self.dataChanged);
            return data_observable;
        })
    }

    // Array to hold the data that is sent to the node
    self.data = ko.observableArray();

    self.dataChanged = function() {
        ruleContainer.setNodeData(curDot,
            self.data().map(function(data_observable) {
                return data_observable();
            }));
    };

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
        // self.branches.splice(index, 1);
        ruleContainer.deleteBranch(self.branches[index]);
    };

    // Converts the minutes of a day (0 - 1440) into a date string for a time input box
    self.toDateString = function(minutes_raw) {
        var hours = Math.floor(minutes_raw / 60);
        var minutes = minutes_raw % 60;
        return ('00' + hours).substr(-2) + ':' + ('00' + minutes).substr(-2);
    };

    // Converts the input box "time" into minutes, and vice-versa
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
                var hours = Number.parseInt(value.substr(0, 2));
                var minutes = Number.parseInt(value.substr(3, 2));
                var total_minutes = hours*60 + minutes;
                if (total_minutes === 0 && prop === 'end') {
                    total_minutes = 1440;
                }
                obj[prop] = hours*60 + minutes;
                self.branchesChanged();
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