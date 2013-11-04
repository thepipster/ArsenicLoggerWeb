
// Make sure we have any dependencies
head.load("/libs/nvd3/src/nv.d3.css");

head.js("/libs/nvd3/lib/d3.v3.js",
    "/libs/nvd3/nv.d3.js",
    "/libs/nvd3/src/tooltip.js",
    "/libs/nvd3/src/utils.js",
    "/libs/nvd3/src/models/legend.js",
    "/libs/nvd3/src/models/stackedAreaChart.js");

AsLoggerModule.directive('areachart', function() {

    return {

        restrict: 'E',

        template: function(element, attrs){
            // Setup
        },

        scope: {
        },

        link: function($scope, element, attrs) {

            $scope.$watch('host', function(newValue, oldValue) {

                console.log('chart data changed!');

                var host = attrs.host;

                console.log("Rendering chart for host " + host);

                chartScope.getWidgetData(widgetId, function(data){

                    var divId = 'logi-chart-'+widgetId;
                    $('#'+divId).empty();

                    var w = $(element).width();
                    var h = $(element).height();

                    var txt = '<div style="height: '+h+'px; width: '+w+'px" id="'+divId+'"><svg></svg></div>';
                    element.replaceWith(txt);

                    nv.addGraph(function() {

                        var chart = nv.models.stackedAreaChart();

                        chart.xAxis
                            .axisLabel('Time (ms)')
                            .tickFormat(d3.format(',r'));

                        chart.yAxis
                            .axisLabel('Voltage (v)')
                            .tickFormat(d3.format('.02f'));

                        d3.select('#'+divId+' svg')
                            .datum(data)
                            .transition().duration(500)
                            .call(chart);

                        nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });

                        return chart;
                    });

                });



            }, true);



            //$scope.$watch('appKey', function(newValue, oldValue) {
            //    if (newValue)   {
            //        Logger.debug(newValue);
            //    }
            //}, true);

        }
    };
});

