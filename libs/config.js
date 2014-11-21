/**
 * Created by Inzamam on 11/20/2014.
 * This node module is to be used to set up the server
 */

// "private" variables
var port = 3000;
var directory_name = __dirname + "/app"; // Use POSIX
var bodyParser = require("body-parser");
var express = require("express");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
var TwitterStrategy = require("passport-twitter");
var GoogleStrategy = require("passport-google");
var LocalStrategy = require("passport-local");
var session = require("express-session");
var session_secret = 'sadf3234';
var session_obj = session({
    secret :  session_secret,
    saveUninitialized: true,
    resave: true
});

/*
 * This is what is exposed to the consuming
 * code
 */
module.exports = {

    file_loc : directory_name,
    port : port,
    init_server : function(app) {
        app.use(express.static(directory_name));
        app.use(bodyParser.urlencoded({
            extended : false
        }));
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(session_obj);
        return app;
    },
    db_conn_string: "http://localhost:7474",
    user_model_name: 'User',
    hashtag_model_name: 'Hashtag',
    hashtag_to_hashtag_rel_name: 'CORRELATED_WITH',
    user_to_hashtag_rel_name: 'SUBSCRIBES_TO'


};



