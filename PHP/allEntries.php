<?php

require "config/config.php";
        
try {
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);


    $stmt = $pdo->prepare("SELECT * FROM $TABLE");
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