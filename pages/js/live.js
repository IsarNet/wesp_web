// Load the Visualization API and the controls package.
google.charts.load('current', {
    'packages': ['controls']
});
google.charts.setOnLoadCallback(drawChart);

//declare interval stuff
var interval_seconds = 5000;
var interval_id;

//declare chart stuff
var client = getUrlParameter('client');
var dashboard;
var formatter;
var control;

function drawChart() {
    if (client === undefined) {
        alert("No Client IP provided");
    }

    //Add client IP to Headline
    document.getElementById('client_header').innerHTML = client;
    document.getElementById('client_history').innerHTML += "(" + client + ")";
    document.getElementById('client_history').setAttribute('href', '/pages/client_details.html?client=' + client);

    interval_id = create_interval();

    //register Listner
    $("#automatic_update_switch").change(function (value) {
        if (value.target.checked) {
            interval_id = create_interval();
        } else {
            window.clearInterval(interval_id);
        }
    });

    dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
    formatter = new google.visualization.DateFormat({
        pattern: date_format
    });

    // get reference to container
    chart_container = document.getElementById('container');

    // Create new control wrapper with basic options
    control = new google.visualization.ControlWrapper({
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

        // Bind control and all charts
        dashboard.bind([control], all_charts);

        // change date format of tooltip
        formatter.format(data, 0);

        // draw everything
        dashboard.draw(data);

    })
}

function retrieve_data(client, callback) {

    var data_table = new google.visualization.DataTable();

    // request data from database
    $.getJSON("/PHP/allEntriesOfClientLast90.php?client=" + client, function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('No recent data for client available!')
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

function update_chart(client, formatter, dashboard) {
    retrieve_data(client, function (new_data) {

        //Format data
        formatter.format(new_data, 0);

        // draw everything
        dashboard.draw(new_data);

        //adjust control
        zoomToEverything(new_data, control);

    })
}

function create_interval() {
    return window.setInterval(function () {
        update_chart(client, formatter, dashboard);
    }, interval_seconds);
}

function update_interval(interval) {
    // set new seconds in ms
    interval_seconds = interval * 1000;
    //update button to make change visible
    document.getElementById('dropdown_button').innerHTML = interval + "s";
    //restart Intervall
    window.clearInterval(interval_id);
    interval_id = create_interval();
    document.getElementById('automatic_update_switch').checked = true;
}
