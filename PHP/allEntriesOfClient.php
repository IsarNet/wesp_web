<?php

require "config/config.php";
        
try {

	if (isset($_GET['client'])) {
    	$client = $_GET['client'];
	} else {
    	echo 'No Client provided';
    	exit(1);
	}
	
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

	//convert time to UTC and format to ISO
    $stmt = $pdo->prepare("SELECT *, DATE_FORMAT(CONVERT_TZ( Timestamp, @@session.time_zone, '+00:00' ), '%Y-%m-%dT%TZ') AS Timestamp_ISO FROM $TABLE WHERE `$CLIENT_IDENTIFICATION_COLUMN` like '$client'");
    $stmt->execute();
	$resultJSON = json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
		
	echo($resultJSON);

	//close connection
	$pdo = null;
}

catch(Exception $e) {
    echo 'Exception -> ';
    var_dump($e->getMessage());
}
   
  
?>