//每个页面都引入这个文件，提供所有的全局设置和文件引入

var _app = {}; //最高全局变量，angular
var _cfg = {}; //最高全局变量，功用设置
var _fns = {}; //最高全局变量，公用函数
var _xdat = {}; //共享变量

(function _main() {
    'use strict';

    _cfg.host = window.location.host;
    _cfg.homePath = 'http://m.xmgc360.com/start/web/account/';
    _cfg.apiPrefix = 'http://m.xmgc360.com/start/api/';


    _cfg.startPage = 'acc_profile';


    //自动载入库文件
    _cfg.libs = {
        jquery: {
            js: '//cdn.bootcss.com/jquery/2.2.4/jquery.min.js',
        },
        bootstrap: {
            js: '//cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js',
            css: '//cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js'
        },
        fontawesome: {
            css: '//cdn.bootcss.com/font-awesome/4.6.3/css/font-awesome.min.css'
        },
        wilddog: {
            js: '//cdn.wilddog.com/js/client/current/wilddog.js'
        },
        angular: {
            js: '//cdn.bootcss.com/angular.js/1.3.20/angular.min.js',
            js2: '//cdn.bootcss.com/angular.js/1.3.20/angular-resource.min.js'
        },
        swal: {
            js: '//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.js',
            css: '//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.css'
        },
        toastr: {
            js: '//cdn.bootcss.com/toastr.js/latest/js/toastr.min.js',
            css: '//cdn.bootcss.com/toastr.js/latest/css/toastr.min.css'
        },
        md5: {
            js: '//cdn.bootcss.com/blueimp-md5/2.3.0/js/md5.min.js'
        },
        qcode: {
            js: '//cdn.bootcss.com/jquery.qrcode/1.0/jquery.qrcode.min.js'
        },
        moment: {
            js: '//cdn.bootcss.com/moment.js/2.13.0/moment.min.js'
        },
        module: {
            js: '//' + _cfg.host + '/lib/simditor/latest/scripts/module.js',
        },
        simditor: {
            lib: 'module',
            css: '//' + _cfg.host + '/lib/simditor/latest/styles/simditor.css',
            js1: '//' + _cfg.host + '/lib/simditor/latest/scripts/hotkeys.js',
            js2: '//' + _cfg.host + '/lib/simditor/latest/scripts/uploader_qn.js',
            js3: '//' + _cfg.host + '/lib/simditor/latest/scripts/simditor.js',
        },
        plupload: {
            js: '//cdn.bootcss.com/plupload/2.1.9/moxie.min.js',
            js2: '//cdn.bootcss.com/plupload/2.1.9/plupload.dev.js',
            js2: '//cdn.bootcss.com/plupload/2.1.9/plupload.full.min.js',
        },
        qiniu: {
            js: '//cdn.bootcss.com/qiniu-js/1.0.15-beta/qiniu.min.js',
        },
        jform: {
            js: '//cdn.bootcss.com/jquery.form/3.51/jquery.form.min.js',
        },

    };

    /*angular初始设置,提供全局功能函数
     */
    _app = angular.module('app', [
        'app.factories',
        'app.services',
        'app.filters',
        'app.directives',
        'app.controllers',
        'ngMaterial',
    ]).config(
        function angularConfig($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $mdThemingProvider) {
            $locationProvider.html5Mode(true);
            _app.controller = $controllerProvider.register;
            _app.service = $provide.service;
            _app.factory = $provide.factory;
            _app.directive = $compileProvider.directive;
            _app.filter = $filterProvider.register;

            //material design theme主题颜色定制
            $mdThemingProvider.theme('default')
                .primaryPalette('teal', {
                    'default': 'A700'
                })
                .accentPalette('pink', {
                    'default': '400'
                })
                .warnPalette('red', {
                    'default': '600'
                });
        }
    );

    angular.module('app.factories', []);
    angular.module('app.services', []);
    angular.module('app.filters', []);
    angular.module('app.directives', []);
    angular.module('app.controllers', []);


    _app.run(function angularRun($rootScope) {
        //所有跨控制器共享数据
        _xdat = $rootScope.xdat = {};

        //切换页面的函数
        $rootScope.changePage = function (pname, args) {
            //传递参数
            if (args) {
                if (!$rootScope.xdat[pname]) $rootScope.xdat[pname] = {};
                for (var attr in args) {
                    $rootScope.xdat[pname][attr] = args[attr];
                };
            };

            $rootScope.curPage = pname;
            $rootScope.curPageUrl = './controllers/' + pname + '.html';
        };

        //根据地址栏传来的参数切换页面
        var page = _fns.getUrlParam('page') || _cfg.startPage;
        $rootScope.changePage(page);
    });

    //自定义filter过滤器

    //显示为html样式
    _app.filter('toTrustHtml', ['$sce',
        function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            }
        }
    ]);


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


    /*获取路由页面，用于换页
     */
    _fns.getCtrlr = function (ctrlrname) {
        var path = './controllers/' + ctrlrname + '.html';
        return path;
    };

    /*自动载入控制器对应的js*/
    _fns.addCtrlrJs = function (ctrlrname) {
        var all_js = document.getElementsByTagName("script");
        var cur_js = $(all_js[all_js.length - 1]);

        var url = './controllers/' + ctrlrname + '.js';
        cur_js.prev().append('<script src="' + url + '"><\/script>');
    };

    /*向head添加需要初始化的库，参照_cfg.libs
     */
    _fns.addLib = function (libstr) {
        var lib = _cfg.libs[libstr];
        if (libstr && lib && !lib.loaded) {
            for (var attr in lib) {
                var htmlstr = '';

                //匹配文件类型,如果是lib则关联载入
                if (attr.substr(0, 2) == 'js') {
                    htmlstr = '<script src="' + lib[attr] + '"><\/script>';
                } else if (attr.substr(0, 3) == 'css') {
                    htmlstr = '<link href="' + lib[attr] + '" rel="stylesheet">';
                } else if (attr == 'lib') {
                    _fns.addLib(lib[attr]);
                };

                //载入文件到头部
                if (htmlstr) {
                    $('head').append(htmlstr);
                    lib.loaded = true;
                };
            };
        } else {
            if (lib.loaded) {
                console.log('_app.load:' + libstr + ' already exist.')
            } else {
                console.log('_app.load:' + libstr + ' format err.')
            };
        };
    };


    /*重新应用scope
     */
    _fns.applyScope = function (scp) {
        if (scp && scp.$root && scp.$root.$$phase != '$apply' && scp.$root.$$phase != '$digest') {
            scp.$apply();
        };
    };

    /*创建唯一的id
     */
    _fns.uuid = function uniqueId(prefix) {
        var ts = Number(new Date()).toString(36)
        var rd = Number(String(Math.random()).replace('.', '')).toString(36);
        var res = ts + '-' + rd;
        if (prefix) res = prefix + '-' + res;
        return res;
    };

    /*ctrlr获取上层传来的参数，首先使用地址栏参数，其次使用xdat[ctrlr],最后使用dom的属性
    需要具有scope.ctrlrName属性
    写入到$scope.args
     */
    _fns.getCtrlrAgs = function (scope, element) {
        var res;
        if (scope) {
            if (!scope.args) scope.args = {};

            //提取dom传来的属性参数放到scope.args
            if (element) {
                var hargs = element.getParentAttr();
                for (var attr in hargs) {
                    scope.args[attr] = hargs[attr];
                };
            };

            //提取xdat的参数放到scope.args
            var xargs = _xdat[scope.ctrlrName] || {};
            for (var attr in xargs) {
                scope.args[attr] = xargs[attr];
            };

            //获取地址栏的参数放到scope.args
            var uargs = _fns.getUrlParams();
            for (var attr in uargs) {
                scope.args[attr] = uargs[attr];
            };

            res = scope.args;
        };
        return res;
    };


    //最基本的上传按钮
    _fns.uploadFile = function (evt, callback) {
        var btnjo = $(evt.target);

        //创建formdata数据
        var filejo = btnjo.siblings('#uploadFileInput');
        filejo.remove();
        filejo = $('<input id="uploadFileInput" type="file"></input>').appendTo(btnjo);
        btnjo.after(filejo);



        //给file input添加监听
        filejo.bind('change', function () {
            var fileobj = filejo.get(0).files[0];
            console.log('>>>onchange', fileobj);

            $.get('http://www.10knet.com/api/getUploadToken',
                function (res) {
                    _fns.uploadFileQn(fileobj, res.uptoken,
                        function (evt) {
                            console.log('>>>>loading....', evt);
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                console.log('>>>>loading', percentComplete);
                            };
                        },
                        function (res) {
                            console.log('>>>>loadok', res);
                        },
                        function (err) {
                            console.log('>>>>loaderr', res);
                        });
                });
        });

        //激活
        filejo.click();
    };


    /*上传到七牛存储的函数
    ingfn(evt)传输中的函数,okfn(evt)完成后的函数
    */
    _fns.uploadFileQn = function (fileobj, token, ingfn, okfn, errfn) {
        //准备fromdata
        var fdata = new FormData();
        fdata.append('file', fileobj);
        fdata.append('token', token);

        //发起上传
        var set = {
            url: "http://up.qiniu.com",
            data: fdata,
            type: 'POST',
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener("progress", function (e) {
                    console.log('proc', e);
                }, false);
                return xhr;
            },
            progress: function (e) {
                if (!e.lengthComputable) {
                    return;
                }
            },
            success: function (result) {
                //把七牛的返回结果专为标准格式
                result['success'] = true;
                result['file_path'] = 'http://pubfiles.10knet.com/' + result.key;
                result['msg'] = 'upload ok.';
            }
        };

        if (ingfn) set.progress = ingfn;
        if (okfn) set.success = okfn;
        if (errfn) set.error = errfn;

        return $.ajax(set);
    };



    //所有文件类型及对应的fa图标
    _cfg.fileIcons = {
        'image/jpeg': 'fa fa-file-image-o',
        'video/mp4': 'fa fa-file-movie-o',
        'text/plain': 'fa fa-file-text-o',
        'application/x-zip-compressed': 'fa fa-file-archive-o',
        'application/msword': 'fa fa-file-word-o',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa fa-file-word-o',
        'application/vnd.ms-excel': 'fa fa-file-excel-o',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa fa-file-excel-o',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa fa-file-excel-o',
    };
    _fns.getFileIcon = function (typestr, size) {
        var res = _cfg.fileIcons[typestr] || 'fa fa-file-o';
        res = 'fa ' + res;
        if (size) res += ' ' + size;
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



})();
