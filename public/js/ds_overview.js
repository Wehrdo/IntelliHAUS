/**
 * Created by David on 3/1/2016.
 */

function DatastreamOverviewModel() {
    var self = this;

    self.dsList = ko.observableArray();

    $.getJSON('/api/datastream', function(data) {
        if (!data.success) {
            console.log(data.error);
            return;
        }
        self.dsList(data.datastreams);
        console.log(data);
    });
}

window.addEventListener('load', function() {
    window.DsOverviewModel = new DatastreamOverviewModel();
    ko.applyBindings(window.DsOverviewModel);
    $('#navbar').load('/html/navbar.html');
});