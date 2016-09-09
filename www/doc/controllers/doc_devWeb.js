(function() {
    'use strict';
    var thisName = 'doc_devWeb';

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


        //读取account的信息文件
        $scope.getAccinfo = function() {
            var api = 'http://m.xmgc360.com/start/web/infosample.json';
            $.get(api, function(res) {
                //                console.log('GET', api, null, res);
                _fns.applyScope($scope, function() {
                    $scope.accinfo = res;
                    setTimeout(function() {
                        $scope.accinfo += ' ';
                    }, 10)
                });
            }, "html");
        };
        $scope.getAccinfo();
    }
})();
