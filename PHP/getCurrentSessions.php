<?php

require "config/config.php";
        
try {
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

	//convert time to UTC and format to ISO
    $stmt = $pdo->prepare("SELECT *, DATE_FORMAT(CONVERT_TZ( Timestamp, @@session.time_zone, '+00:00' ), '%Y-%m-%dT%TZ') AS Timestamp_ISO FROM $TABLE WHERE `Timestamp` > (CURRENT_TIMESTAMP - 90) GROUP BY `$CLIENT_IDENTIFICATION_COLUMN`");
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