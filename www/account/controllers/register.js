//顶部导航控制器
(function () {
    var ctrlrName = 'register';

    _app.controller(ctrlrName, fn);

    function fn($rootScope, $scope, $location, $anchorScroll, $element, $mdToast) {
        $rootScope[ctrlrName] = $scope;
        $scope.ctrlrName = ctrlrName;

        _fns.getCtrlrAgs($scope, $element);

        $scope.user = {};

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('md5');
        _fns.addLib('toastr');

        //换页
        $scope.goPage = function (pname) {
            $rootScope.changePage(pname);
        };

        $scope.waiting = 0;
        var waitid = 0;
        $scope.waitCount = 300;

        //获取验证码
        $scope.getPhoneRegCode = function () {
            var api = _cfg.apiPrefix + 'getPhoneRegCode';
            var dat = {
                phone: $scope.user.phone
            };


            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //启动倒计时
                    $scope.waiting = 30;
                    clearInterval(waitid);
                    waitid = setInterval(function () {
                        $scope.$apply(function () {
                            $scope.waiting--;
                        })
                        if ($scope.waiting <= 0) {
                            clearInterval(waitid);
                        };
                    }, 1000);
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('发送失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };

        //注册账号
        $scope.regByPhone = function () {
            var api = _cfg.apiPrefix + 'regByPhone';
            var dat = {
                phone: $scope.user.phone,
                phoneCode: $scope.user.phoneCode,
                pw: md5($scope.user.pw),
            };
            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    $scope.goPage('profile');
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注册失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };


        //取消注册
        $scope.cancel = function () {
            window.location.href = document.referrer;
        };

        //测试
        $scope.print = function (str) {
            console.log(str);
        };
        $scope.showHints = false;

        //end
        console.log(ctrlrName + '.js loading...')
    };
})();
