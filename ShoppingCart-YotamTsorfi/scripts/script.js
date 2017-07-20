
// run once the page DOM is ready.
$( document ).ready(function() {
    console.log("document ready!");
        
    // fill the products list
    $.ajax(requestConf(setProductsList, "get_all=x")); 
 
    // set callback function for search button.
    $("#form").submit(function(e) {

        // avoid to execute the actual submit of the form.
        e.preventDefault(); 
        
        //onkeyup  function 
        //todo
//        $.ajax(onkeyup())
        
        // send "all products" request to the server.
        $.ajax(requestConf(setProductsList, $("#form").serialize()));   
    });  
});

// ajax request configurations
// recieve callback function that handling the server respond
function requestConf(onResult, data) {
    return {
        type:     "POST",
        url:      "./php/shop_manager.php",
        data:     data,
        cache:    false,
        timeout:  5000,          // time before calling onServerError
        success:  onResult,      // handle server respond
        error:    onServerError  // handle server error
    };
}

// show error message when server error occur.
function onServerError() {
    showErrorMsg("server is unavailable, please try later");
    alert('request failed');  
}

// receive products array (in json format), and add all this products to the DOM.
function setProductsList(jsonData) { 
    $("#productsList").empty();
    var prouctsArray = getProducts(jsonData);
    for (var i = 0; i <prouctsArray.length; ++i){
        addProductToDOC(prouctsArray[i],new ListElementConf());
    }
    // show "No matching products" message if no results.
    if (prouctsArray.length === 0) 
        showErrorMsg("No matching products");  
    else 
        hideErrorMsg();
}

// convert server respond to products array.
function getProducts(jsonData) {
    return JSON.parse(jsonData); //the content that return from the httpRequerst is being change backe to array.
}

// return array with all the products names that in the given array.
function getProductsNames(productsArray) {
    var names = [];
    for (var i = 0; i <productsArray.length; ++i){
        names.push(productsArray[i]["name"]);
    }
    return names;
}

// receive product object and configuration object,
// and add the product to the DOM.
function addProductToDOC(product, elementConf){   
    elementConf.getContainer().append(getProductElement(
            product["name"], product["ref"], product["price"] + "$", product["img"], elementConf)); 
}

// receive product data, return product element (html format).
function getProductElement(name, ref, productPrice, imgUrl, elementConf) {  
    var title = jQuery('<h4/>', {class: "card-title", text: name});   
    var price = jQuery('<p/>', {class: "card-text price", text: productPrice});
    var quantity = jQuery('<p/>', {class: "card-text quantity", text: elementConf.getQuantity()});
    var cardBlock = jQuery('<div/>', {class: "card-block"}).append(title, price, quantity, elementConf.getButton());
    var image = jQuery('<img/>', {class: "card-img-top img-fluid", src: imgUrl, draggable: "false"});
    var card = jQuery('<div/>', {class: "card", id: ref, draggable: "true", ondragstart: "onDragStart(event)"}).append(image, cardBlock);
    var col = jQuery('<div/>', {class: "col-lg-4 col-md-6 col-sm-12 col-xs-12 cardHolder"}).append(card);   
   return col;
}

// receive product element (html format), return product object with the same data.
function getProductFromHtml(productCard) {
    var product_img = $(productCard).find("img").attr("src");
    var product_price = $(productCard).find(".price").text().slice(0, -1);
    var product_ref = $(productCard).attr("id");
    var product_name = $(productCard).find(".card-title").text();  
    return {name: product_name, ref: product_ref, price: product_price, img: product_img};
}

// receive product element and insert it to the cart
function addToCart(productCard) {
    playAddingSound();
    var elementConf = new cartElementConf();
    $("#empty_cart_msg").hide();  
    $("#empty_cart_btn").prop('disabled', false);
    var existingInCart = $("#cart").find("#" + $(productCard).attr("id"));
    // product not exist in the cart - add it to the cart.
    if (existingInCart.length === 0)
        addProductToDOC(getProductFromHtml(productCard), elementConf);  
    // product exist in the cart - change quantity number.
    else {
        var text = $(existingInCart).find(".quantity").text();
        var quantity = (Number(text.slice(10, text.length)));
        $(existingInCart).find(".quantity").text(elementConf.getQuantityString(++quantity));
    }    
}

