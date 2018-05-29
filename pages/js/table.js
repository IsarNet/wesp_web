$(document).ready(function () {

    var client = getUrlParameter('client');

    retrieve_data(client, function (table_head, table_body) {
        // add html
        document.getElementById('table_head').innerHTML += table_head;
        document.getElementById('table_body').innerHTML += table_body;
        //init table with options
        $('#client_list').DataTable({
            'paging': true,
            'lengthChange': true,
            'searching': false,
            'ordering': true,
            'info': true,
            'autoWidth': false
        })
    })

})

function retrieve_data(client, callback) {

    var table_head = "";
    var table_body = "";
    var path = "/PHP/allEntries.php";
    
    //If client provided only retrieve data for this client
    if (client !== undefined) {
        path = "/PHP/allEntriesOfClient.php?client=" + client;
        document.getElementById('client_history').innerHTML += "(" + client + ")";
        document.getElementById('client_history').setAttribute('href', '/pages/client_details.html?client=' + client);
        document.getElementById('client_history').parentElement.style.display = "initial";
    } 

    // request data from database
    $.getJSON(path, function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check client address!')
        }

        $.each(data, function (index_row, row) {
            
            // Add new row
            table_body += "<tr>";

            $.each(row, function (name_column, column) {
                // Use first entry to create table head
                if (index_row === 0) {
                   table_head += "<th>" + name_column + "</th>";
                }
                
                // Add data to table body
                 table_body += "<td>" + column + "</td>";
            });
            
            // Add end of new row
            table_body += "</tr>";
        });
            
        // return data table for charts to use    
        return callback(table_head, table_body)

    });

}
