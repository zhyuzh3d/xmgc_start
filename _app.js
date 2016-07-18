/*专为其他App提供后端服务，如文件存储服务（qiniu）
 */
var _app = global._app = {};
_app.hostPort = 8000;

//外部库引入
var $http = global.$http = require('http');
var $https = global.$https = require('https');
var $fs = global.$fs = require('fs');
var $path = global.$path = require('path');
var $co = global.$co = require('co');
var $koa = global.$koa = require('koa');
var $router = global.$router = require('koa-router');
var $bodyParser = global.$bodyParser = require('koa-bodyparser');
var $cookie = global.$cookie = require('cookie');
var $crypto = global.$crypto = require('crypto');
//var $qiniu = global.$qiniu = require('qiniu');

//自定义库引入
global._ctnu = require('./my_modules/ctnu.js');
global._cfg = require('./my_modules/cfg.js');
//global._xcfg = require('../../xcfg.js');
global._fns = require('./my_modules/fns.js');
global._mdwr = require('./my_modules/mdwr.js');
global._rotr = require('./my_modules/rotr.js');

//global._qn = require('./mymodules/qn.js');

//服务器对象
var koaSvr = _app.koaSvr = $koa();
var httpSvr = _app.httpSvr = $http.createServer(koaSvr.callback());

//https服务器
var httpsOpt = {
    key: $fs.readFileSync(__path + '/ssl/privatekey.pem'),
    cert: $fs.readFileSync(__path + '/ssl/certificate.pem')
};
var httpsSvr = _app.httpsSvr = $https.createServer(httpsOpt, koaSvr.callback());
//httpSvr =httpsSvr;

/*读取外部xcfg文件写入_xfg全局参数
 */
(function () {
    _app.httpSvr.listen(_app.hostPort);
    //_qn.start();
    __infohdlr('Server is running on:' + _app.hostPort);
})();

/*使用body解析器
 */
koaSvr.use($bodyParser({
    onerror: function (err, ctx) {
        ctx.request.body = undefined;
        __errhdlr(err);
    }
}));

/*http请求中间件
 */
koaSvr.use(_mdwr);

/*http请求的路由控制
 */
koaSvr.use(_rotr.routes());
