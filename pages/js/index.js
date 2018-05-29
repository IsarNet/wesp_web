google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(drawChart);

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function drawChart() {

    var options = {
        backgroundColor: {
            fill: 'transparent'
        },
        colors: line_colors,
        'height': 400,
        'legend': {
            'position': 'top',
            'maxLines': 4
        }
    };

    retrieve_data_for_chart(function (data_array) {

        var chart = new google.visualization.PieChart(document.getElementById('clientPieChart'));

        var data = google.visualization.arrayToDataTable(data_array);

        chart.draw(data, options);
    });

}


$(document).ready(function () {

    //Add default value to wlc IP
    if (localStorage.getItem("wlc_ip") === null || localStorage.getItem("wlc_ip") === "") {
        localStorage.setItem("wlc_ip", "192.168.1.240");
    }
    // Retrieve ip
    var wlc_ip = localStorage.getItem("wlc_ip");
    //add it to DOM
    document.getElementById('wlc_label').innerHTML = wlc_ip;
    document.getElementById('ssh_headbox').setAttribute('href', ':2222/ssh/host/' + wlc_ip);

    // Create and add Timeline
    retrieve_data_for_timeline(function (timeline_body) {
        document.getElementById('main_timeline').innerHTML = timeline_body;

    })

    //Retrieve and add data about currently active sessions
    retrieve_data_for_live_sessions(function (number_of_sessions, link) {
        document.getElementById('activeSessions').innerHTML = number_of_sessions;
        document.getElementById('activeSessionsLink').setAttribute('href', link);
    })

    // Retrieve and add requests per day
    retrieve_data_for_per_day(function (requestsPerDay) {
        document.getElementById('requestsPerDay').innerHTML = requestsPerDay;

    })

})

// <--- DATA FETCHERS ---->

function retrieve_data_for_chart(callback) {

    var data_array = [['Client', 'Amount']];

    // request data from database
    $.getJSON("/PHP/getClientDistribution.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check database connection!')
        }

        //Add number of clients, which is the same as the length of the returned list
        document.getElementById('clientCount').innerHTML = data.length;

        // for each entry add a row to the chart data table
        $.each(data, function (key, row) {
            data_array.push([row['Client'], row["Amount"]]);
        });

        // return data table for charts to use    
        return callback(data_array)

    });

}

function retrieve_data_for_timeline(callback) {

    // request data from database
    $.getJSON("/PHP/getTimelineEntries.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check database connection!')
        }

        var date_last_entry = undefined;
        var timeline_body = "";

        // for each entry add a row to the chart data table
        $.each(data, function (key, value) {
            var date_current_entry = new Date(value['Timestamp_ISO']);

            //If entries are not on the same day, add a new label
            if (date_last_entry === undefined || !sameDay(date_current_entry, date_last_entry)) {
                timeline_body += '<!-- timeline time label --> <li class="time-label"><span class="bg-black">';

                //If today, write Today instead of date
                if (sameDay(date_current_entry, new Date())) {
                    timeline_body += 'Today';

                } else {
                    timeline_body += monthNames[date_current_entry.getMonth()] + ' ' + date_current_entry.getDate() + ', ' + date_current_entry.getFullYear();

                }

                timeline_body += '</span></li> <!-- /.timeline-label -->';

                //save date for next iteration
                date_last_entry = date_current_entry;
            }

            // Add time item
            timeline_body += create_post_timeitem(value, key, date_current_entry);
        });

        // Add clock as visual ending of timeline
        timeline_body += ' <li><i class="fa fa-clock-o bg-gray"></i></li>';

        // return data table for charts to use    
        return callback(timeline_body)

    });

}

function retrieve_data_for_live_sessions(callback) {

    // request data from database
    $.getJSON("/PHP/getCurrentSessions.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            return callback(0, '#')
        }

        // return data for ready method to use    
        return callback(data.length, '/pages/live.html?client=' + data[0]['Client IP Address']);

    });

}

function retrieve_data_for_per_day(callback) {

    // request data from database
    $.getJSON("/PHP/getEntriesPerDay.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check database connection!')
        }

        // return data for ready method to use    
        return callback(data[0]['EntriesPerDay']);

    });

}
// <--- HELPERS ---->

function create_post_timeitem(data_set, index, date_of_entry) {
    var timeitem = '<!-- timeline item --><li><i class="fa fa-desktop bg-' + line_colors[index] + '"></i><div class="timeline-item">';

    //If today, write Today and only time instead of full date
    if (sameDay(date_of_entry, new Date())) {
        timeitem += '<span class="time"><i class="fa fa-clock-o"></i> Today ' + date_of_entry.getHours() + ':' + date_of_entry.getMinutes() + ':' + date_of_entry.getSeconds() + '</span>';

    } else {
        timeitem += '<span class="time"><i class="fa fa-clock-o"></i> ' + data_set['Timestamp'] + '</span>';

    }

    //Add Headline and link
    timeitem += '<h3 class="timeline-header"><a href="/pages/client_details.html?client=' + data_set[localStorage.getItem("client_identification_column")] + '">' + data_set['Client IP Address'] + '</a> analyzed</h3>' +

        '<div class="timeline-body">' + create_post_table(data_set) + '</div>' +
        '</div></li> <!-- END timeline item -->';

    return timeitem;
}

function create_post_table(data_set) {
    var table = '<table class="post_table"><tr><td class="mac_address" rowspan=2>' + data_set['Client Mac Address'] + '</td>';
    var iteration = 0;

    var ignore = ["Client IP Address", "Mac Address", "id", "Timestamp"];

    $.each(data_set, function (key, value) {
        //Only add non null values and ignore a bunch of keys
        if (!ignore.includes(key) && value !== null && value !== undefined) {

            //Add column to string and iterate
            table += '<td><b>' + key + ': </b>' + value + '</td>';
            iteration += 1;

            //After 3 values add new row
            if (iteration === 3) {
                table += "</tr><tr>"
            }

            //Add only 6 values to enhance visiblity
            if (iteration === 6) {
                return false;
            }
        }


    });


    return table + '</tr></table>';

}
