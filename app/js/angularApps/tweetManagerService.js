/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module('app').service('tweetmanagerservice', tweetmanagerservice);

    tweetmanagermervice.$inject = ['$http'];

    function tweetmanagermervice($http) {

        var that = this;

        var current_hashtag = "";

        var current_graph = {};

        var observers = [];


        this.grab_subgraph = function(hashtag, callback) {
            var url = '/api/get/hashtag/subgraph/'+ hashtag + '/limit/10';
            $http.get(url).success(function(data) {
                callback(data);
            });
        }

        this.register_as_subscriber = function(current) {
            that.current_hashtag = current;
            notify_observers(current);
        }

        this.register_observer = function(obs) {
            that.observers.push(obs);
        }

        function notify_observers(current) {
            that.observers.forEach(function(obs) {
               obs(current);
            });
        }

    }

})();