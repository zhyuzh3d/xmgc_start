//顶部导航控制器
(function () {
    var ctrlrName = 'doc_dev';

    angular.module('app').controller(ctrlrName, fn);

    function fn($rootScope, $scope, $location, $anchorScroll) {
        $rootScope[ctrlrName] = $scope;

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('swal');
        _fns.addLib('toastr');

        $scope.ctrlrName = ctrlrName;

        //换页
        $scope.goPage = function (pname) {
            $rootScope.changePage(pname);
        };

        //锚点
        $scope.goto = function (key) {
            $location.hash(key);
            $anchorScroll();
        };

        //读取主服务器nginx设置
        $scope.getMainConf = function () {
            var api = 'http://m.xmgc360.com/main/api/getConf';
            $.get(api, function (res) {
                var mainjo = $('#mainConfTa');
                var maintar = mainjo[0];
                var mainstr = '读取失败，请稍后再试';
                var modulejo = $('#moduleConfTa');
                var moduletar = modulejo[0];
                var modluestr = '读取失败，请稍后再试';

                if (res.code == 1) {
                    mainstr = res.data.mainConf;
                    modulestr = res.data.moduleConf;
                };

                $scope.$apply(function () {
                    mainjo.val(mainstr);
                    modulejo.val(modulestr);
                });
                maintar.style.height = maintar.scrollHeight + 'px';
                moduletar.style.height = moduletar.scrollHeight + 'px';
            });
        };
        $scope.getMainConf();

        //textarea的change事件
        $scope.tachange = function (evt) {
            var tar = evt.target;
            tar.style.height = tar.scrollHeight + 'px'
        };


        //end
        console.log(ctrlrName + '.js loading...')
    };
})();
