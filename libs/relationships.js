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
        var query = "match (n: {user_node} {user_i})-[:{follows}]->(h:{hashtag_node})" +
                " return h";
        var params = {
            user_node : config.user_model_name,
            user_id : {
                identifier: user_identifier
            },
            hashtag_node: config.hashtag_model_name,
            follows: config.user_to_hashtag_rel_name
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

    // For POST wrt a user following a hashtag
    this.userFollowHashtag = function(user_identifier, hashtag_name, callback) {
        var query = [
            "MATCH (u:User)",
            "WHERE u.identifier = {u_i}",
            'CREATE UNIQUE (u)-[follows:SUBSCRIBES_TO]->(h:Hashtag {name: "' + hashtag_name + '"})',
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