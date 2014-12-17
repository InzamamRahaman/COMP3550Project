/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module("app").controller('tweetController', tweetController);

    tweetController.$inject = ['$scope','hashtagfetch', 'tweetmanager'];

    function tweetController(hashtagfetch, tweetmanager) {

        $scope.tweets = [];

        tweetmanager.register_observer(function(data) {
           $scope.tweets = data;
        });


    }

})();