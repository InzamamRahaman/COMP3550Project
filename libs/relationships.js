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

    var promisifiedQuery = function(query, params) {
        var defferred = q.defer();
        db.query(query, params, function(err, res) {
            if(err) {
                defferred.reject(new Error(err));
            } else {
                deffered.resolve(res);
            }
        });
        return defferred.promise;
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
    this.getFollowedHashtags = function(user_identifier) {
        var query = "match (n: {user_node} {user_i})-[:{follows}]-(h:{hashtag_node})" +
                " return h";
        var params = {
            user_node : config.user_model_name,
            user_id : {
                identifier: user_identifier
            },
            hashtag_node: config.hashtag_model_name,
            follows: config.user_to_hashtag_rel_name
        }
        promisifiedQuery(query, params).then(config.id).fail(config.error_print("can't get hashtags"));
    }

    // For DELETE wrt a user following a hashtag
    this.userUnfollowHashtag = function(user_identifier, hashtag_name) {
        var query = "match (n:{user_node} {user_i})-[:{follows}]-(h:{hashtag_node} {hash_i}) " +
                " delete follows";
        var param = {
            user_node : config.user_model_name,
            hashtag_node: config.hashtag_model_name,
            follows: config.user_to_hashtag_rel_name,
            user_i: {
                identifier: user_identifier
            },
            hash_i: {
                name: hashtag_name
            }
        };
        promisifiedQuery(query, param).then(config.id).fail(config.error_print("can't delete following"));
    }

    // For POST wrt a user following a hashtag
    this.userFollowHashtag = function(user_identifier, hashtag_name) {
        var query = [
            "MATCH (N: " + config.user_model_name + "{identifier: " + user_identifier  + "})",
            "CREATE UNIQUE (N)-[follows:" + config.user_to_hashtag_rel_name
                + "]-(h:" + config.hashtag_model_name + "{name:" + hashtag_name + "})",
            "RETURN follows"
        ].join("\n");
        promisifiedQuery(query, {}).then(function(res) {
            return res;
        }).fail(function(err) {
            console.log("Failed to create follows relationship!");
            return false;
        });

    }


}


/*
    Contains the functions and variables to expose to other modules
 */

module.exports = {

    RelationshipManager: RelationshipManager


}