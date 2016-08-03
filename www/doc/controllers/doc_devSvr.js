(function () {
    'use strict';
    var thisName = 'doc_devSvr';

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

        //读取主服务器nginx设置
        $scope.getMainConf = function () {
            var api = 'http://m.xmgc360.com/main/api/getConf';
            $.get(api, function (res) {
                console.log('GET', api, null, res);

                if (res.code == 1) {
                    _fns.applyScope($scope,function(){
                        $scope.mainConf = res.data.mainConf;
                        $scope.moduleConf = res.data.moduleConf;
                    });
                };
            });
        };
        $scope.getMainConf();

        //textarea的change事件
        $scope.tachange = function (evt) {
            var tar = evt.target;
            tar.style.height = tar.scrollHeight + 'px'
        };

    }
})();
