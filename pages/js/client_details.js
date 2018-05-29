// Load the Visualization API and the controls package.
google.charts.load('current', {
    'packages': ['corechart', 'controls']
});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var client = getUrlParameter('client');

    if (client === undefined) {
        alert("No Client IP provided");
    }

    //Add client IP to Headline
    document.getElementById('client_header').innerHTML = client;
    document.getElementById('client_headline').innerHTML = client;
    document.getElementById('historyLink').setAttribute('href', '/pages/history.html?client=' + client);
    document.getElementById('liveLink').setAttribute('href', '/pages/live.html?client=' + client);
    document.getElementById('tableLink').setAttribute('href', '/pages/table.html?client=' + client);

    // Create new control wrapper with basic options
    var control = new google.visualization.ControlWrapper({
        controlType: 'ChartRangeFilter',
        containerId: 'control_div',
        options: {
            filterColumnIndex: 0,
            ui: {
                chartOptions: {
                    backgroundColor: {
                        fill: 'transparent'
                    },
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

        // Create new Google Line Chart with basic options
        var chart = new google.visualization.ChartWrapper({
            chartType: 'LineChart',
            containerId: 'chart_div',
            options: {
                height: 400,
                // omit width, since we set this in CSS
                chartArea: {
                    width: '75%' // this should be the same as the ChartRangeFilter
                },
                // set date format for horizontal axis
                hAxis: {
                    format: date_format
                },
                // make data points visible
                pointSize: 3

            }
        });

        // Create dashboard and bind control and all charts
        var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
        dashboard.bind([control], chart);

        // change date format of tooltip
        var formatter = new google.visualization.DateFormat({
            pattern: date_format
        });
        formatter.format(data, 0);

        // draw everything
        dashboard.draw(data);

    })

}

function retrieve_data(client, callback) {

    var data_table = new google.visualization.DataTable();

    // request data from database
    $.getJSON("/PHP/first20EntriesOfClient.php?client=" + client, function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check client address!')
        }

        // Add Timestamp as latest update
        document.getElementById('last_update').innerHTML += data[0].Timestamp;

        // Build details of Client
        details = ""
        // Add each entry to details, except id
        $.each(data[data.length - 1], function (index, value) {
            
            if (!(index.includes('Timestamp') || index.includes("id"))) {
                details += "<b>" + index + ":</b> " + value + "<br>";
            }
        });
        //write it to DOM
        document.getElementById('client_details').innerHTML += details;

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
