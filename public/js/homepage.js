function HomepageModel(){
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
function Rules(nodeName, nodeState, ruleSetTime){
	var self = this;
	self.name = ko.observable(nodeName);
	self.state = ko.observable(nodeState);
	self.time = ko.observation(ruleSetTime);
}

function RulesTableViewModel(){
	var self = this;
	
	//Non-editable catalog data - would come from the server 
	self.availableNodes = [
		{nodeName: "Thermostat", nodeState: "71", ruleSetTime: "5:00pm" },
		{nodeName: "Bedroom Light", nodeState: "Off", ruleSetTime: "11:00pm" }
	];
}

ko.applyBindings(new RulesTableViewModel());

//Class to represent a row in the Datastreams table
function PinnedDataStreamsViewModel(){
	var self = this;
	
	//Non-editable catalog data - would come from the server 
	self.availableNodes = [
		{nodeName: "Thermostat", dsGraph: "data"},
		{nodeName: "Humidity Sensor", dsGraph: "data" }
	];
}

ko.applyBindings(new PinnedDataStreamsViewModel());
