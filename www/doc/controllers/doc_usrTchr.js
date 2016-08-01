(function () {
    'use strict';
    var thisName = 'doc_usrTchr';

    angular
        .module('app.controllers')
        .controller(thisName, thisFn);

    function thisFn(
        $rootScope,
        $scope,
        $location,
        $anchorScroll,
        $element,
        $mdToast,
        $mdDialog) {

        $scope.name = thisName;
    }
})();
