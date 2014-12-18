/**
 * Created by Inzamam on 12/14/2014.
 */

function StreamManager(io, relationships, stream) {

    var buckets = require("./buckets");
    var config = require("./config");
    var rooms = new buckets.Dictionary();
    var Twit = require("twit");
    var twitter = new Twit(config.twitConfig);
    var xregexp = require("xregexp").XRegExp;
    var lodash = require("lodash");

    //console.log(twitter);



    function extract_text_from_status(twitter_data) {

        //console.log(twitter_data);
        //console.log(typeof(twitter_data));
        var statuses = twitter_data.statuses;
        //console.log(statuses);
        //console.log("statuses " + JSON.stringify(statuses));
        var texts = [];
        statuses.forEach(function(status) {
            texts.push(status["text"]);
            //console.log(status["text"]);
            //console.log(status["text"]);
        });
        //console.log(texts);
        return texts;
    }

    function get_all_matches(target_string) {
        //var regex = /#(\S+)/;
        //var matches =target_string.match(regex);
        //console.log(matches);
        //return matches;
        var matches = [];
        var found = undefined;
        var regex = /#([A-Z0-9]+)/i;
        var strings = target_string.split(" ")
        var len = strings.length;
        for(var idx = 0; idx < len; idx++) {
            if(!strings[idx].search(regex)) {
                matches.push(standardize_hashtag(strings[idx].substring(1)));
            }
        }
        return matches;
    }

    //twitter.get('search/tweets', {q: '#haskell', count: 10}, function(err, data, response) {
    //    var d = extract_text_from_status(data);
    //    var hashtags = lodash.flatten(d.map(function(status) {return get_all_matches(status)}));
    //    console.log("All hashtags");
    //    console.log(hashtags);
    //});

    this.search_for_tweets_with_hashtag = function(hashtag, num, callback) {
        var query = '#' + hashtag;
        twitter.get('search/tweets', {q: query, count: num}, function(err, data, resp) {
           if(err) {
               console.log(new Error(err));
           } else {
               var statuses = data.statuses;
               callback(statuses);
           }
        });
    }

    this.get_concomittant_hashtags = function(hashtag, num, callback) {
        var query_hashtag = '#' + hashtag;
        twitter.get("search/tweets" ,{q: query_hashtag, count: num},function(err, data, resp) {
            //console.log("Raw from search");
            //console.log(data);
            //console.log("From search");
            //console.log(data.statuses[0]);
            //console.log("User:");
            //console.log(JSON.stringify(data.statuses[0].user));
            var texts = extract_text_from_status(data);
            var hashtags = texts.map(function(text) {
                return get_all_matches(text);
            });
            hashtags.forEach(function(hashtag_list) {
                relationships.correlateHashtagList(hashtag_list, function(err, data) {
                    if(err) {
                        console.log(new Error(err));
                    } else {
                        callback(data);
                    }
                });
            });
        });
    }

    function standardize_tweets_for_transmission(tweet, fromStream) {

        var user = null;
        var username = null;
        var text = null;
        var userPictureLink = null;
        if(fromStream) {
            text = tweet.text;
            user = tweet.user;
            username = user.screen_name;
            userPictureLink = user.profile_image_url;
        } else { // the tweet was obtained from the search API
            // Assumes that this is a single status
            text = tweet.text;
            user = tweet.user;
            username = user.screen_name;
            userPictureLink = user.profile_image_url;
        }

        return {
            text: text,
            user_obj: user,
            username: username,
            picture: userPictureLink
        };


    }


    var that = this;
    //this.get_concomittant_hashtags('ocaml', 1, function(data) {
    //    //console.log("From search:");
    //    //console.log(data);
    //});
    // Functions that handle the streaming and user connections
    this.handle_streaming = function () {

        io.sockets.on('connection', function (socket) {

            // Code for joining in on hashtags
            socket.on('subscribe', function (data) {
                console.log("Subscribing for " + JSON.stringify(data));
                var tags = data.hashtags[0];
                if(data.hashtags !== undefined && tags !== undefined && tags.length > 0) {
                    var hashtags = tags.map(standardize_hashtag);
                    hashtags.forEach(function (hashtag) {
                        if (rooms.containsKey(hashtag)) {
                            rooms.set(hashtag, rooms.get(hashtag) + 1);
                        } else {
                            rooms.set(hashtag, 1);
                        }
                        socket.join(hashtag);
                        console.log("Searching for " + hashtag);
                        that.search_for_tweets_with_hashtag(hashtag, 5, function(tweets) {
                            //console.log(tweets);
                            tweets.forEach(function(tweet) {
                                var standard = standardize_tweets_for_transmission(tweet);
                                console.log(standard);
                                io.to(hashtag).emit('new tweet', standard );
                            });
                        });
                    });
                }
            });

            // Code for leaving hashtags
            socket.on('unsubscribe', function (data) {
                console.log("Unsubscribing for " + data);

                var tags = data.hashtags[0];
                if(data.hashtags !== undefined && tags !== undefined && tags.length > 0) {
                    var hashtags = tags.map(standardize_hashtag);
                    hashtags.forEach(function (hashtag) {
                        var count = rooms.get(hashtag);
                        if (count == 1) {
                            rooms.remove(hashtag);
                        } else {
                            rooms.set(hashtag, count - 1);
                        }
                        socket.leave(hashtag);

                    });
                }
            });
        });
    }

    this.read_twitter_stream = function (store, send) {
        stream.on('tweet', function (tweet_received) {
            var hashtags = get_hashtags(tweet_received);
            //console.log("From stream:");
            //console.log(tweet_received);
            if (store === true) {
                //console.log("storing relationships");
                store_hashtags(hashtags, relationships);
            }

            if (send === true) {
                //console.log("streaming to clients");
                manage_streaming(hashtags, tweet_received);
                //push_tweet_to_users(tweet_received, words, users)
            }
            //sendToUsers(hashtags,tweet_received);
            //console.log("Added hashtags  " +  JSON.stringify(hashtags));
        });

        stream.on("error", function (err) {
            console.log("Error");
            console.log(new Error(err));
        });
    }


    // Utilitiy functions
    function standardize_hashtag(hashtag) {
        return hashtag.trim().toLowerCase();
    }

    function manage_streaming(hashtags, tweet) {
        hashtags.forEach(function (hashtag) {
            if (rooms.containsKey(hashtag)) {
                io.to(hashtag).emit('new tweet', standardize_tweets_for_transmission(tweet, true));
            }
        });
    }

    function get_hashtags(tweet) {
        var texts = new buckets.Set();
        var raw_tags = tweet.entities.hashtags.map(function (h) {
            //console.log(h);
            return standardize_hashtag(h.text);
        });
        raw_tags.forEach(function (tag) {
            texts.add(tag);
        });
        return texts.toArray();
    }


    function store_hashtags(hashtags, relationships) {
        relationships.correlateHashtagList(hashtags, config.errorify(function (res) {
            //console.log(res);
        }));
    }


}


module.exports = {
    createStreamManager: function(io, relationships, stream) {
        return new StreamManager(io, relationships, stream);
    }
}