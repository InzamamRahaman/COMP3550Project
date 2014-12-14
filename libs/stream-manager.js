/**
 * Created by Inzamam on 12/14/2014.
 */

function StreamManager(io, relationships, stream) {

    var buckets = require("./buckets");
    var config = require("./config");
    var rooms = new buckets.Dictionary();


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
            console.log(h);
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