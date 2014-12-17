/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module("app").controller('tweetController', tweetController);

    tweetController.$inject = ['$scope','hashtagfetch', 'tweetmanagerservice'];

    function tweetController($scope, hashtagfetch, tweetmanagerservice) {

        $scope.tweets = [];

        tweetmanagerservice.register_observer(function(data) {
           $scope.tweets = data;
        });


    }

})();