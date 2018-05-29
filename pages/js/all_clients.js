$(document).ready(function () {
        retrieve_data(function (data_table) {            
            // add html
            document.getElementById('client_list_body').innerHTML += data_table;
            //init table with options
            $('#client_list').DataTable({
              'paging'      : true,
              'lengthChange': true,
              'searching'   : false,
              'ordering'    : true,
              'info'        : true,
              'autoWidth'   : false
            })
        })

    })

function retrieve_data(callback) {

    var data_table = "";

    // request data from database
    $.getJSON("/PHP/listClients.php", function (data) {

        // check if data has been received
        if (data.length === 0) {
            console.log('SQL Data is empty!');
            alert('SQL Data is empty, check client address!')
        }

        // loop through all clients and add data
        $.each(data, function (index, entry) {
            data_table += ("<tr>" +
                "<td>" + entry['Client IP Address'] + "</td>" +
                "<td>" + entry['Client Mac Address'] + "</td>" +
                "<td>" + entry['AP Name'] + "</td>" +
                "<td>" + entry['Timestamp'] + "</td>" +
                "<td><a href=/pages/client_details.html?client=" + entry[localStorage.getItem("client_identification_column")] + "> Show Details </a></td>" +
                "</tr>")
        });

        
        // return data table for charts to use    
        return callback(data_table)

    });

}
