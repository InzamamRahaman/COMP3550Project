/**
 * Created by Inzamam on 11/20/2014.
 */

var config = require("./config");
var q = require("q");

function Models(db){

    var that = this;
    var seraph_model = require("seraph-model");
    // Set up the models to access the nodes in the database
    this.User = that.seraph_model(db, config.user_model_name);
    this.User.schema = {
        // a unique string to identifier a user
        // it can be an email, username, ext....
        identifier: {type : String, required: true},
        password: {type: String},
        salt: {type: String}

    }

    this.findUser = q.nbind(that.User.where, that.User);
    this.createUser = q.nbind(that.User.save, that.User);

    this.Hashtag = that.seraph_model(db, config.hashtag_model_name);
    this.Hashtag.schema = {
        name: {type : String, required: true}
    }

    this.findHashtag = q.nbind(that.Hashtag.where, that.Hashtag);
    this.createHashtag = q.nbind(that.Hashtag.save, that.Hashtag);

    // Set up indexes on the database
    db.index.createIfNone('User', 'identifier', function(err, index) {
        if(err) {
            console.log("Error in creating index");
        } else {
            console.log(index);
        }
    });

    db.index.createIfNone('Hashtag', 'name', function(err, index) {
        if(err) {
            console.log("Error in creating index");
        } else {
            console.log(index);
        }
    })


}

module.exports = {
    Models: Models
}