/**
 * Created by David on 2/26/2016.
 */

function Plot() {
    var plot = d3.select("#d3_plot");

    var WIDTH = $("#d3_plot")[0].clientWidth;;
    var HEIGHT = $("#d3_plot")[0].clientHeight;
    MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    };

    var xScale = d3.time.scale().
        range([MARGINS.left, WIDTH - MARGINS.right]);

    var yScale = d3.scale.linear().
        range([HEIGHT-MARGINS.top, MARGINS.bottom]);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add X-axis
    plot.append("svg:g")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .attr("class", "axis-x")
        .call(xAxis);
    // Add Y-axis
    plot.append("svg:g")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .attr("class", "axis-y")
        .attr("class", "axis-y")
        .call(yAxis);

    lineGen = d3.svg.line()
        .x(function(d) {
            return xScale(new Date(d.time));
        })
        .y(function(d) {
            return yScale(d.continuousData);
        });
    plot.append("svg:path")
        .attr('class', 'line')
        .attr('d', lineGen([]))
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    var curData = [];

    // Redraws the line for the data
    this.updateData = function(newData) {
        if (newData) {
            curData = newData;
        }
        xScale.domain([new Date(curData[0].time), new Date(curData[curData.length-1].time)]);

        var tempPts = $.map(curData, function(pt) {return pt.time});
        yScale.domain(d3.extent(curData, function(d) {return d.continuousData}));

        // Must update scales before updating line
        var newPlot = plot.transition();
        newPlot.select(".line").duration(750).attr("d", lineGen(curData));

        newPlot.select(".axis-x").duration(750).call(xAxis);
        newPlot.select(".axis-y").duration(750).call(yAxis);
    };
    var updateData = this.updateData;

    // called when the window resizes
    this.resize = function(event) {
        var plotContainer = $("#data_plot")[0];
        var WIDTH = plotContainer.clientWidth;
        // Make the height 1/2 the width, but don't exceed 90% of the window height
        var HEIGHT = Math.min(WIDTH * 0.5, window.innerHeight*0.9);
        plotContainer.setAttribute("style", "height:" + HEIGHT + "px;");
        xScale.range([MARGINS.left, WIDTH - MARGINS.right]);
        yScale.range([HEIGHT - MARGINS.top, MARGINS.bottom]);
        plot.select(".axis-x").attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")");
        updateData();
    }
}

function DatastreamModel() {
    // Initialize the data plot
    var plot = new Plot();

    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var dsId = splitURL[splitURL.length-1];

    var self = this;
    // Similar JSON object as given from the server
    // We need to populate some values so it doesn't error on load
    self.info = ko.mapping.fromJS({
        name: null,
        public: null,
        Nodes: [],
        createdAt: "1700-01-01"
    });
    // computed KO object for a pretty-printed version of the date
    self.createdAtPretty = ko.computed(function() {
        return new Date(self.info.createdAt()).toDateString();
    });
    self.dataPoints = ko.observableArray();

    // Function that saves the changes
    function putData() {
        saveTimer = null;
        console.log("saving");
        $.ajax({
            url: '/api/datastream',
            type: 'PUT',
            dataType: 'json',
            data: {
                datastreamid: dsId,
                name: self.info.name,
                public: self.info.public
            },
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
                errorAlert.innerHTML = '<strong>Error: </string>' + errorThrown;
            }
        })
    }

    // time to wait after changes have been made to save
    var saveDelay = 1200;
    var saveTimer = null;
    // called whenever a change that can be saved is detected on the page
    function optionsChanged(newObj) {
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

    // Get info about the datastream
    $.getJSON('/api/datastream/' + dsId + '/info', function(data) {
        // auto-map JSON from server to knockout observables
        ko.mapping.fromJS(data.datastream, self.info);
        // Subscribe to each property that can be changed and saved to the server
        ['name', 'public'].forEach(
            function(watchedProp) {
                self.info[watchedProp].subscribe(optionsChanged);
            }
        )
    });

    // Get the datapoints
    $.getJSON('/api/datastream/' + dsId + '/data', function(data) {
        self.dataPoints(data.datapoints);
    });

    // re-draws the line when the data has been changed
    self.dataPoints.subscribe(function(newData) {
        plot.updateData(newData);
    });

    self.resized = function(event) {
        plot.resize(event);
    }
}

window.onload = function() {
    window.DsModel = new DatastreamModel();
    ko.applyBindings(window.DsModel);
    // call resize initially to set the correct size
    // TODO: Make the plot just start with the correct size, instead of having to call resize
    window.DsModel.resized();
};

// re-scale the plot when the window changes size
window.onresize = function(event) {
    window.DsModel.resized(event);
};