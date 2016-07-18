/*提供七牛云端文件存储服务接口*/
var _qn = {};

/*相关设置,关键密匙在外部xcfg.json*/
var cfg = {
    Port: 19110,
    Uptoken_Url: "/uptoken",
    Domain: "http://qiniu-plupload.qiniudn.com/",
    BucketName: "tenkpubfiles",
    BucketDomain: "http://pubfiles.10knet.com",
};

_qn.cfg = cfg;


/*初始化七牛的访问密匙设置*/
$qiniu.conf.ACCESS_KEY = _xcfg.qiniu.ACCESS_KEY;
$qiniu.conf.SECRET_KEY = _xcfg.qiniu.SECRET_KEY;

/*初始化设置,依赖xcfg*/
_qn.start = function() {
    _app.httpSvr.listen(_qn.cfg.Port, function(err, dat) {
        __infohdlr("Qiniu:listening on port:" + _qn.cfg.Port);
    });
};


/*获取上传token的接口
 */
_rotr.apis.getUploadToken = function() {
    var ctx = this;

    var co = $co(function * () {
        var key = ctx.query.key || ctx.request.body.key;

        var token = _qn.genUploadToken(key);
        var respdat = {
            key: key,
            domain: _qn.cfg.BucketDomain,
            uptoken: token,
        };
        ctx.body = respdat;
        ctx.xdat.getUploadToken = respdat;
        return ctx;
    });
    return co;
};

/*生成uptoken的函数*/
_qn.genUploadToken = genUploadToken;

function genUploadToken(key) {
    var pubPutPolicy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName);
    pubPutPolicy.returnBody = '{"name": $(fname),"size": $(fsize),"type": $(mimeType),"color": $(exif.ColorSpace.val),"key":$(key),"w": $(imageInfo.width),"h": $(imageInfo.height),"hash": $(etag)}';
    var token = pubPutPolicy.token();
    return token;
};


//导出模块
module.exports = _qn;
