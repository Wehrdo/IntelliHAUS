/** Information that comes from the server:
 * node name
 * adjusting frequency of data
 * changing output of the ds
 *
 *     var splitURL = window.location.href.split('/');
 var nodeId = splitURL[splitURL.length];
 */


function NodeModel(){
    var self = this;

    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var nodeId = splitURL[splitURL.length-1].replace(/\D/g,'');

    // Info about the node
    self.info = ko.mapping.fromJS({
        name: null,
        inputNames: [],
        outputName: null,
        DatastreamId: null,
        Datastream: {
            name: null,
            id: -1
        },
        createdAt: "1700-01-01"
    });
    // The datastreams that belong to the user
    self.datastreams = ko.observableArray(['loading...']);

    // computed KO object for a pretty-printed version of the date
    self.createdAtPretty = ko.computed(function() {
        return new Date(self.info.createdAt()).toDateString();
    });

    // Function that saves the changes
    function putData() {
        saveTimer = null;
        $.ajax({
            url: '/api/node',
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                nodeid: nodeId,
                name: self.info.name(),
                DatastreamId: self.info.DatastreamId(),
                inputNames: self.info.inputNames(),
                outputName: self.info.outputName()
            }),
            success: function(data) {
                // On success, remove 'unsaved changes' box and replace it with a saved box
                $('#unsaved-alert')[0].style.display = 'none';
                var errorAlert = $('#failsave-alert')[0].style.display = 'none';
                var savedAlert = $('#saved-alert');
                savedAlert.fadeIn(150);
                // after 1s, begin fading out the 'saved changes' box
                setTimeout(function() {
                    savedAlert.fadeOut(1500);
                }, 1000)
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // In error, show error warning
                var errorAlert = $('#failsave-alert')[0];
                errorAlert.style.display = '';
                errorAlert.innerHTML = '<strong>Error: </string>' + jqXHR.responseJSON.error.toString();
            }
        })
    }

    // time to wait after changes have been made to save
    var saveDelay = 1200;
    var saveTimer = null;
    var left_to_load = 2;
    // called whenever a change that can be saved is detected on the page
    function optionsChanged(newObj) {
        // If there is still data to load, don't save yet.
        // Loading new data can cause subscription updates
        if (left_to_load != 0) {
            return;
        }
        // If already planning to save, just reset timer
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(putData, saveDelay);
        }
        else {
            // Need to make a timer, so we don't save on every keystroke
            saveTimer = setTimeout(putData, saveDelay);
            $('#saved-alert')[0].style.display = 'none';
            $('#unsaved-alert').fadeIn(150);
        }
    }

    self.sendData = function(form) {
        var elements = form.getElementsByTagName("input");
        var data = [];
        for (var i = 0; i < elements.length; i++) {
            data.push(elements[i].value);
        }
        $.ajax({
            url: '/api/node/send',
            type: 'POST',
            dataType: 'json',
            data: {
                nodeid: nodeId,
                data: data
            },
            success: function(data) {
                console.log("success");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseJSON.error);
            }
        })
    };

    $.getJSON('/api/node/' + nodeId, function(data) {
        ko.mapping.fromJS(data.node, self.info);
        // Subscribe to each property that can be changed and saved to the server
        ['name', 'outputName', 'inputNames', 'DatastreamId'].forEach(
            function(watchedProp) {
                self.info[watchedProp].subscribe(optionsChanged);
            }
        );
        left_to_load--;
    });

    $.getJSON('/api/datastream', function(data) {
        if (data.success) {
            self.datastreams(data.datastreams);
            left_to_load--;
        } else {
            console.log("Failed to load datastream: " + data.error);
        }
    });
}


window.addEventListener('load', function() {
    window.NodeModel = new NodeModel();
    ko.applyBindings(window.NodeModel);
    $('#navbar').load('/html/navbar.html');
});