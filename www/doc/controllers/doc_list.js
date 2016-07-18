//顶部导航控制器
(function () {
    var ctrlrName = 'doc_list';

    angular.module('app').controller(ctrlrName, ['$rootScope', '$scope', fn]);

    function fn($rootScope, $scope) {
        $rootScope[ctrlrName] = $scope;

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('swal');
        _fns.addLib('toastr');

        $scope.ctrlrName = ctrlrName;

        console.log('doc_list.js loading...')
    };
})();
