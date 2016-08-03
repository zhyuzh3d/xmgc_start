/*每个模块都应该引入的js脚本,需要jquery和bootstrap支持
自动创建顶部和底部元件*/
console.log('start/_xmgc.js:loading...');
if (!_xmgc) {
    /**
     * 全局变量
     * @public
     */
    var _xmgc = {};
};

(function() {
    //底部导航
    var botbar = $('<div id="botnavbar" class="navbar navbar-default navbar-fixed-bottom nav nav-tabs xmgcNavBar col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4 hidden-md hidden-lg botnavbar" style="height:6rem;z-index:10;padding:0;box-shadow:0 0 2rem #CCC"></div>');
    var botbtns = botbar.btns = $('<div class="nav nav-pills" style="height:100%"></div>').appendTo(botbar);

    //顶部导航
    var topbar = $('<div id="topnavbar" class="navbar navbar-default nav nav-tabs .navbar-static-top xmgcNavBar visible-md visible-lg topnavbar" style="height:3rem;z-index:10;padding:0;box-shadow:0 0 2rem #AAA"></div>');
    var topbtns = topbar.btns = $('<div class="nav nav-pills" style="height:100%"></div>').appendTo(topbar);


    //添加底部模块导航按钮
    var navModules = {
        'welcome': {
            name: '首页',
            path: 'start/web/welcome/',
            icon: 'fa fa-home',
        },
        'start': {
            name: '开始',
            path: 'start/web/index.html',
            icon: 'fa fa-tasks',
        },
        'doc': {
            name: '文档',
            path: 'start/web/doc/',
            icon: 'fa fa-book',
        },
        'item1': {
            name: '未指定',
            path: 'start/web/welcome/undefined.html',
            icon: 'fa fa-bookmark',
        },
        'more': {
            name: '更多',
            path: 'start/web/welcome/more.html',
            icon: 'fa fa-gift',
        },
    };


    for (var attr in navModules) {
        var mod = navModules[attr];
        //从当前url判断是否激活
        var onact = false;
        if (location.href.indexOf('http://m.xmgc360.com/' + mod.path) != -1) {
            mod.act = true;
        };
        if (location.href == 'http://m.xmgc360.com/' && attr == 'welcome') {
            mod.act = true;
        };
    };



    //    顶部导航栏的LOGO
    topbtns['brand'] = $('<li style="text-align:center;margin:0;border-right:1px solid #DDD;height:100%;overflow-y:hidden;border:none;"><a style="height:4rem;border-radius:0;padding:0.9rem 2rem;" href="http://m.xmgc360.com/"><img src="http://www.xmgc360.com//_imgs/xmgcm.png" style="width: 7rem;margin-top:-1rem;"></img></a></li>').appendTo(topbtns);

    //向底部和顶部导航栏添加按钮
    for (var attr in navModules) {
        var mod = navModules[attr];

        //向底部导航添加按钮
        botbtns[attr] = $('<li role="presentation" style="width:20%;text-align:center;margin:0;border-right:1px solid #DDD;"><a style="height:6rem;border-radius:0" href="http://m.xmgc360.com/' + mod.path + '">' + '<div class="' + mod.icon + '" style="font-size:3rem"></div><div style="font-size:1rem">' + mod.name + '</div></a></li>').appendTo(botbtns);

        if (mod.act) {
            botbtns[attr].attr('class', 'active');
        } else {
            botbtns[attr].attr('class', '');
        };

        //向顶部导航添加按钮
        topbtns[attr] = $('<li style="text-align:center;margin:0;border-right:1px solid #DDD;height:100%;overflow-y:hidden;border:none"><a style="height:4rem;border-radius:0;padding:1.2rem 2rem;" href="http://m.xmgc360.com/' + mod.path + '">' + '<span class="' + mod.icon + '" style="font-size:1.5rem;margin-right:0.5rem"></span><span style="font-size:1.4rem">' + mod.name + '</span></a></li>').appendTo(topbtns);

        if (mod.act) {
            topbtns[attr].attr('class', 'active');
        } else {
            topbtns[attr].attr('class', '');
        };
    };


    /**
     * 底部导航栏
     * @private
     * @property bottomNavBar
     */
    _xmgc.bottomNavBar = botbar;
    _xmgc.topNavBar = topbar;


    /**
     * 添加底部导航栏
     * @private
     * @method addBottomNavBar
     * @return {jqueryObj} _xmgc.bottomNavBar
     */
    _xmgc.addBottomNavBar = function() {
        $('body').append(_xmgc.bottomNavBar);
        return _xmgc.bottomNavBar;
    };

    /**
     * 添顶部导航栏
     * @private
     * @method addBottomNavBar
     * @return {jqueryObj} _xmgc.bottomNavBar
     */
    _xmgc.addTopNavBar = function() {
        $('body').prepend(_xmgc.topNavBar);
        return _xmgc.topNavBar;
    };




    /**
     * 添加色彩样式
     * @private
     * @method addNavBarStyle
     * @param {string}  clr 颜色字符串
     * @return {jqueryObj} _xmgc.bottomNavBar
     */
    _xmgc.addNavBarStyle = function(clr) {
        if (!clr) clr = '#00bfa5';
        var stl = $('<style></style');
        stl.append('.botnavbar .nav-pills li a{color: ' + clr + ';text-decoration: none;font-family:simhei}');
        stl.append('.topnavbar .nav-pills li a{color: ' + clr + ';text-decoration: none;font-family:simhei;height:100%}');
        stl.append('.xmgcNavBar .nav-pills li.active a{color: #FFF;background-color: ' + clr + ';height:100%}');
        stl.append('.botnavbar .nav-pills li .active a:hover{color: #FFF;background-color: ' + clr + ';height:100%}');
        stl.append('.topnavbar .nav-pills li a:hover{background-color: #EEE;height:100%}');
        _xmgc.navBarStyle = stl;
        $('body').append(_xmgc.navBarStyle);
        return _xmgc.navBarStyle;
    };

    /**
     * 添加导航栏，可选顶部底部或全部
     * @private
     * @method addNavBar
     * @param {Object} str='top/bottom/both'
     * @return {Array} description
     */
    _xmgc.addNavBar = function(str) {
        var res = [];
        res.push(_xmgc.addNavBarStyle());
        if (str == 'bootom' || str == 'bot' || str == 'both') {
            res.push(_xmgc.addBottomNavBar());
            res.push(_xmgc.addTopNavBar());
        };
    };


    //自动添加导航栏，默认添加底部
    if (_xmgc.usrNavBar == undefined) {
        _xmgc.usrNavBar = 'both';
    };
    $(document).ready(function() {
        _xmgc.addNavBar(_xmgc.usrNavBar);
    });
})();
