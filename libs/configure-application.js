/**
 * Created by Inzamam on 12/14/2014.
 */

module.exports = {
    configureApplication: function(app, express, Models) {


        // Imports

        var bodyParser = require("body-parser");
        var cookieParser = require("cookie-parser");
        var session = require("express-session");
        var passportSetup = require("./passport-setup");


        app.use(express.static(__dirname + '/app'));
        app.use(cookieParser());
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json());
        app.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true
        }));

        passportSetup.setUpPassport(app, Models);

    }
}