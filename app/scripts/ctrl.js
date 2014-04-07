'use strict';


angular.module('myApp').controller('mainCtrl', ['$scope', 'beerSugar', function($scope, beerSugar) {
    $scope.title='Beer is life';
    
    $scope.malts = {
        pilsen: {
            mass: 10,
            yield_m: 0.58
        }
    };
    
    $scope.volume = '50';
    
    $scope.currentMaltYield='';
    $scope.currentMaltMass = '';
    $scope.currentMaltName = '';
    
    $scope.add = function() {
        $scope.malts[$scope.currentMaltName] = {
            mass: parseInt($scope.currentMaltMass, 10),
            yield_m: parseInt($scope.currentMaltYield, 10)/100
        };
        $scope.compute();
    }
    
    $scope.compute = function() {
        $scope.result = beerSugar.diluateSugar(
            parseInt('0' + $scope.volume),
            beerSugar.producedSugar($scope.malts)
        );
    }
    
    $scope.$watch('volume', function() {
        $scope.compute();
    });
    
    
    
}]);
