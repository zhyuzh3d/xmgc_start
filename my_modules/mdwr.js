/*处理http请求进入路由之前的流程
如调整路径，检测用户user认证等
*/

var _mdwr = function* (next) {
    //可以在这里修改请求的路径或添加参数

    yield next;
};


//导出模块
module.exports = _mdwr;
