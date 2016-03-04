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
    self.name = nodeName;        //ko.observable(nodeName);
    self.state = nodeState;      //ko.observable(nodeState);
    self.time = ruleSetTime;     //ko.observation(ruleSetTime);

};
var RulesTableViewModel = function () {
    var self = this;
    var nn2 = "Thermostat";

    //Non-editable catalog data - would come from the server
    /*self.rules = [
        {nodeName: "Thermostat", nodeState: "71", ruleSetTime: "5:00pm"},
        {nodeName: "Bedroom Light", nodeState: "Off", ruleSetTime: "11:00pm"}
    ];*/

    //To show what the table would look like
    //Again, this would come from the server
    self.rulesTable = ko.observableArray([
        new Rules(nn2, "71", "5:00pm"),
        new Rules ("Bedroom Light", "Off", "11:00pm")
    ]);
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


var applyBindings = function (){
    ko.applyBindings(new TabsModel(), document.getElementById("tabs-view"));
    ko.applyBindings(new RulesTableViewModel(), document.getElementById("rules-view"));
    ko.applyBindings(new PinnedDataStreamsViewModel(), document.getElementById("pinned-ds"))
};

window.addEventListener('load', function() {
    applyBindings();
    $('#navbar').load('/html/navbar.html');
});