(function() {
    'use strict';
    var thisName = 'doc_api';

    _app.controller(thisName, thisFn);

    function thisFn(
        $rootScope,
        $scope,
        $location,
        $anchorScroll,
        $element,
        $mdToast,
        $mdDialog
    ) {
        console.log(thisName + '.js is loading...');
        _fns.initCtrlr($scope, $element, thisName, false);

        //锚点
        $scope.goto = function(key) {
            $location.hash(key);
            $anchorScroll();
        };

        $scope.moduleList = [{
            name: 'main',
        }, {
            name: 'start',
        }];


        $scope.selectedModule = $scope.moduleList[0];








        //读取main的模块信息列表文件
        $scope.getMainConf = function() {
            var api = 'http://m.xmgc360.com/main/api/getConf';
            $.get(api, function(res) {
                console.log('GET', api, null, res.substr(0, 100));
                if (res.code != 1) return;
                _fns.applyScope($scope, function() {
                    $scope.moduleList = [{
                        name: 'main',
                    }, {
                        name: 'start',
                    }];


                    $scope.selectedModule = $scope.moduleList[0];


                    var mainConf = res.data.mainConf;
                    var moduleConf = res.data.moduleConf;
                });
            }, "html");
        };
        // $scope.getMainConf();
    }
})();
