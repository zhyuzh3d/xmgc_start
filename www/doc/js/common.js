/*提供通用函数和全局变量
全局相关的设置也在这里修改
*/

var _cfg = {}; //最高全局变量，功用设置
var _fns = {}; //最高全局变量，公用函数
var _xdat = {}; //共享变量

(function () {
    'use strict';

    //初始页面,
    _cfg.startPage = 'doc_api';

    //如果地址栏传递page参数进来，那么 autoStartPage 函数会覆盖startPage
    _fns.autoStartPage = function () {
        var pname = _fns.getUrlParam('page');
        if (pname) {
            _cfg.startPage = pname;
        }
    };

    //设置相对路径，适配测试和正式
    _cfg.home = 'http://' + window.location.host + '/www/doc/';
    if (window.location.host == 'm.xmgc360.com') {
        _cfg.home = 'http://' + window.location.host + '/start/web/doc/'
    };

    //设置获取ctrlr路径方法
    _fns.getCtrlrUrl = function (ctrlrname, ext) {
        if (!ext) ext = '.html';
        return _cfg.home + 'controllers/' + ctrlrname + ext;
    };

    //添加控制器的js文件
    _fns.addCtrlrJs = function (ctrlrname) {
        var all_js = document.getElementsByTagName("script");
        var cur_js = $(all_js[all_js.length - 1]);

        var url = './controllers/' + ctrlrname + '.js';
        cur_js.prev().append('<script src="' + url + '"><\/script>');
    };

    //向_xdat添加控制器，便于根据名称或Dom的id获取控制器的scope
    _fns.initCtrlr = function (scope, element, name, solo) {
        scope.ctrlrName = scope.ctrlrName || name;

        //获取父层传来的参数，写入scope.xargs;
        _fns.getCtrlrXags(scope, element);

        //记录到xdat的ctrlrs，名称数组［］可以放置多个同名控制器
        if (scope.ctrlrName) {
            if (!_xdat.ctrlrs) _xdat.ctrlrs = {};
            if (solo || !_xdat.ctrlrs[scope.ctrlrName]) _xdat.ctrlrs[scope.ctrlrName] = [];
            _xdat.ctrlrs[scope.ctrlrName].push(scope);
        };

        //记录到xdat的id2ctrlr,dom的id到ctrlr的映射;id不能重名
        if (scope.xargs.id) {
            if (!_xdat.id2ctrlr) _xdat.id2ctrlr = {};
            _xdat.id2ctrlr[scope.xargs.id] = scope;
        };
    };

    /*ctrlr获取上层传来的参数，首先使用地址栏参数，其次使用xdat[ctrlr],最后使用dom的属性
    需要具有scope.ctrlrName属性
    写入到$scope.args
     */
    _fns.getCtrlrXags = function (scope, element) {
        var res;
        if (scope) {
            if (!scope.xargs) scope.xargs = {};

            //提取dom传来的属性参数放到scope.args
            if (element) {
                var hargs = element.getParentAttr();
                for (var attr in hargs) {
                    scope.xargs[attr] = hargs[attr];
                };
            };

            //提取xdat的参数放到scope.args
            var xargs = _xdat[scope.ctrlrName] || {};
            for (var attr in xargs) {
                scope.xargs[attr] = xargs[attr];
            };

            //获取地址栏的参数放到scope.args
            var uargs = _fns.getUrlParams();
            for (var attr in uargs) {
                scope.xargs[attr] = uargs[attr];
            };

            res = scope.xargs;
        };
        return res;
    };



    /*根据地址栏跳转到指定控制器,实际是根据地址栏规则修改scope的属性
    规则##id#attr#url
     */
    _fns.changeCtrlrByHash = function () {
        //拆解地址栏hash
        var hasharr = unescape(window.location.hash).split('#');
        if (hasharr.length < 4) return false;

        //获取scope和url
        var id = hasharr[1].substr(1);
        var scope = _xdat.id2ctrlr[id];
        var attr = hasharr[2];
        var url = hasharr[3];
        if (hasharr.length > 4) {
            url += hasharr.slice(4).join('#');
        };

        //刷新应用
        _fns.applyScope(scope, function () {
            scope[attr] = url;
        })
        return true;
    };


    /*获取地址栏参数
     */
    _fns.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /*获取地址栏全部参数
     */
    _fns.getUrlParams = function (url) {
        var res;
        url = (url) ? url : window.location.href;
        url = String(url);
        var parts = unescape(url).split('?');
        if (parts.length > 1) {
            var arr = parts[1].split('&');
            var args = {};
            arr.forEach(function (seg, i) {
                var segarr = seg.split('=');
                if (segarr.length > 1) {
                    args[segarr[0]] = segarr[1];
                };
            });
            res = args;
        };
        return res;
    };


    /*扩展$,获取父层的参数
    控制器用来获取由页面传来的参数，这些值都设定在模版父层<div ng-include='aa' name='jack'>，得到{ng-include:'aa',name:'jack'}
    */
    $.fn.getParentAttr = $getParentAttr;

    function $getParentAttr() {
        var res = {};
        var jo = this;
        if (jo && jo[0] && jo.parent()[0]) {
            var attrs = jo.parent()[0].attributes;
            for (var i = 0; i < attrs.length; i++) {
                var attr = attrs[i];
                res[attr.name] = attr.value;
            };
        };
        return res;
    };

    /*重新应用scope
     */
    _fns.applyScope = function (scope, fn) {
        if (scope && scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
            scope.$apply(fn);
        };
    };



    /*自动运行的函数*/
    _fns.autoStartPage();

    //end
})();
