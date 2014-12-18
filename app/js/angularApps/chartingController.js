/**
 * Created by Inzamam on 12/17/2014.
 */
(function() {

    angular.module("app").controller('chartingController', chartingController);

    chartingController.$inject = ['$scope', 'hashtagfetch', 'chartingService']

    function chartingController($scope, hashtagfetch, chartingService) {


        $scope.data = [];
        $scope.categories = [];
        $scope.frequencies = [];


        hashtagfetch.register_observer(function(data) {

            $scope.data = data.data;
            $scope.categories = _.map(data.data, 'name');
            $scope.frequencies = _.map(data.data, 'count');
        });

        function plot_graph() {
            var id = 'chart';
            chartingService.chart('#' + id, $scope.categories, $scope.frequencies);
        }



    }

})();