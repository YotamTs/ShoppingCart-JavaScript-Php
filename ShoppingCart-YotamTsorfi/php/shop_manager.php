

<?php
require('productsDB.php');

if (empty($_POST)){
    die("Perform code for page without POST data");
}

$productsDB = new ProductDB();

try {
    switch (htmlspecialchars(key($_POST))) {
    case "search_box":
        $str = htmlspecialchars($_POST["search_box"]);
        echo json_encode($productsDB->getProductsByName($str));
        break;
    case "get_all":
        echo json_encode($productsDB->getAllProducts());
        break;
    }
}
catch(Exception $exp) {
    header('!', true, 404);
    echo json_encode("test");
    // TODO - send error info   
}