// receive product element (html format) and remove it from the cart.
function removeFromCart(productCard) {
      if ($("#cart").children().length === 1) {
           $("#empty_cart_msg").show();  
           $("#empty_cart_btn").prop('disabled', true);
      }  
    $(productCard).remove(); 
    playRemovingSound();  
}
// remove all products from the cart.
function removeAllFromCart() {
    $("#empty_cart_msg").show();  
    $("#empty_cart_btn").prop('disabled', true);
    $("#cart").empty();
}

// return array with all products from the products list.
function getProductsFromList() {
    var products = [];
    var cards = $("#productsList").find(".card");
     for (var i = 0; i <cards.length; ++i){ 
        products.push(getProductFromHtml(cards[i]));
    }
    return products;   
}

function sortByName() { 
    if ($("#name_order").text() === "Name: A-Z") {
        $("#name_order").text("Name: Z-A");
        sortProducts(nameDec);
    }
    else {
        $("#name_order").text("Name: A-Z");
        sortProducts(nameAsc);
    }       
}

function sortByPrice() { 
    if ($("#price_order").text() === "Price: increasing") {
        $("#price_order").text("Price: decreasing");
        sortProducts(priceDec);
    }
    else {
        $("#price_order").text("Price: increasing");
        sortProducts(priceAsc);
    }       
}

// generic function to sort the products list.
function sortProducts(sortFunc) {
    var products = getProductsFromList();
    products.sort(sortFunc);
    $("#productsList").empty();
    
    // insert the sorted array into the DOC
    for (var i = 0; i <products.length; ++i){
        addProductToDOC(products[i], new ListElementConf());
    }
}

function priceAsc(a, b) { 
    return a.price - b.price;
}

function priceDec(a, b) { 
    return b.price - a.price;
}

function nameAsc(a, b) { 
    return a.name.localeCompare(b.name);
}

function nameDec(a, b) { 
    return b.name.localeCompare(a.name);
}

function showErrorMsg(errMsg) {
    $("#error_msg").text(errMsg).show();    
}

function hideErrorMsg() {
    $("#error_msg").hide();
}

// configuration class for cart element.
class cartElementConf {
     constructor() {
       this.quantity = 1;
    }
    getButton() {
        return jQuery('<input/>', 
        {class: "btn btn-danger btn-block", herf: "#", type: "button",
            value: "Remove", onClick: "removeFromCart($(this).closest('.cardHolder'))"}); 
    }
    getContainer() {
        return $("#cart");
    }
    getQuantity() {
        return "Quantity: " + this.quantity.toString();
    }
    getQuantityString(num) {
        this.quantity = num;
        return "Quantity: " + this.quantity.toString();
    }
}

// configuration class for list element.
class ListElementConf {
    getButton() {
        return jQuery('<input/>', 
        {class: "btn btn-success btn-block", herf: "#", type: "button",
            value: "Buy", onClick: "addToCart($(this).closest('.card'))"});
    }
    getContainer() {
        return $("#productsList");
    }
    getQuantity() {
        return "";
    }
}
  
function onDragStart(event) {
    event.dataTransfer.setData("productID", $(event.target).attr("id"));
    event.dataTransfer.setData("containerID", $(event.target).closest(".productsContainer").attr("id"));
} 

function onDrop(event) {
    // drag product from list to cart - add product to the cart.
    if (event.dataTransfer.getData("containerID") === "productsList" && 
         ($(event.target).hasClass("dropToCart") || $(event.target).parents().hasClass("dropToCart"))) {
        addToCart($("#productsList").find("#" + event.dataTransfer.getData("productID")));
    }
    // drag product from cart to products list - remove product from cart.
    else if (event.dataTransfer.getData("containerID") === "cart" && 
          ($(event.target).hasClass("dropToList") || $(event.target).parents().hasClass("dropToList"))) {
        removeFromCart($("#cart").find("#" + event.dataTransfer.getData("productID")).parent(".cardHolder"));    
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function isCartItem(productElement) {
    return $(productElement).closest("#cart").length === 1;
}

function playAddingSound() {
   (new Audio("sounds/add_product.ogg")).play();    
}

function playRemovingSound() {
   (new Audio("sounds/remove_product.ogg")).play();    
}