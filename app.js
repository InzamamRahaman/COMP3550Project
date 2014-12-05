/**
 * Created by Inzamam on 11/20/2014.
 */
var express = require("express");
var config = require("./libs/config");
var app = config.init_server(express());
var db = require("seraph")(config.db_conn_string);
var lodash = require("lodash");
var buckets = require("./libs/buckets.js");
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
    test3(relationships);
app.use(express.static(__dirname + '/app'));
// Code to test creation, deletion, ect...


});

function test3(relationships) {

    console.log("querying for relationship web");
    var query = [
        'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*1..3]->(h2:Hashtag)',
        'WITH h1, h2,rel,p, reduce(total = 0, r in rel | total + r.cost) AS len',
        'WHERE len < 1000 AND h1.name <> h2.name AND h1.name = "e"',
        'RETURN extract(r in rel|{start: startNode(r).name, cost: r.cost, end: endNode(r).name});'
    ].join("\n");
    console.log("Performing query for graph");
    db.query(query, {}, function(err, res) {
        if(err) {
            console.log(new Error(err));
        } else {
            console.log("Showing data from query");
            var s = new buckets.Set(function(obj) {
                var str = "start:" + obj.start;
                str = str + ",end:" + obj.end;
                str = str + ",cost:" + obj.cost;
                return str;
            });
            console.log(lodash.flatten(res));
            lodash.flatten(res).forEach(function(r) {
                s.add(r);
            });
            console.log(s.toArray());

        }
    });

}

function test2(relationships) {
    db.index.list('Hashtag', function(err, res) {
        console.log("Indicies on Hashtag " + JSON.stringify(res) );
    });
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
                        relationships.addToCorrelationBetweenHashtags("e", "zzz", function(d) {
                            console.log(d);

                        });
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
                relationships.userFollowHashtag(id, "haskell", function(res){
                    console.log(res);
                    relationships.getFollowedHashtags(id, function(data1) {
                        console.log(data1);
                        db.query(
                        'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*1..3]->(h2:Hashtag)' +
                        'WITH h1, h2,rel,p, reduce(total = 0, r in rel | total + r.cost) AS len' +
                        'WHERE len < 1000 AND h1.name <> h2.name AND h1.name = "c"' +
                        'RETURN p',{}, function(err, res) {
                                if(err){
                                    console.log("error ");
                                } else {
                                    console.log(res);
                                }
                            }
                        );
                    });
                });
            });
        }
    });


}









/*
 db.query('MATCH (pp:Person) WHERE pp.name = "Jane" RETURN pp', {}, function(err, res) {
 if(err) {
 console.log("Error querying for Jane")
 } else {
 console.log(res);
 }
 }); */
