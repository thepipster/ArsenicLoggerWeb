// declare a new module, and inject the $compileProvider
var AsLoggerModule = angular.module('AsLoggerApp', ['ngAnimate', 'ngResource'], function($compileProvider) {

    // configure new 'compile' directive by passing a directive
    // factory function. The factory function injects the '$compile'
    $compileProvider.directive('compile', function($compile) {

        // directive factory creates a link function
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    })
});

AsLoggerModule.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

AsLoggerModule.animation('.animate-logs', function() {
    return {
        enter: function(element, done) {
            $(element).css({
                position: 'relative',
                left: -1000,
                opacity: 0
            });
            $(element).animate({
                left: 0,
                opacity: 1
            }, done);
        },

        leave: function(element, done) {
            $(element).css({
                position: 'relative',
                left: 0,
                opacity: 1
            });
            $(element).animate({
                left: -1000,
                opacity: 0
            }, done);
        },

        move: function(element, done) {
            $(element).css({
                opacity: 0.5
            });
            $(element).animate({
                opacity: 1
            }, done);
        }
    };
});
