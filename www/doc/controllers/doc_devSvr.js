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
                var mainjo = $('#mainConfTa');
                var maintar = mainjo[0];
                var mainstr = '读取失败，请稍后再试';
                var modulejo = $('#moduleConfTa');
                var moduletar = modulejo[0];
                var modluestr = '读取失败，请稍后再试';

                if (res.code == 1) {
                    $scope.mainConf = res.data.mainConf;
                    mainstr = res.data.mainConf;
                    modulestr = res.data.moduleConf;
                };

                $scope.$apply(function () {
                    mainjo.val(mainstr);
                    modulejo.val(modulestr);
                });
                maintar.style.height = (maintar.scrollHeight + 4) + 'px';
                moduletar.style.height = (moduletar.scrollHeight + 4) + 'px';
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
