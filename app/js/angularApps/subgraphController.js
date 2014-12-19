/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').controller('subgraphController', subgraphController);

    subgraphController.$inject = ['$scope', 'subgraphService', 'socketService'];

    function subgraphController($scope, subgraphService, socketService) {

        $scope.data = null;


        subgraphService.register_observer(function(data) {
            console.log(data);
            $scope.data = data;
            $scope.plot_graph();
        });

        $scope.plot_graph = function() {
            console.log("Data to plot");
            console.log($scope.data);
            console.log('Plotting graph');
            var graphs_to_plot = _.filter($scope.data, function(obj) {
                return obj.cached && obj.in_use;
            });
            var graphs = _.map(graphs_to_plot, 'graph');
            var usable_data = _.map(graphs, 'data');
            console.log("Plotting graph for");
            console.log(usable_data);


        }

    }

})();