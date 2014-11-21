/**
 * Created by Inzamam on 11/20/2014.
 */


function get_user_id(db, identifier, callback) {
    var cypher = "MATCH (n: " + config.user_model_name + ") WHERE n.identifier=" + identifier + " RETURN n.id";
    db.query(cypher, {}, callback);
}

function get_hashtag_id(db, name, callback) {
    var cypher = "MATCH (n: " + config.hashtag_model_name + ") WHERE n.name=" + name + " RETURN n.id";
    db.query(cypher, {}, callback);
}


module.Relationships = function(db) {

    


}


