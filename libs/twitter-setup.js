/**
 * Created by Inzamam on 12/14/2014.
 */


module.exports = {

    setUpTwitter: function(http, relationships, store, stream_to_users) {

        var config = require("./config");
        var io  = require('socket.io')(http);
        var Twitter = require('twit');
        var twitConfig  = config.twitConfig;
        var twitter = new Twitter(twitConfig);

        var stream = twitter.stream('statuses/sample', {language: 'en'});
        var streamManager = require("./stream-manager").createStreamManager(io, relationships, stream);
        streamManager.handle_streaming();
        streamManager.read_twitter_stream(store, stream_to_users);

    }

}