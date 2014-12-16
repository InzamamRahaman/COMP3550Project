/**
 * Created by Inzamam on 12/16/2014.
 */
(function() {

    angular.module("app").controller("subscriptionController", subscriptionController);

    // Inject dependencies

    subscriptionController.$inject = ['$scope', 'hashtagfetch'];


    function subscriptionController($scope, hashtagfetch) {

        var that = this;
        console.log('subscriptions controll');

        $scope.hashtags = [];
        $scope.newestSubscription = "";

        hashtagfetch.register_observer(function(data) {
            $scope.hashtags = data.data;
            console.log("Hashtags: ");
            console.log($scope.hashtags);
        });

        hashtagfetch.fetchHashtags();

        $scope.subscribe = function() {
            if($scope.newestSubscription.length > 0) {
                hashtagfetch.subscribe_to_hashtag($scope.newestSubscription);
            }
        }

        $scope.unsubscribe_hashtag = function(hashtag) {
            hashtagfetch.delete_hashtag_subscroption(hashtag);
        }




    }


})();