(function () {
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
        $scope.goto = function (key) {
            $location.hash(key);
            $anchorScroll();
        };

        //根据下拉载入相对应的模块info文件
        $scope.loadModuleInfo = function () {
            var mname = $scope.selectedModule;
            var api = 'http://m.xmgc360.com/' + mname + '/web/info.json';
            $.get(api, function (res) {
                var res = JSON.safeParse(res);
                console.log('GET', api, null, res);
                if (!res) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('模块［'+mname + '］数据格式错误,请反馈给开发人员')
                        .position('top right')
                        .hideDelay(3000)
                    );
                    return;
                };
                _fns.applyScope($scope, function () {
                    $scope.curModule = res;

                    //循环载入子模块
                    if (!$scope.curModule.subModules) return;
                    var mds = $scope.curModule.subModules;
                    $scope.curModule.subModuleInfo = {};
                    mds.forEach(function (md, i) {
                        var subapi = 'http://m.xmgc360.com/' + $scope.selectedModule + '/web/' + md + '/info.json';
                        $.get(subapi, function (subres) {
                            var subres = JSON.safeParse(subres);
                            console.log('GET', subapi, null, subres);
                            if (!res) {
                                $mdToast.show(
                                    $mdToast.simple()
                                    .textContent('数据格式错误,请反馈给开发人员')
                                    .position('top right')
                                    .hideDelay(3000)
                                );
                                return;
                            };
                            _fns.applyScope($scope, function () {
                                $scope.curModule.subModuleInfo[md] = subres;
                            });

                            //submodule get end
                        }, 'html');
                    });
                });

                //module get end
            }, 'html');
        };


        //读取main的模块信息列表文件
        $scope.getMainConf = function () {
            var api = 'http://m.xmgc360.com/main/api/getConf';
            $.get(api, function (res) {
                console.log('GET', api, null, res.substr(0, 100));
                var res = JSON.parse(res);
                if (res.code != 1) return;

                _fns.applyScope($scope, function () {
                    var mainConf = res.data.mainConf;

                    //从配置文件直接读取模块名称
                    var reg = /location\s+\^~\s+\/\w+\//g;
                    var matchs = mainConf.match(reg);
                    if (!matchs) return;

                    $scope.moduleList = [];
                    matchs.forEach(function (obj, i) {
                        var mname = obj.match(/\/\w+\//)[0].replace(/\//g, '');
                        if (mname) {
                            $scope.moduleList.push(mname);
                        }
                    });

                    //初始化显示第一个模块
                    if ($scope.moduleList.length > 0) {
                        $scope.selectedModule = $scope.moduleList[1];
                        $scope.loadModuleInfo();
                    };
                });
            }, "html");
        };
        $scope.getMainConf();
    }
})();
