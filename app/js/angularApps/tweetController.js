/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module("app").controller('tweetController', tweetController);

    tweetController.$inject = ['$scope','hashtagfetch', 'subgraphService'];

    function tweetController($scope, hashtagfetch, subgraphService) {



        $scope.tweets = [
            {username:'John',
                text: 'hhsidhsid'
            }
        ];

        subgraphService.register_observer(function(data) {

            console.log('Tweet controller: ');
            console.log(data);

            // Entering rooms

            var arr = [];

            for(var prop in data) {
                if(data.hasOwnProperty(prop)) {
                    var n = prop;
                    var obj = {name: n};
                    obj.data = data[prop];
                    arr.push(obj);
                }
            }

            console.log(arr);

            var toEnter = [];
            var toLeave = [];
            var arr_len = arr.length;

            for(var idx = 0; idx < arr_len; idx++) {

                console.log(idx);
                console.log(arr[idx]['data']);
                console.log(arr[idx]);
                var in_use = arr[idx]['data']['in_use'];
                var cached = arr[idx]['data']['cached'];
                console.log(arr[idx]['data']);
                console.log(in_use);
                console.log(cached);
                if(in_use == true && cached == true) {
                    toEnter.push(arr[idx]);
                } else if(in_use === false && cached === true){
                    toLeave.push(arr[idx]);
                }

            }


            //var toEnter = _.filter(arr, function(d) {
            //    console.log(d.data.in_use);
            //    console.log(d.data.cached);
            //    return d.data.in_use === true && d.data.cached === true;
            //});
            console.log('Setting up to enter ' + toEnter);
            join_rooms(_.map(toEnter, extract_hashtags));

            // Leaving rooms

            //var toLeave = _.filter(arr, function(d) {
            //    return d.data.in_use === false && d.data.cached === true;
            //});
            console.log('Setting up to leave ' + toLeave);
            leave_rooms(_.map(toLeave, extract_hashtags));

        });

        function extract_hashtags(hashtag_coll) {
            console.log(hashtag_coll);
            var data = hashtag_coll['data'];
            var graph = data['graph'];
            console.log(data['graph']);
            var entries = graph['data'];
            var verticies = entries['verticies'];
            //var graph = hashtag_coll['graph'];
            //console.log(hashtag_coll);
            //console.log(graph);
            //var data = graph.data;
            //var verticies = data.verticies;
            return _.map(verticies, 'name');
        }


        var socket = io.connect();

        function join_rooms(hashtags) {
            console.log('Joining ' + hashtags);
            socket.emit('subscribe', {hashtags: hashtags});
        }

        function leave_rooms(hashtags) {
            console.log('Leaving ' + hashtags);
            socket.emit('unsubscribe', {hashtags: hashtags});
        }

        socket.on('new tweet', function(data) {
            console.log(data);
           $scope.tweets.push(data);
            $scope.$digest();
        });




    }

})();