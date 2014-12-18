/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module("app").controller('tweetController', tweetController);

    tweetController.$inject = ['$scope','hashtagfetch'];

    function tweetController($scope, hashtagfetch) {

        $scope.tweets = [
            {username:'John',
                text: 'hhsidhsid'
            }
        ];




    }

})();