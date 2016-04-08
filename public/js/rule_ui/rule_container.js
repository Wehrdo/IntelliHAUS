/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    var nodes = null;
    var datastreams = null;
    /*
    Public methods
     */
    this.setUserNodes = function(given_nodes) {
        nodes = given_nodes;
    };

    this.setUserDatastreams = function(given_ds) {
        datastreams = given_ds;
    };

    /*
    Private methods
     */
}

window.ruleContainer = new RuleContainer();

document.addEventListener('DOMContentLoaded', function() {
    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var ruleId = splitURL[splitURL.length-1].replace(/\D/g,'');

    $.getJSON('/api/rule/' + ruleId, function(data) {
        if (data.success) {

        } else {
            console.log(data.error);
        }
    });


    $.getJSON('/api/home', function(data) {
        if (data.success) {
            $.getJSON('/api/node?homeid=' + data.homes[0].id, function(data) {
                if (data.success) {
                    ruleContainer.setUserNodes(data.nodes);
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
            ruleContainer.setUserDatastreams(data.datastsreams);
        } else {
            console.log("Error getting datastreams: " + data.error);
        }
    })
});