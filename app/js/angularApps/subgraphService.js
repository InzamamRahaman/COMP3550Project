/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').service('subgraphService', subgraphService);

    subgraphService.$inject = ['$http', 'hashtagfetch'];

    function subgraphService($http, hashtagfetch) {

        var that = this;
        var observers = [];
        var collections = {};

        this.register_connection = function() {
            console.log('Registered connection');
            hashtagfetch.register_observer(function(data) {
                console.log('Adding ' + JSON.stringify(data.data));
                var names = _.map(data.data, 'name');
                names.forEach(function(name) {
                    console.log("Considering " + name);
                    if(collections[name] === undefined || collections[name] === null) {
                        collections[name] = {
                            graph: {},
                            in_use: false,
                            cached: false
                        };
                    }
                });
                console.log("Collections ");
                console.log(collections);
            });
        }

        this.register_observer = function(obs) {

            console.log('obsercer registered');
            console.log(obs);
            observers.push(obs);
        }

        this.notify_observer = function() {
            observers.forEach(function(observer) {

                console.log('notifying ');
               observer(collections);
            });
        }

        this.get_subgraph = function(hashtag) {
            var g = collections[hashtag]['cached'];
            if(g === false) {
                var url = "/api/get/hashtag/subgraph/" + hashtag + "/limit/" + 5;
                $http.get(url).success(function(graph) {
                    collections[hashtag]['graph'] = graph;
                    collections[hashtag]['in_use'] = true;
                    collections[hashtag]['cached'] = true;
                    that.notify_observer();
                });
            } else {
                var use = collections[hashtag]['in_use'];
                if(use) {
                    collections[hashtag]['in_use'] = false;
                } else {
                    collections[hashtag]['in_use'] = true;
                }
                that.notify_observer();
            }
            console.log(collections);

        };

    }


})();