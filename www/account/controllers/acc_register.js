/*注册页面
先验证是否已经登陆，如果已经登陆则自动注销当前用户
*/

(function() {
    'use strict';

    var ctrlrName = 'acc_register';

    _app.controller(ctrlrName, fn);

    function fn($rootScope, $scope, $location, $anchorScroll, $element, $mdToast, $mdDialog) {
        $rootScope[ctrlrName] = $scope;
        $scope.ctrlrName = ctrlrName;
        $scope.autoRun = []; //自动运行的函数

        _fns.getCtrlrAgs($scope, $element);

        $scope.user = {};

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('md5');

        //换页
        $scope.goPage = function(pname) {
            $rootScope.changePage(pname);
        };

        $scope.hasLogin = true; //初始认为已经登陆成功

        //自动检查是否已经登陆，如果已经登陆提示是否要注销
        $scope.autoRun.chkLogin = function() {
            var api = _cfg.apiPrefix + 'getMyInfo';
            var dat = {}

            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //已经登陆，提示是否要注销，不注销就后退页面
                    var confirm = $mdDialog.confirm()
                        .title('您已经登陆，需要为您注销吗?')
                        .textContent('必须注销后才能注册新账号.')
                        .ok('注销账号')
                        .cancel('返回');
                    $mdDialog.show(confirm).then(function(result) {
                        //注销当前账号
                        $scope.loginOut();
                    }, function() {
                        //返回上一页
                        window.location.href = document.referrer;
                    });
                    $scope.hasLogin = true;
                } else {
                    //还没登陆
                    $scope.hasLogin = false;
                };
            });
        };

        //注销当前账号
        $scope.loginOut = function() {
            var api = _cfg.apiPrefix + 'loginOut';
            var dat = {
                phone: $scope.user.phone
            };

            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    $scope.hasLogin = false;
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注销成功！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注销失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };


        //验证码按钮倒计时功能
        $scope.waiting = 0;
        var waitid = 0;

        //获取验证码
        $scope.getPhoneRegCode = function() {
            var api = _cfg.apiPrefix + 'getPhoneRegCode';
            var dat = {
                phone: $scope.user.phone
            };

            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //启动倒计时
                    $scope.waiting = 120;
                    clearInterval(waitid);
                    waitid = setInterval(function() {
                        $scope.$apply(function() {
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
        $scope.regByPhone = function() {
            var api = _cfg.apiPrefix + 'regByPhone';
            var dat = {
                phone: $scope.user.phone,
                phoneCode: $scope.user.phoneCode,
                pw: md5($scope.user.pw),
            };

            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //如注册成功，跳转到profile页面，并传递okUrl给个人设置页面以便跳转回去
                    if ($scope.args.okUrl) {
                        var gourl = _cfg.homePath + '?page=acc_profile&okUrl=' + encodeURI($scope.args.okUrl)
                        window.location.href = gourl;
                    } else {
                        $scope.goPage('acc_profile');
                    }
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
        $scope.cancel = function() {
            window.location.href = document.referrer;
        };

        //测试
        $scope.print = function(str) {
            console.log(str);
        };
        $scope.showHints = false;


        //自动运行的函数
        for (var attr in $scope.autoRun) {
            var fn = $scope.autoRun[attr];
            try {
                fn();
            } catch (err) {
                console.log(ctrlrName + ':' + fn.name + ' auto run failed...');
            }
        }

        //end
        console.log(ctrlrName + '.js loading...');
    };
})();
