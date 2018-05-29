$('#save_db_button').click(function () {

    $.ajax({
        data: {
            db_address: $('#db_address').val(),
            db_port: $('#db_port').val(),
            db_user: $('#db_user').val(),
            db_password: $('#db_password').val(),
            db_name: $('#db_name').val(),
            db_table: $('#db_table').val(),
        },
        url: '/PHP/config/saveDBConfig.php',
        method: 'POST', // or GET
        success: function (data, statusText, xhr) {
            $('#db_response_text').text("Settings saved!");
            $('#db_response_text').css('color', 'green');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#db_response_text').css('color', 'red');

            if (xhr.status === 400) {
                $('#db_response_text').text("Unable to connect to Database! Check settings. More details can be found on the console.");
            } else {
                $('#db_response_text').text("Unknown error (" + xhr.responseText + ")");
            }
            console.error("Server Response Code: " + xhr.status);
            console.error("Server Response Text: " + xhr.responseText);
        }
    });
})

$('#save_general_button').click(function () {

    var wlc_ip = $('#wlc_address').val();
    var client_identification_column = $('#client_identification_column').val()

    //set defaults in case nothing is set by user
    if (wlc_ip === "") {
        wlc_ip = "192.168.1.240";
    }
    if (client_identification_column === "") {
        client_identification_column = "Client Mac Address";
    }

    //Save to local storage
    localStorage.setItem("wlc_ip", wlc_ip);
    localStorage.setItem("client_identification_column", client_identification_column);

    //update Links
    if (window.location.pathname === "/") {
        document.getElementById('wlc_label').innerHTML = wlc_ip;
        document.getElementById('ssh_headbox').setAttribute('href', ':2222/ssh/host/' + wlc_ip);
        document.getElementById('ssh_sidebar').setAttribute('href', ':2222/ssh/host/' + wlc_ip);
    }

    //save column name to server
    $.ajax({
        data: {
            client_identification_column: $('#client_identification_column').val()
        },
        url: '/PHP/config/saveGeneralConfig.php',
        method: 'POST', // or GET
        success: function (data, statusText, xhr) {
            $('#general_response_text').text("Settings saved!");
            $('#general_response_text').css('color', 'green');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#general_response_text').css('color', 'red');

            $('#general_response_text').text("Unknown error (" + xhr.responseText + ")");

            console.error("Server Response Code: " + xhr.status);
            console.error("Server Response Text: " + xhr.responseText);
        }
    });
})

//is called by Control Sidebar Toggle Button in header.html
function load_config() {
    //wait for animation to finsih
    setTimeout(function () {
        //check if sidebar is active or not
        if ($('#sidebar_right').parent().hasClass('control-sidebar-open')) {

            //get db config from server and insert into text fields.
            //Make sure config key and html id are the same
            $.getJSON("/PHP/config/getDBConfig.php", function (data) {
                $.each(data, function (key, val) {
                    $('#' + key).val(val);
                });
            });

            //get general config from server and insert into text fields.
            //Make sure config key and html id are the same
            $.getJSON("/PHP/config/getGeneralConfig.php", function (data) {
                $.each(data, function (key, val) {
                    $('#' + key).val(val);
                });
            });

            //load general settings from local storage
            $('#wlc_address').val(localStorage.getItem("wlc_ip"));
        }


    }, 100);
}
