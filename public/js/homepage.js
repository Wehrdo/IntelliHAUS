var HomepageModel = function(){
	//Data
	var self = this;
	self.tabs = ['IntelliHAUS', 'Nodes', 'Rules', 'Datastreams'];
	self.chosenTabId = ko.observable();
	
	//Behaviors
	self.goToTab = function(tab) {
		self.chosenTabId(tab);
	};
};

ko.applyBindings(new HomepageModel());


//Class to represent a row in the Recent Rules table
var Rules = function(nodeName, nodeState, ruleSetTime){
	var self = this;
	self.name = ko.observable(nodeName);
	self.state = ko.observable(nodeState);
	self.time = ko.observation(ruleSetTime);
};

var RulesTableViewModel = function(){
	var self = this;
	
	//Non-editable catalog data - would come from the server 
	self.availableNodes = [
		{nodeName: "Thermostat", nodeState: "71", ruleSetTime: "5:00pm" },
		{nodeName: "Bedroom Light", nodeState: "Off", ruleSetTime: "11:00pm" }
	];
};

ko.applyBindings(new RulesTableViewModel());

//Class to represent a row in the Datastreams table
var PinnedDataStreamsViewModel = function(){
	var self = this;
	
	//Non-editable catalog data - would come from the server 
	self.availableNodes = [
		{nodeName: "Thermostat", dsGraph: "data"},
		{nodeName: "Humidity Sensor", dsGraph: "data" }
	];
};

ko.applyBindings(new PinnedDataStreamsViewModel());
