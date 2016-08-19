/*提供七牛云端文件存储服务接口*/
var _qn = {};

/*相关设置,关键密匙在外部xcfg.json*/
var cfg = {
    Port: 19110,
    Uptoken_Url: "/uptoken",
    Domain: "http://qiniu-plupload.qiniudn.com/",
    BucketName: "daimapai",
    BucketDomain: "http://files.m.xmgc360.com/",
};

_qn.cfg = cfg;


/*初始化七牛的访问密匙设置*/
$qiniu.conf.ACCESS_KEY = _xcfg.qiniu.ACCESS_KEY;
$qiniu.conf.SECRET_KEY = _xcfg.qiniu.SECRET_KEY;

/*初始化设置,依赖xcfg*/
_qn.start = function () {
    _app.httpSvr.listen(_qn.cfg.Port, function (err, dat) {
        __infohdlr("Qiniu:listening on port:" + _qn.cfg.Port);
    });
};



/*http接口：获取上传token的接口
随机文件名，不锁定路径
req:{fpath:'...'}
*/
_rotr.apis.getUploadToken2 = function () {
    var ctx = this;

    var co = $co(function* () {

        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        //根据uid授权路径的token
        var token = _qn.genUploadToken();
        var respdat = {
            uid: uid,
            domain: _qn.cfg.BucketDomain,
            uptoken: token,
        };
        ctx.body = __newMsg(1, 'OK', respdat);
        return ctx;
    });
    return co;
};

/*生成uptoken的函数
随机key*/
_qn.genUploadToken2 = genUploadToken2;

function genUploadToken2() {
    var pubPutPolicy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName);
    pubPutPolicy.returnBody = '{"name": $(fname),"size": $(fsize),"type": $(mimeType),"color": $(exif.ColorSpace.val),"key":$(key),"w": $(imageInfo.width),"h": $(imageInfo.height),"hash": $(etag)}';
    var token = pubPutPolicy.token();
    return token;
};




/*http接口：获取上传token的接口
存储锁定uid/...
每个用户单独的路径以用户id为编号，格式'../455/'
req:{fpath:'...'},不包含uid，格式如 myapp/index.html
*/
_rotr.apis.getUploadToken = function () {
    var ctx = this;

    var co = $co(function* () {
        var fpath = ctx.query.fpath || ctx.request.body.fpath;
        if (!fpath || fpath == '') throw Error('获取上传授权失败:文件名不能为空!');

        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        //根据uid授权路径的token
        var path = uid + '/' + fpath;
        var token = _qn.genUploadToken(path);
        var respdat = {
            uid: uid,
            path: path,
            domain: _qn.cfg.BucketDomain,
            url: _qn.cfg.BucketDomain + path,
            uptoken: token,
        };
        ctx.body = __newMsg(1, 'OK', respdat);
        return ctx;
    });
    return co;
};



/*生成uptoken的函数
指定key*/
_qn.genUploadToken = genUploadToken;

function genUploadToken(key) {
    var pubPutPolicy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName + ':' + key);
    pubPutPolicy.returnBody = '{"name": $(fname),"size": $(fsize),"type": $(mimeType),"color": $(exif.ColorSpace.val),"key":$(key),"w": $(imageInfo.width),"h": $(imageInfo.height),"hash": $(etag)}';
    var token = pubPutPolicy.token();
    return token;
};



/**
 * 获取访问token，以便于读取列表,锁定自己的目录uid/path
 * req:{path:'xxx'}
 * @returns {obj} {token:'xxx,path:'xxx',uid:'xxx',fpath:'xxx'}
 */
_rotr.apis.getAccToken = function () {
    var ctx = this;

    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var path = ctx.query.path || ctx.request.body.path;
        if (!path || path == '') throw Error('目录不能为空!');


        var fpath = uid + '/' + path;
        var token = $qiniu.util.generateAccessToken(fpath, null);

        var dat = {
            token: token,
            uid: uid,
            path: path,
            fpath: fpath,
        };

        ctx.body = __newMsg(1, 'OK', dat);
        return ctx;
    });
    return co;
};




/*获取文件夹列表
锁定用户的uid/folder路径
marker标识分页位置，即上一次显示到第几个
req:{path:'myfolder/subfolder/',limit:100,marker:'eyJjIjowLCJrIjoiM...'};
res:{domain:'xxx',items:[{hash:'xxx',key:'xxx',mimeType:'xxx',fsize:'xxx',putTime:'xxx'}]}
*/
_rotr.apis.getFileList = function () {
    var ctx = this;

    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var prefix = uid + '/';
        var path = ctx.query.path || ctx.request.body.path;
        if (path && path != '') prefix += path;
        var limit = ctx.query.limit || ctx.request.body.limit;
        var marker = ctx.query.marker || ctx.request.body.marker;

        var res = yield _qn.getFileListCo(prefix, limit, marker);

        var dat = JSON.safeParse(res.body);
        dat.domain = _qn.cfg.BucketDomain;

        ctx.body = __newMsg(1, 'OK', dat);

        return ctx;
    });
    return co;
};



/*单独函数，获取任意人的文件列表
prefix应该带uid，类似'4/myfolder/'
*/
_qn.getFileListCo = getFileListCo;

