/**
 * Created by David on 2/26/2016.
 */

function Plot() {
    var plot = d3.select("#d3_plot");

    var WIDTH = $("#d3_plot")[0].clientWidth;
    var HEIGHT = $("#d3_plot")[0].clientHeight;
    var MARGINS = {
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

    this.updateData = function(newData) {
        xScale.domain([new Date(newData[0].time), new Date(newData[newData.length-1].time)]);

        var tempPts = $.map(newData, function(pt) {return pt.time});
        yScale.domain(d3.extent(newData, function(d) {return d.continuousData}));

        // Must update scales before updating line
        var newPlot = plot.transition();
        newPlot.select(".line").duration(750).attr("d", lineGen(newData));

        newPlot.select(".axis-x").duration(750).call(xAxis);
        newPlot.select(".axis-y").duration(750).call(yAxis);
    }
}

function DatastreamModel() {
    // Initialize the data plot
    var plot = new Plot();

    // Get the ID from the URL
    var splitURL = window.location.href.split('/');
    var dsId = splitURL[splitURL.length-1];

    var self = this;
    self.info = ko.mapping.fromJS({
        name: null,
        public: null
    });
    self.dataPoints = ko.observableArray();

    // Get info about the datastream
    $.getJSON('/api/datastream/' + dsId + '/info', function(data) {
        console.log(data);
        ko.mapping.fromJS(data.datastream, self.info);
    });

    // Get the datapoints
    $.getJSON('/api/datastream/' + dsId + '/data', function(data) {
        console.log(data);
        self.dataPoints(data.datapoints);
    });

    self.dataPoints.subscribe(function(newData) {
        plot.updateData(newData);
    });

    self.setPublic = function() {
        console.log("set public!");
        self.info.public(true);
    }
}

window.onload = function() {
    ko.applyBindings(new DatastreamModel());
};