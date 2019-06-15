var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon",
  port: 3388
});
connection.connect();
var display = function() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    var table = new Table({
      head: ["Product Id", "Product Name", "Cost","Quantity"],
      colWidths: [12, 40, 8,10],
      colAligns: ["center", "left", "right","right"],
      style: {
        head: ["aqua"],
        compact: true
      }
    });

    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
    console.log("");
    shopping();
  }); 
};

var shopping = function() {
  inquirer
    .prompt({
      name: "productSelected",
      type: "input",
      message: "Please enter the Product Id: "
    })
    .then(function(response) {
      var selection = response.productSelected;
      connection.query("SELECT * FROM products WHERE item_id=?", selection, function(
        err,
        res
      ) {
        if (err) throw err;
        if (res.length === 0) {
          console.log(
            "Please enter a Product Id from the list above"
          );

          shopping();
        } else {
          inquirer
            .prompt({
              name: "quantity",
              type: "input",
              message: "How many?: "
            })
            .then(function(response2) {
              var quantity = response2.quantity;
              if (quantity > res[0].stock_quantity) {
                console.log("Insuficient Product");
                shopping();
              } else {
                console.log("");
                console.log(res[0].product_name + " purchased");
                console.log(quantity + " qty @ total of $" + (res[0].price*quantity));

                var newQuantity = res[0].stock_quantity - quantity;
                connection.query(
                  'UPDATE products SET ? WHERE ?',
                   [
                      {
                         stock_quantity: newQuantity
                      },
                      {
                         item_id: res[0].item_id
                      }
                   ],
                  function(err, resUpdate) {
                    if (err) throw err;
                    console.log("");
                    console.log("Your Order has been Processed");
                    console.log("");
                    connection.end();
                  }
                );
              }
            });
        }
      });
    });
};

display();