function getFileListCo(prefix, limit, marker) {
    var co = $co(function* () {

        var optpath = '/list?bucket=daimapai&prefix=' + encodeURI(prefix);
        if (!limit) limit = 100;
        optpath += '&limit=' + limit;
        if (marker && marker != '') optpath += '&marker=' + marker;

        //根据uid授权路径的token
        var options = {
            hostname: 'rsf.qbox.me',
            port: 80,
            path: optpath,
            method: 'GET',
            headers: {
                'Host': 'rsf.qbox.me',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '',
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);

        var res = yield _fns.httpReqPrms(options);

        return res;
    });
    return co;
};





/*http接口POST：上传字符串或数据，存储到七牛，返回文件url
自动覆盖已有文件，存储目录锁定/uid/...
req:{data,file};如果没有data则为空字符串，如果没有file则随机一个md5文件名;自动判断扩展名
res:{url:'bucketdomain/uid/file}
*/
_rotr.apis.uploadData = function () {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var data = ctx.request.body.data || ctx.query.data;
        var file = ctx.request.body.file || ctx.query.file;

        var filekey = uid + '/';
        (file) ? filekey += file: filekey += __md5();

        var res = yield _qn.uploadDataCo(data, filekey);
        if (!res || !res.key) throw Error('Upload data failed,cannot get url');

        ctx.ginfo.uploadData = res;
        ctx.body = __newMsg(1, 'ok', {
            url: _qn.cfg.BucketDomain + res.key,
        });
        return ctx;
    });
    return co;
};


/*单独函数uploaddata
返回七牛的结果*/
_qn.uploadDataCo = uploadDataCo;

function uploadDataCo(dat, filekey, extra) {
    var co = $co(function* () {
        //mime文件类型
        var fext = /\.[^\.]+/.exec(filekey);
        fext = (fext && fext.length > 0) ? fext[0] : '';
        if (!extra) extra = new $qiniu.io.PutExtra();
        extra.mimeType = _mime[fext];

        //token获取
        var policy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName + ':' + filekey);
        var token = policy.token();
        var res = yield _ctnu($qiniu.io.put, token, filekey, dat, extra);
        return res;
    });
    return co;
};



/*http接口POST：删除一个文件
验证key是否和当前uid匹配
req:{key:'...'};
res:{}
*/
_rotr.apis.deleteFile = function () {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var fkey = ctx.request.body.key || ctx.query.key;
        if (fkey.indexOf(uid + '/') != 0) throw Error('You can delete only your own file.')

        var res = yield _qn.deleteFileCo(fkey);
        if (!res) throw Error('Delete file faild.');

        ctx.body = __newMsg(1, 'ok');

        return ctx;
    });
    return co;
};


/*单独函数deleteFileCo*/
_qn.deleteFileCo = deleteFileCo;

function deleteFileCo(fkey) {
    var co = $co(function* () {
        var uri = $qiniu.util.urlsafeBase64Encode(cfg.BucketName + ':' + fkey);
        var optpath = '/delete/' + uri;

        //根据uid授权路径的token
        var options = {
            hostname: 'rs.qiniu.com',
            port: 80,
            path: optpath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '',
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);
        var res = yield _fns.httpReqPrms(options);

        return res;
    });
    return co;
};



/*只获取文件的信息，不读取文件，用来判断文件是否存在
不限定用户，可以检查任何用户的文件
req:{key:'...'},key格式1/appname/filename;
res:{fsize:'xx',hash:'xxx',mimeType:'xxx',putTime:'xxx'}
*/
_rotr.apis.getFileInfo = function () {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var fkey = ctx.request.body.key || ctx.query.key;
        if (!fkey) throw Error('File cant be undefined.')

        var res = yield _qn.getFileInfoCo(fkey);
        if (!res) throw Error('Delete file faild.');
        var dat = JSON.safeParse(res.body);

        ctx.body = __newMsg(1, 'ok', dat);

        return ctx;
    });
    return co;
};


/*函数:只获取文件的信息，不读取文件，用来判断文件是否存在
 */
_qn.getFileInfoCo = getFileInfoCo;

function getFileInfoCo(fkey) {
    var co = $co(function* () {
        var uri = $qiniu.util.urlsafeBase64Encode(cfg.BucketName + ':' + fkey);
        var optpath = '/stat/' + uri;

        //根据uid授权路径的token
        var options = {
            hostname: 'rs.qiniu.com',
            port: 80,
            path: optpath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '',
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);
        var res = yield _fns.httpReqPrms(options);

        return res;
    });
    return co;
};



/*接口：刷新资源，将源文件更新到CDN
默认CDN的更新是很慢的，必须要手动刷新才能立即更新
req:{key:'...'},key格式1/appname/filename;
res:七牛返回的数据
*/

_rotr.apis.refreshFile = function () {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey获取uid
        var uid = yield _fns.getUidByCtx(ctx);

        var fkey = ctx.request.body.key || ctx.query.key;
        if (!fkey) throw Error('File cant be undefined.');

        var res = yield _qn.refreshFileCo(fkey);


        if (!res) throw Error('refresh file faild.');
        var dat = JSON.safeParse(res.body);

        ctx.body = __newMsg(1, 'ok', dat);

        return ctx;
    });
    return co;
};


/*刷新文件的函数
 */
_qn.refreshFileCo = refreshFileCo;

function refreshFileCo(fkey) {
    var co = $co(function* () {
        var optpath = '/v2/tune/refresh';

        //根据uid授权路径的token
        var options = {
            hostname: 'fusion.qiniuapi.com',
            port: 80,
            path: optpath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '',
            },
        };

        var dat = {
            urls: [cfg.BucketDomain + fkey],
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);
        var res = yield _fns.httpReqPrms(options, dat);

        res.url = cfg.BucketDomain + fkey;
        return res;
    });
    return co;
};






//导出模块
module.exports = _qn;
