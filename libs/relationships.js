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
            //console.log("using defined fun");
            fn = callback;
        }
        db.query(query, params, fn);
        //return promisifiedQuery(query, params).then(fn).fail(config.error_print("can't get hashtags"));
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
        db.query(query, param, fn);
        //return promisifiedQuery(query, param).then(fn).fail(config.error_print("can't delete following")).done();
    }



    var createOrUpdateHashtag = function (hashtag, callback, initial_count) {
        //console.log("creating hashtag for " + hashtag);
        var query = [
            //'MERGE (h:Hashtag {name: "' + hashtag + '"})',
            "MERGE (h:Hashtag {name : {hashtag_name}})",
            'ON CREATE SET h.count = {initial}',
            'ON MATCH SET h.count = h.count + 1.0',
            'RETURN h'
        ].join('\n');
        var init = null;
        if(initial_count) {
            init = initial_count
        } else {
            init = 1.0;
        }
        var param = {
            hashtag_name: hashtag,
            initial: init
        }
        db.query(query, param, callback);
        //promisifiedQuery(query, {}).then(callback).fail(config.error_print("Error creating or updating tag")).done();
    }


    this.getHashtagCounts = function(hashtags, callback) {
        var query = [
            'MATCH (h:Hashtag)',
            'WHERE h.name IN {names}',
            'RETURN {name: h.name, size: h.count};'
        ].join('\n');

        var param = {
            names: hashtags
        };

        db.query(query, param, callback);
    }

    this.getImmediateSubgraph = function(hashtag, limit, callback) {
        var query_param = {
            h_name : hashtag,
            limit: Number(limit),
        };

        var query = [
            'MATCH (h1:Hashtag {name : {h_name}})-[rel:CORRELATED_WITH]->(h2:Hashtag)',
            'WITH h1, rel, h2, (100 - (100 * rel.times)/(h1.count + h2.count - rel.times)) AS distance',
            'RETURN {start: {h_name}, end: h2.name, cost: distance}',
            'ORDER BY distance',
            'LIMIT {limit}'
        ].join("\n");

        db.query(query, query_param, callback);
    }


    this.addToCorrelationBetweenHashtags = function (hashtag1, hashtag2, callback) {
        //console.log("Correlating " + hashtag1 + " and " + hashtag2);
        createOrUpdateHashtag(hashtag1, function (err, data) {
            if (err) {
                console.log("Hashtag " + hashtag1 + " was not created");
                console.log(new Error(err));
            } else {
                //console.log("Hashtag " + hashtag1 + " was created");
                //console.log("created for 1: " + JSON.stringify(data));
                createOrUpdateHashtag(hashtag2, function (err1, data1) {
                    if (err1) {
                        console.log(new Error(err1));
                    } else {
                        //console.log("Hashtag for " + hashtag2 + " was created");
                        //console.log("created for 2:" + JSON.stringify(data1));
                        var param = {
                            h1_i : hashtag1,
                            h2_i: hashtag2
                        };

                        // Our query uses the Jaccard index to compute the
                        // relationship between two hashtags

                        var query2 = [
                            'MATCH (h1:Hashtag), (h2:Hashtag)',
                            'WHERE h1.name = {h1} AND h2.name = {h2}',
                            'CREATE UNIQUE (h1)-[rel:CORRELATED_WITH]->(h2)',
                            'SET rel.times = coalesce(rel.times, 0) + 1',
                            'RETURN rel'
                        ].join("\n");

                        var query = [
                            'MATCH (h1:Hashtag), (h2:Hashtag)',
                            "WHERE h1.name = {h1_i} AND h2.name = {h2_i}",
                            'CREATE UNIQUE (h1)-[rel:CORRELATED_WITH]->(h2)',
                            'SET rel.times = coalesce(rel.times, 0) + 1,' +
                            'rel.cost = 100.0 - (100.0 * (rel.times/(h1.count + h2.count)))',
                            'CREATE UNIQUE (h1)<-[rel2:CORRELATED_WITH]-(h2)',
                            'SET rel2.times = coalesce(rel2.times, 0) + 1,' +
                            'rel2.cost = 100.0 - (100.0 * (rel2.times/(h1.count + h2.count)))',
                            'RETURN rel, rel2'
                        ].join('\n');

                        db.query(query, param, callback);
                        /*
                        promisifiedQuery(query, param).then(callback).fail(function(err) {
                            console.log("Error in creating or updating relationship");
                            console.log(new Error(err));
                        }).done(); */
                    }
                });
            }

        });
    }

    this.correlateHashtagList = function (hashtags, callback) {
        var len = hashtags.length;
        for(var idx = 0; idx < len; idx++) {
            for(var jdx = idx + 1; jdx < len; jdx++) {
                this.addToCorrelationBetweenHashtags(hashtags[idx], hashtags[jdx], callback);
            }
        }
    }

    this.getRecommendedUsers = function(identifier, num, callback) {
        var query = [
            'MATCH (u:User)->[rel1:SUBSCRIBES_TO]->(h:Hashtag)<-[rel2:SUBSCRIBES_TO]-(u1:User)',
            'WITH u, u1, h, count(h) as shared, (shared/(u.subscriptions + u1.subscriptions - shared)) as sim',
            'WHERE u.name = {name} AND u1.twitterName is not null',
            'RETURN {rec_name: u1.name, similarity: sim}',
            'ORDER BY sim',
            'LIMIT {limit}'
        ].join('\n');

        var params = {
            name: identifier,
            limit: num
        }

        db.query(query, params, callback);
    }



    // For POST wrt a user following a hashtag
    this.userFollowHashtag = function(user_identifier, hashtag_name, callback) {

        var follow_hashtag = function() {
            var query2 = [
                'MATCH (u:User), (h:Hashtag)',
                'WHERE u.identifier = {u_i} AND h.name = {h_i}',
                'SET u.subscriptions=u.subscriptions + 1',
                'CREATE UNIQUE (u)-[follows:SUBSCRIBES_TO]->(h)',
                'RETURN follows'
            ].join('\n');

            var param = {
                u_i: user_identifier,
                h_i: hashtag_name
            };
            var fn = config.id;
            if(callback) {
                //console.log("using supplied callback");
                fn = callback;
            }
            db.query(query2, param, callback);
        }

        createOrUpdateHashtag(hashtag_name, config.errorify(follow_hashtag), 0);
    }


    /*
        Used to obtained a sub graph of related hashtags, given a hashtag to act
        as the central vertex
     */
    this.getHashtagSubGraph = function(hashtag, callback) {
        var query = [
            'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*1..3]->(h2:Hashtag)',
            'WITH h1, h2,rel,p, reduce(total = 0, r in rel | total + r.cost) AS len',
            'WHERE len < {max_cost} AND h1.name <> h2.name AND h1.name = "{name}"',
            'RETURN extract(r in rel|{start: startNode(r).name, cost: r.cost, end: endNode(r).name});'
        ].join("\n");
        var params = {
            name: hashtag,
            max_cost: 75
        };
        db.query(query, params, callback);
    }


}


/*
    Contains the functions and variables to expose to other modules
 */

module.exports = {

    RelationshipManager: RelationshipManager


}




// Queries used for testing

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


/*
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

 return promisifiedQuery(query, param).then(fn).
 fail(config.error_print("error subscribing user to hashtag")).done();


 this.getCorrelatedHashtags = function (hashtag1, callback) {

 /*
 MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*]->(h2:Hashtag)
 WITH h1, p, REDUCE(total = 0, r IN relationships(p) |  total + r.cost) AS total_cost
 WHERE h1.name = "e" AND total_cost < 60
 RETURN nodes(p), relationships(p);
 */
/*
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
 */