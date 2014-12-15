/**
 * Created by Inzamam on 12/14/2014.
 */

module.exports = {


    setUpPassport: function(app, Models) {


        var passport = require("passport");
        var LocalStrategy = require("passport-local").Strategy;

        var passport_config = {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        };

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(
            function (username, password, done) {
                Models.authenticateLocalUser(username, password, done);
            }
        ));


        passport.serializeUser(function(u, done) {
            done(null, user);
        });
        passport.deserializeUser(function(obj, done) {
            console.log("deserializing " + obj);
            done(null, obj);
        });


        app.post('/login', passport.authenticate('local', passport_config));




    }


}