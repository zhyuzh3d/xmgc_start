//顶部导航控制器
(function() {
    var ctrlrName = 'register';

    angular.module('app').controller(ctrlrName, fn);

    function fn($rootScope, $scope, $location, $anchorScroll) {
        $rootScope[ctrlrName] = $scope;

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('swal');
        _fns.addLib('toastr');

        $scope.ctrlrName = ctrlrName;

        //换页
        $scope.goPage = function(pname) {
            $rootScope.changePage(pname);
        };

        //end
        console.log(ctrlrName + '.js loading...')
    };
})();
