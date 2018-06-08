var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb+srv://admin:admin@cluster0.mongodb.net/test";
MongoClient.connect(uri, function(err, client) {
   const collection = client.db("test").collection("devices");
   // perform actions on the collection object
   client.close();
});