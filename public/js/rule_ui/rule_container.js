/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    var nodes = null;
    var datastreams = null;
    /*
    Public methods
     */
    self.setUserNodes = function(given_nodes) {
        nodes = given_nodes;
    };

    self.setUserDatastreams = function(given_ds) {
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

    $.getJSON('api/rule/' + ruleId, function(data) {
        if (data.success) {

        } else {
            console.log(data.error);
        }
    })
});