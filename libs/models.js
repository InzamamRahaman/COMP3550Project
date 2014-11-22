/**
 * Created by Inzamam on 11/20/2014.
 */

var config = require("./config");
var q = require("q");
var crpyto = require("crypto");
var bcrytp = require("bcryptjs");

function Models(db){

    var that = this;
    var seraph_model = require("seraph-model");
    // Set up the models to access the nodes in the database
    this.User = seraph_model(db, config.user_model_name);
    this.User.schema = {
        // a unique string to identifier a user
        // it can be an email, username, ext....
        identifier: {type : String, required: true},
        password: {type: String},
        salt: {type: String},
        follows: {type: Number}
    }



    // Code to prepare the user
    var prepareUser = function(object, callback) {
        object.follows = 0;
        object.salt = bcrytp.genSaltSync(10);
        object.password = bcrytp.hashSync(object.password, object.salt);
        callback(null, object);
    }

    this.User.on('prepare', prepareUser);

    /*
    this.findUser = q.nbind(that.User.where, that.User);
    this.createUser = q.nbind(that.User.save, that.User);

    this.Hashtag = that.seraph_model(db, config.hashtag_model_name);
    this.Hashtag.schema = {
        name: {type : String, required: true}
    } */

    //this.findHashtag = q.nbind(that.Hashtag.where, that.Hashtag);
    //this.createHashtag = q.nbind(that.Hashtag.save, that.Hashtag);

    // Set up indexes on the database
    this.setUpDB = function(callback) {
        db.index.createIfNone('User', 'identifier', function(err, index) {
            if(err) {
                console.log("Error in creating index");
            } else {
                console.log("index on User created");
                console.log(index);
                db.index.createIfNone('Hashtag', 'name', function(err, index) {
                    if(err) {
                        console.log("Error in creating index");
                    } else {
                        console.log("Index on hashtag created");
                        console.log(index);
                        // Set up constraints to ensure uniqueness
                        db.constraints.uniqueness.createIfNone('User', 'identifier', function(err, constraint) {
                            if(err) {
                                console.log("Error creating constraint on User");
                            } else {
                                console.log("Constraint on User added");
                                console.log(constraint);
                                db.constraints.uniqueness.createIfNone('Hashtag', 'name', function(err, constraint) {
                                    if(err) {
                                        console.log("Error on creating constraint on Hashtag");
                                    } else {
                                        console.log("Constraint on Hashtag added");
                                        console.log(constraint);
                                        console.log("Finised set up db indicies and constraints");
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });

            }
        });







    }

}

module.exports = {
    Models: Models
}