/**
 * Created by David on 4/10/2016.
 */

function RulesViewModel() {
    var self = this;
    // Box to show errors to the user
    var errorBox = document.getElementById('errorBox');
    self.rules = ko.observableArray();

    $.getJSON('/api/rule', function(data) {
        if (data.success) {
            self.rules(data.rules);
        } else {
            console.log("Error loading rules: " + data.error);
        }
    });

    self.deleteRule = function(ds_idx) {
        var to_delete = self.rules()[ds_idx];

        // Make call to server
        $.ajax({
            url: '/api/rule/' + to_delete.id,
            type: 'DELETE',
            statusCode: {
                200: function(resp) {
                    if (resp.success) {
                        self.rules.splice(ds_idx, 1);
                    }
                    errorBox.classList.add('hidden');
                },
                400: function(resp) {
                    errorBox.classList.remove('hidden');
                    errorBox.innerHTML = $.parseJSON(resp.responseText).error;
                }
            }
        })
    };



    self.createNewRule = function() {
        var name_input = $("#new_rule_name")[0];

        // Default rule to begin with
        var rule_template = {
            "TimeDecision": {
                "branches": [
                    {
                        "value": [0, 720],
                        "action": null
                    },
                    {
                        "value": [720, 1440],
                        "action": null
                    }
                ]
            }
        };

        // POST new datastream to create
        $.ajax({
            url: '/api/rule',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name_input.value,
                rule: rule_template
            }),
            statusCode: {
                201: function(resp) {
                    if (resp.success) {
                        self.rules.push({
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
    window.rulesViewModel = new RulesViewModel();
    ko.applyBindings(window.rulesViewModel);
    $('#navbar').load('/html/navbar.html');
});