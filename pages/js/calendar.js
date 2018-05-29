$(document).ready(function () {

    retrieve_data(function (events) {
        init_calendar(events);
    })

});

function init_calendar(events) {
    /* initialize the calendar
     -----------------------------------------------------------------*/
    //Date for the calendar events (dummy data)
    var date = new Date()
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear()
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        buttonText: {
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day'
        },
        //Random default events
        events: events,
        timeFormat: 'H(:mm)', 
        editable: false,
        droppable: false,
        eventClick: function (calEvent, jsEvent, view) {

            console.log('Event: ' + calEvent.title);
            console.log('Start: ' + calEvent.start);
            console.log('End: ' + calEvent.end);
            
            window.open("/pages/history.html?client=" + calEvent.title +
                        "&start=" + calEvent.start +
                        "&end=" + calEvent.end,
                        "_self")

        }
    })

}

function retrieve_data(callback) {

    // request data from database
    $.getJSON("../PHP/getConnectedEntries.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check client address!')
        }
        
        // will hold a relation between color and client, to ensure that all events
        // of one client have the same color
        var client_color_relation = {};
    
        events = [];

        $.each(data, function (index, entry) {
            
            color = getRandomColor()
            
            // associate new random color to client, if not already done
            if (!(entry.client in client_color_relation)) {
                client_color_relation[entry.client] = getRandomColor();
            }
                            
            //add event to list
            events.push({
                title: entry.client,
                start: new Date(entry.start),
                end: new Date(entry.end),
                allDay: false,
                backgroundColor: client_color_relation[entry.client],
                borderColor: client_color_relation[entry.client]
            })
        });

        // return data table for charts to use    
        return callback(events)

    });
}
