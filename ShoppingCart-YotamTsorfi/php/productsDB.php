<?php

 define("SERVER_NAME", "localhost");
 define("USER_NAME", "root");
 define("PASSWORD", "");
 define("DB_NAME", "ex3");

 class Product {
     public function __construct($name, $ref, $price, $img) {
         $this->name = $name;
         $this->ref = $ref;
         $this->price = $price;
         $this->img = $img;
    }
}

class ProductDB {

   private function dbQuery($query) {
       
       // Create connection
       $conn = new mysqli(SERVER_NAME, USER_NAME, PASSWORD, DB_NAME);
       
       // Check connection
        if ($conn->connect_error) {
            throw new Exception("db connection failed");
        } 
        
        // get data from db
        $match = $conn->query($query);  
        $result = array();
        if ($match->num_rows > 0) {
            // output data of each row
            while($row = $match->fetch_assoc()) {
                array_push($result, new Product($row["name"], $row["ref"], $row["price"], $row["image_url"]));
            }
        }
        $conn->close();
        return $result;
   }
   
   function getProductsByName($str) {
       $query = "SELECT * FROM products WHERE name LIKE '" .$str. "%'";
       return $this->dbQuery($query);
   }
   
   function getAllProducts() {
       $query = "SELECT * FROM products";
       return $this->dbQuery($query);
   }
}