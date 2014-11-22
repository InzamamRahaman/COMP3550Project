/**
 * Created by Inzamam on 11/20/2014.
 */
var express = require("express");
var config = require("./libs/config");
var app = config.init_server(express());
var db = require("seraph")(config.db_conn_string);
db.query('MATCH (pp:Person) WHERE pp.name = "Jane" RETURN pp', {}, function(err, res) {
    if(err) {
        console.log("Error querying for Jane")
    } else {
        console.log(res);
    }
});
var Models = require("./libs/models").Models;
console.log(Models);
var models = new Models(db); // Use this to manipulate models
var RelationshipManager = require("./libs/relationships").RelationshipManager;
var relationships = new RelationshipManager(db);
app.listen(config.port);
console.log("Application started at http://127.0.0.1:"
    + config.port);


// Code to test creation, deletion, ect...

models.User.save({identifier: "test12"}, function(err, res){
  if(err) {
      console.log("error");
  }  else {
      var res2 = undefined;
      console.log("created user " + JSON.stringify(res));
      console.log("creating relationship");
      relationships.userFollowHashtag("test12", "scala", function(data) {
          res2 = data;
          console.log("relationship " + JSON.stringify(res2));
      });
  }
});










