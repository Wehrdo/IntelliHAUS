/**
 * Created by David on 4/7/2016.
 */

function RuleContainer() {
    /*
    Public methods
     */

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
});