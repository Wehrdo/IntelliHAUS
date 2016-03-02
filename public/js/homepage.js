var TabsModel = function () {
    //Data
    var self = this;
    self.tabs = ['IntelliHAUS', 'Nodes', 'Rules', 'Datastreams'];
    self.chosenTabId = ko.observable();

    //Behaviors
    self.goToTab = function (tab) {
        self.chosenTabId(tab);
    };
};


//Class to represent a row in the Recent Rules table
var Rules = function (nodeName, nodeState, ruleSetTime) {
    var self = this;
    self.name = ko.observable(nodeName);
    self.state = ko.observable(nodeState);
    self.time = ko.observation(ruleSetTime);
};

var RulesTableViewModel = function () {
    var self = this;
    self.rules = ko.observableArray([]);

    //Non-editable catalog data - would come from the server
    self.rules = [
        {nodeName: "Thermostat", nodeState: "71", ruleSetTime: "5:00pm"},
        {nodeName: "Bedroom Light", nodeState: "Off", ruleSetTime: "11:00pm"}
    ];
};


//Class to represent a row in the Datastreams table
var PinnedDataStreamsViewModel = function () {
    var self = this;
    self.datastreams = ko.observableArray([]);
    $.getJSON('/api/datastream', function (data) {
        if (data.success) {
            self.datastreams(data.datastreams);
        }
    });

    //Non-editable catalog data - would come from the server
    self.availableNodes = [
        {nodeName: "Thermostat", dsGraph: "data"},
        {nodeName: "Humidity Sensor", dsGraph: "data"}
    ];
};


var applyBindings = function () {
    ko.applyBindings(new TabsModel(), document.getElementById("tabs-view"));
    ko.applyBindings(new RulesTableViewModel(), document.getElementById("rules-view"));
    ko.applyBindings(new PinnedDataStreamsViewModel(), document.getElementById("pinned-ds"))
};

window.addEventListener('load', function() {
    applyBindings();
    $('#navbar').load('/html/navbar.html');
});