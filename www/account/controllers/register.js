//顶部导航控制器
(function() {
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
        $scope.goPage = function(pname) {
            $rootScope.changePage(pname);
        };

        //获取验证码
        $scope.getPhoneRegCode = function() {
            var api = _cfg.apiPrefix + 'getPhoneRegCode';
            var dat = {
                phone: $scope.user.phone
            };
            console.log('POST', api, dat);
            $.post(api, dat, function(res) {
                console.log(api, res);
            });
        };

        //注册账号
        $scope.regByPhone = function() {
            var api = _cfg.apiPrefix + 'regByPhone';
            var dat = {
                phone: $scope.user.phone,
                phoneCode: $scope.user.phoneCode,
                pw: md5($scope.user.pw),
            };
            console.log('POST', api, dat);
            $.post(api, dat, function(res) {
                if (res.code == 1) {
                    $scope.goPage('profile');
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注册失败:' + res.text)
                        .position(pinTo)
                        .hideDelay(3000)
                    );
                }
            });
        };


        //取消注册
        $scope.cancel = function() {
            $mdToast.show(
                $mdToast.simple()
                .textContent('注册失败')
                .position('top right')
                .hideDelay(1000000)
            );
        };

        //end
        console.log(ctrlrName + '.js loading...')
    };
})();
