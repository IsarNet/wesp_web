// Load the Visualization API and the controls package.
google.charts.load('current', {
    'packages': ['corechart', 'controls']
});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var client = getUrlParameter('client');
    var start = getUrlParameter('start');
    var end = getUrlParameter('end');

    if (client === undefined) {
        alert("No Client IP provided");
    }
    
    //Add client IP to Headline
    document.getElementById('client_header').innerHTML = client;
    document.getElementById('client_history').innerHTML += "(" + client + ")";
    document.getElementById('client_history').setAttribute('href', '/pages/client_details.html?client=' + client);

    // get reference to container
    chart_container = document.getElementById('container');

    // Create new control wrapper with basic options
    var control = new google.visualization.ControlWrapper({
        controlType: 'ChartRangeFilter',
        containerId: 'control_div',
        options: {
            filterColumnIndex: 0,
            ui: {
                chartOptions: {
                    colors: line_colors,
                    backgroundColor: { fill:'transparent' },
                    height: 100,
                    // omit width, since we set this in CSS
                    chartArea: {
                        width: '75%' // this should be the same as the ChartRangeFilter
                    },
                    'hAxis': {
                        'baselineColor': 'none',
                        format: date_format
                    }
                }
            }
        }
    });

    // retrieve data and create charts for it.
    retrieve_data(client, function (data) {
        all_charts = create_charts(data);

        // Create dashboard and bind control and all charts
        var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
        dashboard.bind([control], all_charts);

        // change date format of tooltip
        var formatter = new google.visualization.DateFormat({
            pattern: date_format
        });
        formatter.format(data, 0);

        // draw everything
        dashboard.draw(data);

        // Add Button Listener
        var runOnce = google.visualization.events.addListener(dashboard, 'ready', function () {
            google.visualization.events.removeListener(runOnce);
            
            $( "#lastDay" ).click(function() {zoomLastDay(data, control)});
            $( "#lastWeek" ).click(function() {zoomLastWeek(data, control)});
            $( "#lastMonth" ).click(function() {zoomLastMonth(data, control)});
            $( "#lastHour" ).click(function() {zoomLastHour(data, control)});
            $( "#lastMinute" ).click(function() {zoomLastMinute(data, control)});
        });

        if (start !== undefined || end !== undefined) {
            start = new Date(parseInt(start));
            end = new Date(parseInt(end));
            zoomTimeFrame(data, control, start, end);
        }

    })

}

function retrieve_data(client, callback) {

    var data_table = new google.visualization.DataTable();

    // request data from database
    $.getJSON("/PHP/allEntriesOfClient.php?client=" + client, function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check client address!')
        }

        // get list of numeric columns
        numeric_columns = get_numeric_columns(data);

        // add Timestamp 
        data_table.addColumn('datetime', 'Timestamp');

        // Add rest of numerical columns
        $.each(numeric_columns, function (index, column) {
            data_table.addColumn('number', column);
        });

        // for each entry add a row to the chart data table
        $.each(data, function (key, row) {
            data_table.addRow(order_entry_data(row, numeric_columns));
        });

        // return data table for charts to use    
        return callback(data_table)

    });

}