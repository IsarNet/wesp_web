<?php

require "config/config.php";
class Event
{
    public $start;
    public $end;
	public $client;
}
        
try {
	
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

	//convert time to UTC and format to ISO
    $stmt = $pdo->prepare("SELECT *, DATE_FORMAT(CONVERT_TZ( Timestamp, @@session.time_zone, '+00:00' ), '%Y-%m-%dT%TZ') AS Timestamp_ISO FROM $TABLE ORDER BY `Timestamp` ASC");
    $stmt->execute();
	$result = ($stmt->fetchAll(PDO::FETCH_ASSOC));
	
	//Create empty array which will hold events
	$ranges=array();
		
	// Add first start to first event
	$event = new Event();
	$event->start = $result[0]["Timestamp_ISO"];
		
	foreach($result as $i => $item) {
	
    	// ignore last slot
    	if (!is_null($result[$i+1]["Timestamp_ISO"])){

			// if next entry is of different client, end event here
						
			if ($result[$i]["$CLIENT_IDENTIFICATION_COLUMN"] !== $result[$i+1]["$CLIENT_IDENTIFICATION_COLUMN"]) {
			
				//add end of event
				$event->end = $result[$i]["Timestamp_ISO"];
				$event->client = $result[$i]["$CLIENT_IDENTIFICATION_COLUMN"];
				// Add current event to array
				array_push($ranges, $event);
				
				// Create new event and add start time
				$event = new Event();
				$event->start = $result[$i+1]["Timestamp_ISO"];
			
			} else {
				//calc time difference in seconds
				$diff = strtotime($result[$i]["Timestamp_ISO"]) - strtotime($result[$i+1]["Timestamp_ISO"]);
		
				// Check if difference to next item is smaller than 60 seconds, if so an event has been found
				if (abs($diff) > 60) {
			
					//add end of event
					$event->end = $result[$i]["Timestamp_ISO"];
					$event->client = $result[$i]["$CLIENT_IDENTIFICATION_COLUMN"];
					// Add current event to array
					array_push($ranges, $event);
				
					// Create new event and add start time
					$event = new Event();
					$event->start = $result[$i+1]["Timestamp_ISO"];
				}
			}
		}
	}
	
	// Add end of last event and add it to array
	$event->end = end($result)["Timestamp_ISO"];
	$event->client = end($result)["$CLIENT_IDENTIFICATION_COLUMN"];
	array_push($ranges, $event);

	echo json_encode($ranges);

	//close connection
	$pdo = null;
}

catch(Exception $e) {
    echo 'Exception -> ';
    var_dump($e->getMessage());
}
   
  
?>