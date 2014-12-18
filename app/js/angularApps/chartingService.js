/**
 * Created by Inzamam on 12/17/2014.
 */

(function() {

    angular.module('app').service('chartingService', chartingService);

    function chartingService() {

        var that = this;

        this.chart = function(id_of_location, categories, frequencies) {
            var data = _.zip(categories, frequencies);
            $(function () {
                $('#container').highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Popularity of subscribed hashtags'
                    },
                    xAxis: {
                        type: 'hashtag',
                        labels: {
                            rotation: -45,
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Tweets encountered'
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    //tooltip: {
                    //    pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>'
                    //},
                    series: [{
                        name: 'Hashtag counts',
                        data: data,
                        dataLabels: {
                            enabled: true,
                            rotation: -90,
                            color: '#FFFFFF',
                            align: 'right',
                            x: 4,
                            y: 10,
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif',
                                textShadow: '0 0 3px black'
                            }
                        }
                    }]
                });
            });

        }

    }

})();