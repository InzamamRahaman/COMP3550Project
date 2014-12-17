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

    this.get_concomittant_hashtags = function(hashtag, num, callback) {
        var query_hashtag = '#' + hashtag;
        twitter.get("search/tweets" ,{q: query_hashtag, count: num},function(err, data, resp) {
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

    this.get_concomittant_hashtags('ocaml', 100, function(data) {
        console.log(data);
    });
    // Functions that handle the streaming and user connections
    this.handle_streaming = function () {

        io.sockets.on('connection', function (socket) {

            // Code for joining in on hashtags
            socket.on('subscribe', function (data) {
                var hashtags = data.hashtags.map(standardize_hashtag);
                hashtags.forEach(function (hashtag) {
                    if (rooms.containsKey(hashtag)) {
                        rooms.set(hashtag, rooms.get(hashtag) + 1);
                    } else {
                        rooms.set(hashtag, 1);
                    }
                    socket.join(hashtag);
                });
            });

            // Code for leaving hashtags
            socket.on('unsubscribe', function (data) {
                var hashtags = data.hashtags.map(standardize_hashtag);
                hashtags.forEach(function (hashtag) {
                    var count = rooms.get(hashtag);
                    if (count == 1) {
                        rooms.remove(hashtag);
                    } else {
                        rooms.set(hashtag, count - 1);
                    }
                    socket.leave(hashtag);
                });
            });
        });
    }

    this.read_twitter_stream = function (store, send) {
        stream.on('tweet', function (tweet_received) {
            var hashtags = get_hashtags(tweet_received);
            if (store === true) {
                store_hashtags(hashtags, relationships);
            }

            if (send === true) {
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
                io.to(hashtag).emit('new tweet', {
                    text: tweet
                });
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
            console.log(res);
        }));
    }


}


module.exports = {
    createStreamManager: function(io, relationships, stream) {
        return new StreamManager(io, relationships, stream);
    }
}