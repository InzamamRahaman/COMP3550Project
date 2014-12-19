/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').controller('subgraphController', subgraphController);

    subgraphController.$inject = ['$scope', 'subgraphService']

    function subgraphController($scope, subgraphService) {

        $scope.data = null;


        subgraphService.register_observer(function(data) {
            console.log(data);
            $scope.data = data;
            $scope.plot_graph();
        });

        $scope.plot_graph = function() {
            console.log('Plotting graph');

        }

    }

})();