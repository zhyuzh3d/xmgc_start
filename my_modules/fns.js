/*扩展系统对象功能或者提供新功能
JSON.safeParse/JSON.sparse;
*/

var _fns = {};


//基础函数扩充---------------------------------------
/*扩展JSON.safeParse*/
JSON.safeParse = JSON.sparse = function(str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return undefined;
    };
};

/*扩展一个方法或对象*/
function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
};


/*重新封装console的函数*/
var cnslPreStr = '>';
console.xerr = function() {
    var args = arguments;
    console.info(cnslPreStr, 'ERR:');
    console.error.apply(this, args);
};
console.xlog = function() {
    var args = arguments;
    console.info(cnslPreStr, 'LOG:');
    console.log.apply(this, args);
};
console.xinfo = function() {
    var args = arguments;
    console.info(cnslPreStr, 'INFO:');
    console.info.apply(this, args);
};
console.xwarn = function() {
    var args = arguments;
    console.info(cnslPreStr, 'WARN:');
    console.xwarn.apply(this, args);
};


/*专用err处理函数,适合co().then()使用*/
global.__errhdlr = __errhdlr;

function __errhdlr(err) {
    console.xerr(err.stack);
};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global.__nullhdlr = __nullhdlr;

function __nullhdlr(res) {};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global.__infohdlr = __infohdlr;

function __infohdlr(res) {
    console.xinfo(res);
};

/*专用空函数，只纪录日志不做额外处理,适合co().then()使用*/
global.__loghdlr = __loghdlr;

function __loghdlr(res) {
    console.xlog(res);
};

/*生成不重复的key*/
global.__uuid = __uuid;

function __uuid() {
    return $uuid.v4();
};

/*md5加密
如果str为空，自动生成一个uuid
digest类型，hex默认,base64
*/
global.__md5 = __md5;

function __md5(str, dig) {
    if (!str) str = __uuid();
    if (!dig) dig = 'hex';
    return $crypto.createHash('md5').update(str).digest(dig)
};


/*sha1加密
如果str为空，自动生成一个uuid
digest类型，hex默认,base64
*/
global.__sha1 = __sha1;

function __sha1(str, dig) {
    if (!str) str = __uuid();
    if (!dig) dig = 'hex';
    return $crypto.createHash('md5').update(str).digest(dig)
};



/*生成标准的msg*/
global.__newMsg = __newMsg;

function __newMsg(code, text, data) {
    var info;
    if (text.constructor == Array) {
        if (text.length >= 2) {
            info = text[1];
        };
        text = text[0];
    };
    return {
        code: code,
        text: text,
        info: info,
        data: data,
        time: Number(new Date()),
    };
};


//重要函数------------------------------------
/*服务端向其他地址发起http请求的promise
成功执行resolvefn({headers:{...},body:'...'})
options应包含所有必需参数如hostname，port,method等等,例如
{
    hostname: 'rsf.qbox.me',
    port: 80,
    path: optpath,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': '',
    },
};
 */
_fns.httpReqPrms = httpReqPrms;

function httpReqPrms(options, bodydata) {
    var prms = new Promise(function(resolvefn, rejectfn) {
        var req = $http.request(options, (res) => {
            if (res.statusCode != 200) {
                rejectfn(new Error('Target server return err:' + res.statusCode));
            } else {
                res.setEncoding('utf8');
                var dat = {
                    headers: res.headers,
                    body: '',
                };
                res.on('data', (dt) => {
                    dat.body += dt;
                });
                res.on('end', () => {
                    resolvefn(dat);
                })
            };
        });

        req.on('error', (e) => {
            rejectfn(new Error('Request failed:' + e.message));
        });

        if (bodydata) {
            req.write(bodydata);
        };

        req.end();
    });

    return prms;
};

/*向指定目标发送一封邮件
默认以_xcfg.serMail.addr为发送邮箱
*/
var mailTransPort = $mailer.createTransport({
    host: _xcfg.serMail.host,
    port: _xcfg.serMail.port,
    auth: {
        user: _xcfg.serMail.addr,
        pass: _xcfg.serMail.pw,
    },
});

/*可以使用其它传输器，默认为serMail
 */
_fns.sendMail = sendMail;

function sendMail(tarmail, tit, cont) {
    var prms = new Promise(function(resolvefn, rejectfn, transport) {
        if (!transport) transport = mailTransPort;
        transport.sendMail({
            from: 'jscodepie servicegroup<' + _xcfg.serMail.addr + '>',
            to: tarmail,
            subject: tit,
            html: cont
        }, function(err, res) {
            (err) ? rejectfn(err) : resolvefn(res);
        });
    });
    return prms;
};




//导出模块
module.exports = _fns;
