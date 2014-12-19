<<<<<<< HEAD
/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').service('socketService', socketService);

    socketService.$inject = [];

    function socketService(){

        var that = this;
        var tweets = [];
        var observer = [];

        this.register_observer = function(obs) {
            observer.push(obs);
        }

        function notify_observers() {
            observer.forEach(function(observer) {
                observer(tweets);
            });
        }

        var socket = io.connect();


        this.join_rooms = function(hashtags) {
            console.log('Joining ' + hashtags);
            socket.emit('subscribe', {hashtags: hashtags});
        }

        this.join_room = function(hashtag) {
            that.join_rooms([hashtag]);
        }



        this.leave_rooms = function(hashtags) {
            console.log('Leaving ' + hashtags);
            socket.emit('unsubscribe', {hashtags: hashtags});
        }

        this.leave_room = function(hashtag) {
            that.leave_rooms([hashtag]);
        }

        socket.on('new tweet', function(data) {
            console.log(data);
            tweets.push(data);
            notify_observers();
        });

    }

=======
/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').service('socketService', socketService);

    socketService.$inject = [];

    function socketService(){

        var that = this;
        var tweets = [];
        var observer = [];

        this.register_observer = function(obs) {
            observer.push(obs);
        }

        function notify_observers() {
            observer.forEach(function(observer) {
                observer(tweets);
            });
        }

        var socket = io('http://localhost:3000/');
        //var socket = io.connect();


        this.join_rooms = function(hashtags) {
            console.log('Joining ' + hashtags);
            socket.emit('subscribe', {hashtags: hashtags});
        }

        this.join_room = function(hashtag) {
            that.join_rooms([hashtag]);
        }



        this.leave_rooms = function(hashtags) {
            console.log('Leaving ' + hashtags);
            socket.emit('unsubscribe', {hashtags: hashtags});
        }

        this.leave_room = function(hashtag) {
            that.leave_rooms([hashtag]);
        }

        socket.on('new tweet', function(data) {
            console.log(data);
            tweets.push(data);
            notify_observers();
        });

    }

>>>>>>> dcd243a1860eb534fe1706dcbe2474ec42b812b0
})();