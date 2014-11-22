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

    var promisifiedQuery = function(query, params) {
        var deffered = q.defer();
        db.query(query, params, function(err, res) {
            if(err) {
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

    var createUserHashtagFollowing = function(node_id, hashtag_id) {
        var deffered = q.defer();
        db.relate(node_id, config.user_to_hashtag_rel_name, hashtag_id, {}, function(err, res) {
            if(err) {
                deffered.reject();
            } else {
                deffered.resolve(res);
            }
        });
    }

    // For GET wrt a user following hastags
    this.getFollowedHashtags = function(user_identifier, callback) {
        var query = [
            'MATCH (n:User)-[rel:SUBSCRIBES_TO]->(h:Hashtag)',
            'WHERE n.identifier = {user_i}',
            'RETURN h,rel'
        ].join('\n');
        var params = {
            user_i : user_identifier
        }
        var fn = config.id;
        if(callback !== undefined) {
            console.log("using defined fun");
            fn = callback;
        }

        return promisifiedQuery(query, params).then(fn).fail(config.error_print("can't get hashtags"));
    }

    // For DELETE wrt a user following a hashtag
    this.userUnfollowHashtag = function(user_identifier, hashtag_name, callback) {
        var query = [
            'MATCH (u:User)-[follows:SUBSCRIBES_TO]-(h:Hashtag)',
            'WHERE u.identifier = {user_i} AND h.name = {hashtag_i}',
            'DELETE follows'
        ].join("\n")
        var param = {
            user_i : user_identifier,
            hashtag_i : hashtag_name
        };
        var fn = config.id;
        if(callback) {
            fn = callback;
        }
        return promisifiedQuery(query, param).then(fn).fail(config.error_print("can't delete following")).done();
    }

    this.getCorrelatedHashtags = function(hashtag1, callback) {

        var query1 = [
            'MATCH (h:Hashtag)-[rel:CORRELATED_WITH]->(h1:Hashtag)',
            'WHERE h.name = "' + hashtag1 + '" AND rel.cost < ' + config.corr_check,
            'RETURN h1'
        ].join('\n');

        promisifiedQuery(query1, {}, function(data){
            var query2 = [
                'MATCH (h:Hashtag)-[rel1:CORRELATED_WITH]-(h1:Hashtag)-[rel2:CORRELATED_WITH]-(h3:Hashtag)'
            ]
        })


    }

    this.addToCorrelationBetweenHashtags = function(hashtag1, hashtag2, callback) {
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
            fail(config.error_print("Error handling hashtag connections")).done();

    }

    // For POST wrt a user following a hashtag
    this.userFollowHashtag = function(user_identifier, hashtag_name, callback) {
        var query = [
            "MATCH (u:User)",
            "WHERE u.identifier = {u_i}",
            'SET u.follows = u.follows + 1',
            'MERGE (h:Hashtag {name: "' + hashtag_name + '", count: 0})',
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