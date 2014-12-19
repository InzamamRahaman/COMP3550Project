/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    angular.module('app').controller('subgraphController', subgraphController);

    subgraphController.$inject = ['$scope', 'subgraphService', 'socketService', 'aborService'];

    function subgraphController($scope, subgraphService, socketService, aborService) {

        $scope.data = null;
        $scope.node_mappings = {};


        subgraphService.register_observer(function(data) {
            console.log(data);
            $scope.data = data;
            $scope.plot_graph();
        });

        function clear_canvas(canvas_id) {

            var canvas = document.getElementById(canvas_id);
            console.log(canvas);
            var context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0,0,canvas.width, canvas.height);
            $scope.node_mappings = {};
            console.log('canvas cleared');
        }

        $scope.plot_graph = function() {
            //clear_canvas('graph_pane');
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
            var nodes = _.flatten(_.map(usable_data, get_nodes));//get_nodes(usable_data);
            var edges = _.flatten(_.map(usable_data, get_edges));
            console.log('Requesting for');
            console.log(nodes);
            console.log('edge ');
            console.log(edges);
            aborService.plot(nodes, edges);

        }

        function get_random_color() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
            //function c() {
            //    return Math.floor(Math.random()*256).toString(16)
            //}
            //return "#"+c()+c()+c();
        }

        function get_nodes(data) {
            var verticies = data.verticies;
            console.log("vertsd  ");
            console.log(verticies);
            var colour = get_random_color();
            return _.map(verticies, function(vertex) {
                console.log(vertex);
                var m = vertex['size']
                var obj = {
                    'name' : vertex.name,
                    'data' : {
                        'color': colour
                    }
                };
                obj['data']['mass'] = m;
                console.log(obj);
               return obj;
            });
        }

        function get_edges(data) {
            var edges = data.edges;
            console.log('edges');
            console.log(edges);
            return _.map(edges, function(edge) {
                return {
                    'start': edge.start,
                    'end': edge.end,
                    'length': edge.cost
                }
            });
        }

    }

})();