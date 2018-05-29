<?php

$required = ['db_address', 'db_port'];

//ensure IP and Port are set
foreach($required as $item) {
    if (!array_key_exists($item, $_POST)) {
		http_response_code(400);
    	echo "Bad Request: Missing POST Parameter '$item'";
    	exit;
	}
}

//remove empty fields by filtering array
$json_string = json_encode(array_filter($_POST));


$file_handle = fopen('db_config.json', 'w');
fwrite($file_handle, $json_string);
fclose($file_handle);

//test connection
$result = (include 'config.php');
var_dump($result);

?>