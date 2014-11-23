/**
 * Created by Inzamam on 11/20/2014.
 */

/*
    "Private" code of this module
 */

function RelationshipManager(db) {

    var config = require("./config");
    var Models = require("./models").Models(db);
    var q = require("q");
    var mutil = require("mutil");

    var promisifiedQuery = function (query, params) {
        var deffered = q.defer();
        db.query(query, params, function (err, res) {
            if (err) {
                console.log("Error in executing query");
                console.log(JSON.stringify(err));
                deffered.reject(new Error(err));
            } else {
                deffered.resolve(res);
            }
        });
        return deffered.promise;
    }

    var that = this;

    var createUserHashtagFollowing = function (node_id, hashtag_id) {
        var deffered = q.defer();
        db.relate(node_id, config.user_to_hashtag_rel_name, hashtag_id, {}, function (err, res) {
            if (err) {
                deffered.reject();
            } else {
                deffered.resolve(res);
            }
        });
    }

    // For GET wrt a user following hastags
    this.getFollowedHashtags = function (user_identifier, callback) {
        var query = [
            'MATCH (n:User)-[rel:SUBSCRIBES_TO]->(h:Hashtag)',
            'WHERE n.identifier = {user_i}',
            'RETURN h'
        ].join('\n');
        var params = {
            user_i: user_identifier
        }
        var fn = config.id;
        if (callback !== undefined) {
            console.log("using defined fun");
            fn = callback;
        }

        return promisifiedQuery(query, params).then(fn).fail(config.error_print("can't get hashtags"));
    }

    // For DELETE wrt a user following a hashtag
    this.userUnfollowHashtag = function (user_identifier, hashtag_name, callback) {
        var query = [
            'MATCH (u:User)-[follows:SUBSCRIBES_TO]-(h:Hashtag)',
            'WHERE u.identifier = {user_i} AND h.name = {hashtag_i}',
            'DELETE follows'
        ].join("\n")
        var param = {
            user_i: user_identifier,
            hashtag_i: hashtag_name
        };
        var fn = config.id;
        if (callback) {
            fn = callback;
        }
        return promisifiedQuery(query, param).then(fn).fail(config.error_print("can't delete following")).done();
    }

    this.getCorrelatedHashtags = function (hashtag1, callback) {

        /*
         MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*]->(h2:Hashtag)
         WITH h1, p, REDUCE(total = 0, r IN relationships(p) |  total + r.cost) AS total_cost
         WHERE h1.name = "e" AND total_cost < 60
         RETURN nodes(p), relationships(p);
         */
        var query = [
            'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*]->(h2:Hashtag)',
            'WITH h1, p, REDUCE(total = 0, r IN relationships(p) | total + r.cost) AS total_cost',
            'WHERE h1.name = "' + hashtag1 + '" AND total_cost < ' + config.corr_check,
            'RETURN nodes(p), relationships(p);'
        ].join('\n');

        var fn = config.id;
        if (callback) {
            fn = callback;
        }

        return promisifiedQuery(query, {}).then(fn).
            fail(config.error_print("erroring getting correlated hashtags")).done();


    }

    var createOrUpdateHashtag = function (hashtag, callback) {
        console.log("creating hashtag for " + hashtag);
        var query = [
            //'MERGE (h:Hashtag {name: "' + hashtag + '"})',
            'MERGE (h:Hashtag {name : {hashtag_name}})',
            'ON CREATE SET h.count = 1.0',
            'ON MATCH SET h.count = h.count + 1.0'
        ].join('\n');
        var param = {
            hashtag_name: hashtag
        }
        db.query(query, param, callback);
        //promisifiedQuery(query, {}).then(callback).fail(config.error_print("Error creating or updating tag")).done();
    }

    this.addToCorrelationBetweenHashtags = function (hashtag1, hashtag2, callback) {

        createOrUpdateHashtag(hashtag1, function (err, data) {
            if (err) {
                console.log("Hashtag " + hashtag1 + " was not created");
                console.log(new Error(err));
            } else {
                console.log("Hashtag " + hashtag1 + " was created");
                console.log("created for " + JSON.stringify(data));
                createOrUpdateHashtag(hashtag2, function (err1, data1) {
                    if (err1) {
                        console.log(new Error(err1));
                    } else {
                        console.log("Hashtag for " + hashtag2 + " was created");
                        console.log("created for " + JSON.stringify(data1));
                        var param = {
                            h1_i : hashtag1,
                            h2_i: hashtag2
                        };

                        var query = [
                            'MATCH (h1:Hashtag), (h2:Hashtag)',
                            'WHERE h1.name = {h1_i} AND h2.name = {h2_i}',
                            'CREATE UNIQUE (h1)-[rel:CORRELATED_WITH]->(h2)',
                            'SET rel.times = coalesce(rel.times, 0) + 1,' +
                            'rel.cost = 100.0 - (100.0 * (rel.times/h1.count))',
                            'CREATE UNIQUE (h1)<-[rel2:CORRELATED_WITH]-(h2)',
                            'SET rel2.times = coalesce(rel2.times, 0) + 1,' +
                            ' rel2.cost = 100.0 - (100.0 * (rel2.times/h2.count))',
                            'RETURN rel, rel2'
                        ].join('\n');

                        promisifiedQuery(query, param).then(callback).fail(function(err) {
                            console.log("Error in creating or updating relationship");
                            console.log(new Error(err));
                        }).done();
                    }
                });
            }

        });
    }

    /*
     'MATCH (h1:Hashtag {name:"' + hashtag1 + '"}), (h2:Hashtag {name:"' + hashtag2 + '"})',
     'CREATE UNIQUE (h1)-[rel:CORRELATED_WITH {times: 0.0, cost: 0.0}]->(h2)',
     'SET rel.times = rel.times + 1.0, rel.cost = 100.0 - (100.0 * (rel.times/h1.count))',
     'CREATE UNIQUE (h2)-[rel2:CORRELATED_WITH {times: 0.0, cost: 0.0}]->(h1)',
     'SET rel2.times = rel2.times + 1.0, rel2.cost = 100.0 - (100.0 * (rel2.times/h2.count))'
     */


    /*
     var query = [
     'MERGE (h1:Hashtag  {name: "' + hashtag1 +'"})',
     'ON CREATE SET h1.count=1.0',
     'ON MATCH SET h1.count = h1.count + 1.0',
     'MERGE (h2:Hashtag  {name: "' + hashtag2 +'"})',
     'ON CREATE SET h2.count=1.0',
     'ON MATCH SET h2.count = h2.count + 1.0',
     'CREATE UNIQUE (h1)-[rel:CORRELATED_WITH {times: 0.0, cost: 0.0}]->(h2)',
     'SET rel.times = rel.times + 1.0, rel.cost = 100.0 - (100.0 * (rel.times/h1.count))',
     'CREATE UNIQUE (h2)-[rel2:CORRELATED_WITH {times: 0.0, cost: 0.0}]->(h1)',
     'SET rel2.times = rel2.times + 1.0, rel2.cost = 100.0 - (100.0 * (rel2.times/h2.count))'
     ].join('\n');
     var fn = config.id;
     if(callback) {
     fn = callback;
     }
     return promisifiedQuery(query, {}).then(fn).
     fail(config.error_print("Error handling hashtag connections")).done(); */



    // For POST wrt a user following a hashtag
    this.userFollowHashtag = function(user_identifier, hashtag_name, callback) {
        var query = [
            "MATCH (u:User)",
            "WHERE u.identifier = {u_i}",
            'SET u.follows = u.follows + 1',
            //'MERGE (h:Hashtag {name: "' + hashtag_name + '", count: 0})',
            'MERGE (h:Hashtag {name: {h_i}, count: 0})',
            'CREATE UNIQUE (u)-[follows:SUBSCRIBES_TO]->(h)',
            "RETURN follows, h"
        ].join("\n")
        //"match (n:User {user_i})-[follows:SUBSCRIBES_TO]->(h:Hashtag {hash_i}) return follows";
        var param = {
            u_i: user_identifier,
            h_i: hashtag_name
        };
        var fn = config.id;
        if(callback) {
            console.log("using supplied callback");
            fn = callback;
        }
        return promisifiedQuery(query, param).then(fn).
            fail(config.error_print("error subscribing user to hashtag")).done();

    }


}


/*
    Contains the functions and variables to expose to other modules
 */

module.exports = {

    RelationshipManager: RelationshipManager


}