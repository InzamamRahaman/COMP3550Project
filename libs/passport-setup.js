/**
 * Created by Inzamam on 12/14/2014.
 */

module.exports = {


    setUpPassport: function(app, Models) {


        var passport = require("passport");
        var LocalStrategy = require("passport-local").Strategy;
        var flash = require("connect-flash");

        var passport_config = {
            successRedirect: '/profile',
            failureRedirect: '/landing',
            failureFlash: true
        };

        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(
            function (username, password, done) {
                Models.authenticateLocalUser(username, password, done);
            }
        ));


        passport.serializeUser(function(user, done) {
            //console.log(user);
            done(null, user);
        });
        passport.deserializeUser(function(obj, done) {
            //console.log("deserializing " + obj);
            done(null, obj);
        });


        app.post('/login', passport.authenticate('local', passport_config));




    }


}