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
                name: '前端开发指南',
                icon: 'fa fa-code',
                ctrlr: 'doc_devWeb',
            }, {
                name: '服务端开发指南',
                icon: 'fa fa-code',
                ctrlr: 'doc_devSvr',
            },{
                name: '专家使用手册',
                icon: 'fa fa-user',
                ctrlr: 'doc_usrPro',
            }
        ]


        $scope.name = thisName;
    }
})();
