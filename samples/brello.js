var brello = angular.module('brello', []);
brello.directive('directiveName', function () {

    return function (scope, element, attrs) {

    }

});


var FooCtrl = function ($scope) {
    $scope.sayHello = function () {
        return "hi"
    }

}
    .directive('markdown', function () {

        return function (scope, element, attrs) {

        }
    });