/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module('app').controller('hashtagButtonController', hashtagButtonController);

    hashtagButtonController.$inject = ['$scope', 'hashtagfetch'];

    function hashtagButtonController($scope, hashtagfetch) {

        var that = this;

        $scope.hashtags = [];
        $scope.groups = [];
        hashtagfetch.register_observer(function(data){
            $scope.hashtags = data;
            split_hashtags_into_groups(data);
        });

        hashtagfetch.fetchHashtags();

        $scope.handle_click = function(hashtag) {
            var clss = hashtag.clss;
            if(clss === undefined || clss === ""){
                hashtag.clss = "alert";
            } else {
                hashtag.clss = "";
            }
        }

        $scope.get_class = function(hashtag) {
            return hashtag.clss
        }

        function split_hashtags_into_groups(hashtags) {
            var names = _.map(hashtags.data, 'name');
            console.log(names);
            var len = names.length;
            var max_cols = 5;
            for(var idx = 0; idx < len; idx += max_cols) {
                var temp = [];
                for(var jdx = idx; jdx < (idx + max_cols) && jdx < len; jdx++){
                    var obj = {
                        name: names[jdx],
                        id: '#' + names[jdx],
                        clss: ""
                    };
                    temp.push(obj);
                }
                $scope.groups.push(temp);
            }
            console.log("Groups ");
            console.log($scope.groups);
        }



    }

})();