/**
 * Created by Inzamam on 11/20/2014.
 */
var express = require("express");
var config = require("./libs/config");
var app = config.init_server(express());
var db = require("seraph")(config.db_conn_string);
var lodash = require("lodash");
var buckets = require("./libs/buckets.js");
var Models = require("./libs/models").Models;
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
console.log(Models);
var models = new Models(db); // Use this to manipulate models
var RelationshipManager = require("./libs/relationships").RelationshipManager;
var relationships = new RelationshipManager(db);
models.setUpDB(function() {
    // Set up passport here
    var passport_config = {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    };
    passport.use(new LocalStrategy(
        function (username, password, done) {
            Models.authenticateLocalUser(username, password, done);
        }
    ));
    console.log("set up database, setting up api's");
    app.post('/login', passport.authenticate('local', passport_config));
    //test3(relationships);
});

var API = require("./libs/API").apiManager;
var api = new API(app);
var http    = require('http').Server(app);
var io  = require('socket.io')(http);
var Twitter = require('twit');
var twitConfig  = config.twitConfig;
var twitter = new Twitter(twitConfig);
var words={},users={};

var stream = twitter.stream('statuses/sample', {language: 'en'});
console.log("Reading stream");
read_twitter_stream(stream, relationships);
app.use(express.static(__dirname + '/app'));
http.listen(config.port, function(){
    console.log("Listening on http://127.0.0.1:"+config.port);
});

function read_twitter_stream(stream, relationships) {
    stream.on('tweet', function(tweet_received) {
        var hashtags = get_hashtags(tweet_received);
        store_hashtags(hashtags, relationships);
        sendToUsers(hashtags,tweet_received);
        console.log("Added hashtags  " +  JSON.stringify(hashtags));
    });

    stream.on("error", function(err) {
        console.log("Error");
        console.log(new Error(err));
    });
}
function sendToUsers(tags,tweet){
    tags.forEach(function(curr){
        for(var subscriber in words[curr]){//check the word to see if it had subscribers
            if(subscriber===null)
                return;
            var list = words[curr];
            console.log("subscriber "+list[subscriber].email);
            if(list[subscriber].lastTweet!=tweet.id){
                list[subscriber].lastTweet=tweet.id;
                console.log("emitting :"+tweet.text);
                list[subscriber].socket.emit('new tweet',{'text':tweet.text});
            }
        }
    });
}
function get_hashtags(tweet) {
    var texts = new buckets.Set();
    var raw_tags = tweet.entities.hashtags.map(function(h) {
        return h.text.trim().toLowerCase();
    });
    raw_tags.forEach(function(tag) {
        texts.add(tag);
    });
    return texts.toArray();
}

function store_hashtags(hashtags, relationships) {
    relationships.correlateHashtagList(hashtags, config.errorify(function(res) {
        console.log(res);
    }));
}

function get_user_identifier(data) {
    return data.email;
}


io.on('connection', function(socket){
    console.log("user connected");
    socket.on('register',function(data){
        var email=data.email;
        users[email]={'email':email,'socket':socket};
        data.tags.forEach(function(tag){
            console.log(tag.toLowerCase());
            var list=words[tag.toLowerCase()];
            if(typeof(list)==="undefined")//if this word has never been added then welp
                list={};
            list[email]=users[email];// ! change to check then push
            words[tag.toLowerCase()]=list;//in case it was previously undefined
        });
        console.log("registered");
    });

    socket.on('disconnect',function(){

    });
});




function push_tweet_to_users(tweet) {
    var hashtags = get_hashtags(tweet);

}





