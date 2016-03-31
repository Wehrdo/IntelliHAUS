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

    self.info = ko.mapping.fromJS({
        name: null,
        inputNames: [],
        outputName: null,
        Datastream: {
            name: "null",
            id: -1
        },
        createdAt: "1700-01-01"
    });
    // computed KO object for a pretty-printed version of the date
    self.createdAtPretty = ko.computed(function() {
        return new Date(self.info.createdAt()).toDateString();
    });

    function optionsChanged(newObj) {
        console.log(newObj);
    }

    self.sendData = function() {
        var elements = $("#actuate_form")[0].elements;
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
        ['name', 'outputName', 'inputNames'].forEach(
            function(watchedProp) {
                self.info[watchedProp].subscribe(optionsChanged);
            }
        )
    });
}


window.addEventListener('load', function() {
    window.NodeModel = new NodeModel();
    ko.applyBindings(window.NodeModel);
    $('#navbar').load('/html/navbar.html');
});