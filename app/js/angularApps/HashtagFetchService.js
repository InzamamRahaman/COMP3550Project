/**
 * Created by Inzamam on 12/16/2014.
 */
(function() {

    angular.
        module('app').service('hashtagfetch', hashtagfetch);


    hashtagfetch.$inject = ['$http'];

    function hashtagfetch($http) {

        var hashtags = [];

        var observers = [];

        var that = this;

        this.fetchHashtags = function() {
            var url = "/api/get/user/subscriptions";
            $http.get(url).success(function(data) {
                console.log("Received " + data);
                hashtags = data;
                notify_observers();
            });
        };

        this.delete_hashtag_subscroption = function(hashtag) {
            var url = "/api/delete/user/subscription/" + hashtag;
            $http.delete(url).success(function(data) {
               console.log("On delete " + data);
            });
            that.fetchHashtags();
        };

        this.subscribe_to_hashtag = function(hashtag) {
            var url = "/api/update/user/subscription/" + hashtag;
            $http.put(url).success(function(data) {

                console.log(data);
                that.fetchHashtags();
            });
        };


        this.register_observer = function(obs) {
            observers.push(obs);
        };

        function notify_observers()  {
            observers.forEach(function(callback) {
                console.log(JSON.stringify(hashtags));
                callback(hashtags);
            });
        }


    }

})();