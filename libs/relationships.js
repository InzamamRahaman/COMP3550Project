/**
 * Created by Inzamam on 11/20/2014.
 */

/*
    "Private" code of this module
 */

function RelationshipManager(db) {

    var config = require("./config");
    var Promise = require("promise");

    var Query = Promise.denodeify(db.query, 3);

    this.getUserNode = function (identifer) {
        var query = "MATCH (n: " + config.user_model_name + ") WHERE n.identifier = " + identifer + " RETURN n";
        Query(query, {}, function(err, model) {
            if(err) {
                return false;
            } else {
                return model;
            }
        });
    }

}


/*
    Contains the functions and variables to expose to other modules
 */

module.exports = {




}