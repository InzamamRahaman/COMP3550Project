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
        follows: {type: Number},
        subscriptions: {type : Number},
        twitterName: {type : String},
        linkedToTwitter: {type: Boolean}
    }

    this.userIdentifierInUse = function(identifier, callbackIfTrue, callbackIfFalse) {
        this.User.where({identifier: identifier}, function(err, data) {
            if(err) {
                console.log(new Error(err));
                callbackIfTrue();
            } else {
                callbackIfFalse();
            }
        });
    }

    this.Hashtag = seraph_model(db, config.hashtag_model_name);
    this.Hashtag.schema = {
        name: {type: String, required: true},
        count: {type: Number, required: false}
    }

    this.getUserInfo = function(identifier, callback) {
        this.User.where({identifier: identifier}, callback);
    }

    this.addUser = function(username, password, twitterName, linkedToTwitter, callback) {
        var obj = {
            identifier: username,
            password: password,
            twitterName: twitterName,
            linkedToTwitter: linkedToTwitter
        };
        this.User.save(obj, callback);
    }

    this.setUserTwitterName = function(identifier, twitterName, callback) {
        var query = [
            'MATCH (u:User {identifier: {ident}})',
            'SET u.twitterName = {twitter}',
            'RETURN u'
        ].join("\n");

        var param = {
            ident: identifier,
            twitter: twitterName
        }

        db.query(query, param, callback);
    }

    this.updateUserPassword = function(identifier, password, callback) {
        var newsalt = bcrytp.getSaltSynch(10);
        var newhash = bcrytp.saltSynch(password, newsalt)
        var query = [
            'MATCH (u:User {identifier: {ident}})',
            'SET u.salt = {salt}, u.password = {hash}',
            'RETURN u'
        ].join("\n");
        var param = {
            ident: identifier,
            salt: newsalt,
            hash: newhash
        };
        db.query(query, param, callback);
    }



    this.authenticateLocalUser = function(identifier, password, callback) {
        this.User.where({identifier: identifier}, {}, function(err, user) {
            if(err) {
                console.log(new Error(err));
                callback(null, false, {message: "Database error! Contact webmaster"});
            } else if (user.length > 0){
                var u = user[0];
                var hash_to_check = bcrytp.hashSync(password, u.salt);
                if (hash_to_check !== u.password) {
                    callback(null, false, {message: "Incorrect password"});
                } else {
                    callback(null, u);
                }
            } else {
                callback(null,  false, {message: "Username not found"});
            }
        });
    }

    // Code to prepare hashtags
    var prepareHashtag = function(object, callback) {
        object.count = 0;
        callback(null, object);
    }

    // Code to prepare the user
    var prepareUser = function(object, callback) {
        object.follows = 0;
        object.subscriptions = 0;
        if(object.password) {
            object.salt = bcrytp.genSaltSync(10);
            object.password = bcrytp.hashSync(object.password, object.salt);
        }
        callback(null, object);
    }

    this.User.on('prepare', prepareUser);
    this.Hashtag.on('prepare', prepareHashtag);
    //this.User.setUniqueKey("identifier", true);
    //this.Hashtag.setUniqueKey("name", true);

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
        /*
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
                                        db.constraints.uniqueness.list('User', 'identifier', function(err, cos) {
                                            console.log("u:" + cos);
                                            db.constraints.uniqueness.list('Hashtag', 'name', function(err, cs) {
                                                console.log("h:" + cs);
                                            });
                                        });
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });

            }
        });






    */
        callback();
    }

}

module.exports = {
    Models: Models
}