/*
function startStreaming(stream){
    stream.on('tweet', function(tweet){
        //When Stream is received from twitter
        console.log("Tweet received: ");
        console.log(tweet);
        var tweets=tweet.entities.hashtags;
        console.log(tweets);
            if(tweets!=null && tweets.length != 0){
                var hashtags = [];
                tweets.forEach(function(curr){
                    hashtags.push(curr.text);//array of hashtags for database
                    //for the blink feed
                    for(var subscribers in words[curr.text]){//check the word to see if it had subscribers
                        console.log("subscribers"+subscribers);
                        if(subscribers !== null) {

                            subscribers.forEach(function(usrObj){
                                if(this.hasOwnProperty(userObj) && usrObj.lastTweet!=tweet.id){
                                    usrObj.lastTweet=tweet.id;
                                    usrObj.socket.emit('new tweet',{'text':tweet.text});
                                }
                            });
                        }
                    }
                });
                var dbObj={"id":tweet.id,"tags":hashtags,"text":tweet.text}
                //console.log(dbObj);
            }
    });
}


*/


function test3(relationships) {

    console.log("querying for relationship web");
    var query = [
        'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*1..3]->(h2:Hashtag)',
        'WITH h1, h2,rel,p, reduce(total = 0, r in rel | total + r.cost) AS len',
        'WHERE len < 1000 AND h1.name <> h2.name AND h1.name = "e"',
        'RETURN extract(r in rel|{start: startNode(r).name, cost: r.cost, end: endNode(r).name});'
    ].join("\n");
    console.log("Performing query for graph");
    db.query(query, {}, function(err, res) {
        if(err) {
            console.log(new Error(err));
        } else {
            console.log("Showing data from query");
            var s = new buckets.Set(function(obj) {
                var str = "start:" + obj.start;
                str = str + ",end:" + obj.end;
                str = str + ",cost:" + obj.cost;
                return str;
            });
            console.log(lodash.flatten(res));
            lodash.flatten(res).forEach(function(r) {
                s.add(r);
            });
            console.log(s.toArray());

        }
    });

}

function test2(relationships) {
    db.index.list('Hashtag', function(err, res) {
        console.log("Indicies on Hashtag " + JSON.stringify(res) );
    });
    relationships.addToCorrelationBetweenHashtags("a", "b", function(data) {
        console.log("Added rel " + data);
        relationships.addToCorrelationBetweenHashtags("b","c", function(data1) {
            console.log("Added rel" + data1);
            relationships.addToCorrelationBetweenHashtags("d", "e", function(data3) {
                console.log("Added rel " + data3);
                relationships.addToCorrelationBetweenHashtags("c", "e", function(data3) {
                    console.log("Added rel" + data3);
                    relationships.addToCorrelationBetweenHashtags("Csharp", "scala", function(data4){
                        console.log("Added rel2");
                        relationships.addToCorrelationBetweenHashtags("e", "zzz", function(d) {
                            console.log(d);

                        });
                    });
                });

            })
        });
    })
}

function test(relationships, id) {
    models.User.save({identifier: id}, function(err, res){
        if(err) {
            console.log("error");
        }  else {
            var res2 = undefined;
            console.log("created user " + JSON.stringify(res));
            console.log("creating relationship");
            relationships.userFollowHashtag("test15", "scala", function(data) {
                res2 = data;
                console.log("relationship " + JSON.stringify(data));
                relationships.userFollowHashtag(id, "haskell", function(res){
                    console.log(res);
                    relationships.getFollowedHashtags(id, function(data1) {
                        console.log(data1);
                        db.query(
                        'MATCH p = (h1:Hashtag)-[rel:CORRELATED_WITH*1..3]->(h2:Hashtag)' +
                        'WITH h1, h2,rel,p, reduce(total = 0, r in rel | total + r.cost) AS len' +
                        'WHERE len < 1000 AND h1.name <> h2.name AND h1.name = "c"' +
                        'RETURN p',{}, function(err, res) {
                                if(err){
                                    console.log("error ");
                                } else {
                                    console.log(res);
                                }
                            }
                        );
                    });
                });
            });
        }
    });


}









/*
 db.query('MATCH (pp:Person) WHERE pp.name = "Jane" RETURN pp', {}, function(err, res) {
 if(err) {
 console.log("Error querying for Jane")
 } else {
 console.log(res);
 }
 }); */
