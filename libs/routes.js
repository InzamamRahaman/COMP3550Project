/**
 * Created by Inzamam on 12/11/2014.
 */


// Sets up the api for the application
module.exports = function(app, relationships, Model) {

    //var config = require("config");
    //var prep_fun = config.create_responder;
    var successful_op = {success: true};
    var failed_op = {success: false};
    var buckets = require("./buckets");

    function checkAuth(req, res, next) {
        var user = req.user;
        if(!user) {
            res.status(401).send("You need to be logged in before using this page");
        } else {
            next();
        }
    }

    function compose_objects(obj1, obj2) {
        var result = {};
        for(var prop in obj1) {
            if(obj1.hasOwnProperty(prop)) {
                result[prop] = obj1[prop];
            }
        }

        for(var prop1 in obj2) {
            if(obj2.hasOwnProperty(prop)) {
                result[prop] = obj2[prop];
            }
        }

        return result;
    }

    app.get('/landing', function(req, res) {
        var user = req.user;
        if(user === {} || user === undefined || user === null) {
            res.redirect("main.html");
        } else {
            res.redirect("/profile");
        }

    });

    app.get('/profile', function(req, res) {
       var user = req.user;
        if(user) {
            res.redirect("profile.html");
        } else {
            res.status(401).send("You need to be logged in to view this page");
        }
    });

    app.get('/logout', function(req, res) {
        //delete req.user;
        req.logout();
        console.log("Log out user");
        res.redirect('/landing');
    });

    app.get("/", function(req, res) {
        var user = req.user;
        if(user === undefined) {
            //res.json("Not logged in");
            res.redirect("/landing");
        } else {
            res.redirect("/profile");
            //
            // res.json("Logged in");
        }
    });

    app.get("/api/get/user/twitter", checkAuth, function(req, res) {

        var user = req.user;
        var identifier = user.identifier;
        Model.getUserInfo(identifier, function(err, result) {
            if(err) {
                console.log(new Error(err));
                res.json(failed_op);
            } else {
                var u = result[0];
                var name = u.twitterName;
                var obj = {success: true, data: {twitterName: name}};
                res.json(obj);
            }
        })

    });

    app.get('/api/get/hashtag/subgraph/:hashtag/limit/:limit', function(req, res) {
        console.log("Facilitating subgraph extraction");
        var hashtag = req.params.hashtag.trim().toLowerCase();
        var limit = req.params.limit;
        relationships.getImmediateSubgraph(hashtag, limit, function(err1, data) {
               if(err1) {
                   console.log(new Error(err));
                   res.json({success: false});
               } else {
                   var set_of_edges = new buckets.Set(function(obj) {
                       return "start:" + obj.start + ", end:" + obj.end + " ,cost:" + obj.cost;
                   });
                   data.forEach(function(edge) {
                       set_of_edges.add(edge);
                   });
                   var edges = set_of_edges.toArray();
                   var obj_for_user = {
                       edges: edges
                   };
                   var verticies = new buckets.Set();
                   edges.forEach(function(edge) {
                       verticies.add(edge.start);
                       verticies.add(edge.end);
                   });
                   //obj_for_user.verticies = verticies.toArray();
                   //res.json(obj_for_user);
                   relationships.getHashtagCounts(verticies.toArray(), function(err1, data1) {
                       if(err1) {
                           console.log(new Error(err1));
                       } else {
                           obj_for_user.verticies = data1;
                           //obj_for_user.success = true;
                           var obj = {success: true};
                           obj.data = obj_for_user;
                           res.json(obj);
                       }
                   });
               }
            }
        );
    });

    app.post('/api/create/user', function(req, res) {
        //console.log("Adding new user to database");
        var identifier = req.body.username;
        var password = req.body.password;
        //console.log(req.body);
        //throw "something";
        Model.User.where({identifier: identifier}, function(err, data1) {
            if(err){
                console.log(new Error(err));
                res.status(500).send("Enable to create acccount")
                //res.json(failed_op);
            } else {
                if(data1.length > 0) {
                    res.status(500).send("Email address already in use for an account")
                } else {
                    Model.addUser(identifier, password, "", false, function(err, data2) {
                        if(err) {
                            console.log(new Error(err));
                            res.status(500).send("Enable to create acccount")
                        } else {
                            res.redirect("/landing");
                        }
                    });
                }
            }
        })
    });

    app.put('/api/update/user/password', function(req, res) {
        var identifier = req.user.identifier;
        var newpassword = req.body.password;
        Model.updateUserPassword(identifier, newpassword, function(err, data1) {
            if(err) {
                console.log(new Error(err));
                res.json(failed_op);
            } else {
                res.json(successful_op);
            }
        });
    });

    app.delete('/api/delete/user/subscription/:hashtag', function(req, res) {
        var identifier = req.user.identifier;
        var hashtag = req.params.hashtag;
        Model.userUnfollowHashtag(identifier, hashtag, function(err, data1) {
            if(err) {
                console.log(new Error(err));
                res.json(failed_op);
            } else {
                res.json(successful_op);
            }
        });
    });

    app.get('/api/get/user/subscriptions', function(req, res) {

        var user = req.user;
        var identifier = user.identifier;
        relationships.getFollowedHashtags(identifier, function(err, data) {
            if(err) {
                res.json(failed_op);
            } else {
                var obj = {success: true};
                obj.data = data;
                res.json(obj);
            }
        })
    });

    app.put('/api/update/user/subscription/:hashtag', function(req, res) {

        var user = req.user;
        var identifier = user.identifier;
        var hashtag = req.params.hashtag;
        relationships.userFollowHashtag(identifier, hashtag, function(err, data) {
            if(err) {
                console.log(new Error(err));
                res.json(failed_op);
            } else {
                res.json(successful_op);
            }
        });
    });

    app.put('/api/update/user/twittername/:twittername', function(req, res) {
        var identifier = req.user.identifier;
        var twitter = req.params.twittername;
        Model.setUserTwitterName(identifier, twitter, function(err, data) {
            if(err) {
                console.log(new Error(err));
                res.json(failed_op);
            } else {
                res.json(successful_op);
            }
        })
    });

    app.get('/api/get/user/recommendations/limit/:limit', function(req, res) {
        var ident = req.user.identifier;
        var limit = parseInt(req.params.limit);
        relationships.getRecommendedUsers(ident, limit, function(err, data) {
            if(err) {
                console.log(new Error(err));
                res.json({success: false});
            } else {
                res.json({
                    success: true,
                    data: data
                });
            }
        })
    });


    app.get('/api/get/user/identifier/unique/:identifier', function(req, res) {
        var ident = req.params.identifier;
        var ifInUse = function() {
            res.json(failed_op);
        }

        var ifNotInUse = function() {
            res.json(successful_op);
        }
        Model.userIdentifierInUse(ident, ifInUse, ifNotInUse);
    });


}