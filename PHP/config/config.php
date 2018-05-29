<?php

	class DBConfig { 
    	public $db_address = '127.0.0.1'; 
    	public $db_port = '3334'; 
    	public $db_user = 'root'; 
    	public $db_password = 'root'; 
    	public $db_name = 'WESP'; 
    	public $db_table = 'data'; 
    	public $client_identification_column = 'Client Mac Address';
    
    
    	function load_config() { 
    		//read db config
        	$string = file_get_contents(dirname(__FILE__)."/db_config.json");
			$json_a = json_decode($string, true);

			
			// if possible read from config file, otherwise use default value
			$this->db_address = (is_null($json_a['db_address'])) ? $this->db_address : $json_a['db_address'];
			$this->db_port = (is_null($json_a['db_port'])) ? $this->db_port : $json_a['db_port'];
			$this->db_user = (is_null($json_a['db_user'])) ? $this->db_user : $json_a['db_user'];
			$this->db_password = (is_null($json_a['db_password'])) ? $this->db_password : $json_a['db_password'];
			$this->db_name = (is_null($json_a['db_name'])) ? $this->db_name : $json_a['db_name'];
			$this->db_table = (is_null($json_a['db_table'])) ? $this->db_table : $json_a['db_table'];
			
			//read db config
        	$string_general = file_get_contents(dirname(__FILE__)."/general_config.json");
			$json_a_general = json_decode($string_general, true);
			$this->client_identification_column = (is_null($json_a_general['client_identification_column'])) ? $this->client_identification_column : $json_a_general['client_identification_column'];
    	} 
	} 
	
	$config = new DBConfig();
	$config->load_config();
	
	$host = ($config->db_address).":".($config->db_port);
	//set important vars
	$TABLE = $config->db_table;
	$CLIENT_IDENTIFICATION_COLUMN = $config->client_identification_column;
	
	//Test connection, if fails raise error.
	try{
    	$pdo = new PDO("mysql:host=$host;dbname=".($config->db_name), 
    		($config->db_user), 
    		($config->db_password), 
    		array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8", PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

	}
	
	catch(PDOException $ex){
		http_response_code(400);
		$reponse = array('message' => 'Unable to connect!', 'host' => $host, 'DB Name'=> $config->db_name, 'user'=> $config->db_user, 'password'=>$config->db_password);
		return $reponse;
    	die(json_encode($reponse));
		
	}    
?>