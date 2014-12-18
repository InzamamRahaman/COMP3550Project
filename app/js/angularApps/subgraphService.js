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

        hashtagfetch.register_observer(function(data) {
            var names = _.map(data.data, 'map');
            names.forEach(function(name) {
               if(collections[name] === undefined || collections[name] === null) {
                   collections[name] = {
                       graph: {},
                       in_use: false
                   };
               }
            });
        });

        this.register_observer = function(obs) {
            observers.push(obs);
        }

        this.notify_observer = function() {
            observers.forEach(function(observer) {
               observer(collections);
            });
        }

        this.get_subgraph = function(hashtag) {
            var g = collections[hashtag]['graph'];
            if(g === {}) {
                var url = "/api/get/hashtag/subgraph/" + hashtag + "/limit/" + 5;
                $http.get(url).success(function(graph) {
                    collections[hashtag]['graph'] = graph;
                });
            } else {
                var use = collections[hashtag]['in_use'];
                if(use) {
                    collections[hashtag]['in_use'] = false;
                } else {
                    collections[hashtag]['in_use'] = true;
                }
            }
            that.notify_observer();
        };

    }


})();