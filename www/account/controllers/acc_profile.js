/*注册页面
先验证是否已经登陆，如果已经登陆则自动注销当前用户
*/

(function() {
    'use strict';

    var ctrlrName = 'acc_profile';

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
                    //已经登陆，把数据填充到用户
                    $scope.$apply(function() {
                        for (var attr in res.data) {
                            $scope.user[attr] = res.data[attr];
                        };
                        $scope.hasLogin = true;
                    })
                } else {
                    //还没登陆，弹窗返回上一页或者登录页
                    $scope.goPage('acc_login');
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
                        .hideDelay(500)
                    ).then(function(result) {
                        $scope.goPage('acc_login');
                    });
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

        //注册账号
        $scope.saveProfile = function() {
            var api = _cfg.apiPrefix + 'saveProfile';
            var dat = {
                nick: $scope.user.nick,
                color: $scope.user.color,
                icon: $scope.user.icon,
            };

            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //如果保存成功，提示然后返回okUrl或者back
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('保存成功！')
                        .position('top right')
                        .hideDelay(500)
                    ).then(function(result) {
                        if ($scope.args.okUrl) {
                            window.location.href = encodeURI($scope.args.okUrl);
                        } else {
                            window.location.href = document.referrer;
                        };
                    });
                } else {
                    //如果保存失败，提示
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('保存失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };

        //跳转到修改密码页面，传递okUrl过去
        $scope.gotoChangePw = function() {
            if ($scope.args.okUrl) {
                var gourl = _cfg.homePath + '?page=acc_changePw&okUrl=' + encodeURI($scope.args.okUrl)
                window.location.href = gourl;
            } else {
                $scope.goPage('acc_changePw');
            };
        };

        //取消注册
        $scope.cancel = function() {
            window.location.href = document.referrer;
        };


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
        console.log(ctrlrName + '.js loading...')
    };
})();
