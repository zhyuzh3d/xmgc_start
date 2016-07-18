/*所有设置参数
必须在app文件夹外面有合法的xcfg.json用以保存私密参数
xcfg文件json的读写功能
*/

var _cfg = {};

//全局app路径
global.__path=$path.dirname(require.main.filename);

/*全局错误代码*/
var __errCode = global.__errCode = {
    APIERR: 8788, //API接口异常，未知错误
    NOTFOUND: 4312, //找不到目标
};

//导出模块
module.exports = _cfg;
