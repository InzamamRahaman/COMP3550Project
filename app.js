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
models.setUpDB(function() {

    var RelationshipManager = require("./libs/relationships").RelationshipManager;
    var relationships = new RelationshipManager(db);

    console.log("set up database, setting up api's");
    var API = require("./libs/API").apiManager;    
    var api = new API(app);


    app.listen(config.port);
    console.log("Application started at http://127.0.0.1:"
    + config.port);
    test2(relationships);
app.use(express.static(__dirname + '/app'));
// Code to test creation, deletion, ect...


});

function test2(relationships) {
    relationships.addToCorrelationBetweenHashtags("a", "b", function(data) {
        console.log("Added rel " + data);
        relationships.addToCorrelationBetweenHashtags("b","c", function(data1) {
            console.log("Added rel" + data1);
            relationships.addToCorrelationBetweenHashtags("d", "e", function(data3) {
                console.log("Added rel " + data3);
                relationships.addToCorrelationBetweenHashtags("c", "e", function(data3) {
                    console.log("Added rel" + data3);
                    relationships.addToCorrelationBetweenHashtags("Csharp", "scala", function(data4){
                        console.log("Added rel2");
                        relationships.addToCorrelationBetweenHashtags("e", "zzz");
                    });
                });

            })
        });
    })
}

function test(relationships, id) {
    models.User.save({identifier: id}, function(err, res){
        if(err) {
            console.log("error");
        }  else {
            var res2 = undefined;
            console.log("created user " + JSON.stringify(res));
            console.log("creating relationship");
            relationships.userFollowHashtag("test15", "scala", function(data) {
                res2 = data;
                console.log("relationship " + JSON.stringify(data));
                /*
                 relationships.userUnfollowHashtag("test12", "scala", function(data1) {
                 console.log("Deletion successful");
                 console.log(data1);
                 }) */

                relationships.userFollowHashtag(id, "haskell", function(res){
                    console.log(res);
                    relationships.getFollowedHashtags(id, function(data1) {
                        console.log(data1)
                    });
                });
            });
        }
    });


}










