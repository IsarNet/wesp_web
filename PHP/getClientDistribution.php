<?php

require "config/config.php";
        
try {
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


    $stmt = $pdo->prepare("SELECT `$CLIENT_IDENTIFICATION_COLUMN` as Client, COUNT(`$CLIENT_IDENTIFICATION_COLUMN`) as Amount, Timestamp FROM (SELECT * FROM $TABLE ORDER BY `Timestamp` DESC) as tableOrdered GROUP BY `$CLIENT_IDENTIFICATION_COLUMN` ORDER BY `Timestamp` DESC;");
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