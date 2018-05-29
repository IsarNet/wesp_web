<?php

require "config/config.php";
        
try {
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


    $stmt = $pdo->prepare("SELECT ROUND(CAST(sumEntries AS DECIMAL) / numberOfDay, 2) as EntriesPerDay FROM (SELECT COUNT(*) AS sumEntries, COUNT(DISTINCT DATE_FORMAT(Timestamp, '%d')) as numberOfDay FROM $TABLE) as statistic;");
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