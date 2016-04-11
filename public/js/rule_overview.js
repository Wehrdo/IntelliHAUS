/**
 * Created by David on 4/10/2016.
 */

function RulesViewModel() {
    var self = this;
    self.rules = ko.observableArray();

    $.getJSON('/api/rule', function(data) {
        if (data.success) {
            self.rules(data.rules);
        } else {
            console.log("Error loading rules: " + data.error);
        }
    })
}

window.addEventListener('load', function() {
    window.rulesViewModel = new RulesViewModel();
    ko.applyBindings(window.rulesViewModel);
    $('#navbar').load('/html/navbar.html');
});