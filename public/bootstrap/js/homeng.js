var app = angular.module('mkmApp', ['ngMessages']);

var mainController = function ($scope, $http, $window) {
    $scope.message = '';

}
app.controller('mkmController', ['$scope', '$http', '$location', '$window', mainController]);
