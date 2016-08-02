(function () {
    'use strict';
    var thisName = 'doc_sideNav';

    _app.controller(thisName, thisFn);

    function thisFn(
        $rootScope,
        $scope,
        $location,
        $anchorScroll,
        $element,
        $mdToast,
        $mdDialog,
        $mdMedia
    ) {
        console.log(thisName + '.js is loading...');
        _fns.initCtrlr($scope, $element, thisName, false);

        $rootScope[thisName] = $scope;

        $scope.menus = [
            {
                name: 'Web前端开发指南',
                icon: 'fa fa-code',
                ctrlr: 'doc_devWeb',
            }, {
                name: '服务器端开发指南',
                icon: 'fa fa-cloud',
                ctrlr: 'doc_devSvr',
            }, {
                name: '全部API接口',
                icon: 'fa fa-plug',
                ctrlr: 'doc_api',
            }
        ]


        $scope.name = thisName;
    }
})();
