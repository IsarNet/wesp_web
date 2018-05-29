// <!-- OTHER HELPER FUNCTIONS -->

function load_essentials() {
    $("#header").load("/Essentials/header.html");

    $("#sidebar").load("/Essentials/sidebar.html");

    $("#footer").load("/Essentials/footer.html");

    $("#sidebar_right").load("/Essentials/sidebar_right.html");
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function changePort(target) {
    var port = target.getAttribute('href').match(/^:(\d+)(.*)/);
    if (port) {
        target.href = port[2];
        target.port = port[1];
    }
}

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

// <!-- CHART HELPER FUNCTIONS -->

date_format = "MM/dd/yy HH:mm:ss";

line_colors = ['blue', 'red', 'green', 'brown', 'gray', 'orange', 'black', 'navy'];

function create_charts(data) {

    // create emtpy list, which will contain all charts
    all_charts = []

    // loop through all avaliable columns
    for (i = 1; i < data.getNumberOfColumns(); i++) {

        // create new div tag for chart and add under container
        chart_container = document.createElement('div');
        chart_container.setAttribute("id", "chart_div_" + i);

        container.appendChild(chart_container);

        // Create new Google Line Chart with basic options
        var chart = new google.visualization.ChartWrapper({
            chartType: 'LineChart',
            containerId: 'chart_div_' + i,
            options: {
                height: 200,
                // omit width, since we set this in CSS
                chartArea: {
                    width: '75%' // this should be the same as the ChartRangeFilter
                },
                // set date format for horizontal axis
                hAxis: {
                    format: date_format
                },
                // set color to one from line color array
                colors: line_colors.slice(i - 1, i),
                backgroundColor: {
                    fill: 'transparent'
                },
                // make data points visible
                pointSize: 3

            },
            view: {
                // specify releveant rows
                columns: [0, i]
            }
        });

        // add this chart to the list
        all_charts.push(chart);
    }
    // list contains all charts
    return all_charts

}

function get_numeric_columns(data) {

    numeric_columns = [];

    // loop through all entries and if comlumn has at least one
    // numerical entry add it to the list
    $.each(data, function (index, row) {

        for (var column in row) {

            // if column is numeric and not id, add it to the list (if not in it already)
            if ($.isNumeric(row[column]) && column !== "id") {

                if (numeric_columns.indexOf(column) === -1) {
                    numeric_columns.push(column)
                }

            }

        }

    });

    return numeric_columns;
}

function order_entry_data(row, numeric_columns) {

    // add timestamp entry manuelly (ISO Format prevents conversion mistakes)
    ordered_data = [new Date(row.Timestamp_ISO)]

    // For each entry which is in numeric_columns add the data to the array
    // (which will be one row in the chart data table)
    for (var entry in row) {
        if (numeric_columns.indexOf(entry) !== -1) {
            ordered_data.push(row[entry])
        }
    }

    return ordered_data;

}



// <!-- ZOOM FUNCTIONS -->

function zoomTimeFrame(data, control, start = undefined, end = undefined) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: (start instanceof Date && !isNaN(start.valueOf())) ? start : range.min,
            end: (end instanceof Date && !isNaN(end.valueOf())) ? end : range.max
        }
    });
    control.draw();
}

function zoomLastMinute(data, control) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: new Date(range.max.getFullYear(), range.max.getMonth(), range.max.getDate(), range.max.getHours(), range.max.getMinutes() - 1),
            end: range.max
        }
    });
    control.draw();
}

function zoomLastHour(data, control) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: new Date(range.max.getFullYear(), range.max.getMonth(), range.max.getDate(), range.max.getHours() - 1),
            end: range.max
        }
    });
    control.draw();
}

function zoomLastDay(data, control) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: new Date(range.max.getFullYear(), range.max.getMonth(), range.max.getDate() - 1),
            end: range.max
        }
    });
    control.draw();
}

function zoomLastWeek(data, control) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: new Date(range.max.getFullYear(), range.max.getMonth(), range.max.getDate() - 7),
            end: range.max
        }
    });
    control.draw();
}

function zoomLastMonth(data, control) {
    // zoom here sets the month back 1, which can have odd effects when the last month has more days than the previous month
    // eg: if the last day is March 31, then zooming last month will give a range of March 3 - March 31, as this sets the start date to February 31, which doesn't exist
    // you can tweak this to make it function differently if you want
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: new Date(range.max.getFullYear(), range.max.getMonth() - 1, range.max.getDate()),
            end: range.max
        }
    });
    control.draw();
}

function zoomToEverything(data, control) {
    var range = data.getColumnRange(0);
    control.setState({
        range: {
            start: range.min,
            end: range.max
        }
    });
    control.draw();
}
