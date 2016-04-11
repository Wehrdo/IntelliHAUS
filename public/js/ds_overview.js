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

    self.createNewDatastream = function() {
        var name_input = $("#new_ds_name")[0];
        var type_input = $("#new_ds_type")[0];

        // POST new datastream to create
        $.ajax({
            url: '/api/datastream',
            type: 'POST',
            dataType: 'json',
            data: {
                name: name_input.value,
                datatype: type_input.value
            },
            statusCode: {
                201: function(resp) {
                    if (resp.success) {
                        self.dsList.push({
                            id: resp.id,
                            name: name_input.value
                        });
                    } else {
                        console.log("Error from server: " + resp.error);
                    }
                },
                400: function(resp) {
                    console.log("Error: ", $.parseJSON(resp.responseText).error);
                }
            }
        });
    };
}



window.addEventListener('load', function() {
    window.DsOverviewModel = new DatastreamOverviewModel();
    ko.applyBindings(window.DsOverviewModel);
    $('#navbar').load('/html/navbar.html');
});