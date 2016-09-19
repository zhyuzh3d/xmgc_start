/*提供账号相关服务的接口*/
var _account = {};


/**
 * 使用手机验证码注册
 * @param {string} phone 11位电话号码
 * @param {string} code 6位验证码
 * @param {string} pw 32位Md5加密密码
 * @returns {usrObj} 用户对象
 */
_rotr.apis.regByPhone = function() {
    var ctx = this;

    var co = $co(function * () {
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone || !_cfg.regx.phone.test(phone)) throw Error('手机号码格式错误.');

        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw || !_cfg.regx.pw.test(pw)) throw Error('密码格式错误.');

        var phoneCode = ctx.query.phoneCode || ctx.request.body.phoneCode;
        if (!phoneCode || !_cfg.regx.phoneCode.test(phoneCode)) throw Error('验证码格式错误.');

        //检查验证码
        var codeKey = _rds.k.tmp_phoneRegCode(phone);
        var rdsPhoneCode = yield _ctnu([_rds.cli, 'get'], codeKey);
        if (rdsPhoneCode != phoneCode) throw Error('验证码错误，请重试.');

        //注册用户,map_cls2id计数++,创建_usr-id，
        var uid = yield _ctnu([_rds.cli, 'hincrby'], _rds.k.map_cls2id, 'usr', 1);
        var usrKey = _rds.k.usr(uid);
        var phoneMapKey = _rds.k.map_uphone2uid;
        var ukey = __uuid();

        //写入rds数据库usr类pw,phone，并更新ukey:uid
        var mu = _rds.cli.multi();
        mu.hset(_rds.k.map_ukey2uid, ukey, uid);

        mu.hset(usrKey, 'id', uid);
        mu.hset(usrKey, 'phone', phone);
        mu.hset(usrKey, 'pw', pw);
        mu.hset(usrKey, 'ukey', ukey);
        mu.hset(phoneMapKey, phone, uid);
        mu.del(codeKey);
        var res = yield _ctnu([mu, 'exec']);

        //将用户身份识别key写入用户浏览器,所有cookie都以m_开头，避免和xmgc冲突
        ctx.cookies.set('m_ukey', undefined, {
            httpOnly: true,
            expires: new Date((new Date()).getTime() - 60000),
        });
        ctx.cookies.set('m_ukey', ukey, {
            httpOnly: true,
            domain: '.xmgc360.com',
            expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
        });

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};



/**
 * 通过ukey获取uid，供其他模块服务器调用，比getMyinfo更快速，不读取用户信息
 * 支持url的ukey参数或post数据的ukey,或者cookie
 * @returns {int} 用户id
 */
_rotr.apis.getUidByUkey = function() {
    var ctx = this;
    ctx.enableJsonp = true;
    ctx.jsonpDomains = 'all';

    var co = $co(function * () {

        var ukey = ctx.query.ukey || ctx.request.body.ukey;

        if (!ukey) ukey = ctx.cookies.get('m_ukey');
        if (!ukey || !_cfg.regx.ukey.test(ukey)) throw Error('ukey不能为空.');

        //登陆情况，读取用户id
        var mpkey = _rds.k.map_ukey2uid;
        var uid = yield _ctnu([_rds.cli, 'hget'], _rds.k.map_ukey2uid, ukey);

        //未登录情况,清除ukey并返回错误
        if (!uid) {
            ukey = undefined;
            ctx.cookies.set('m_ukey', ukey, {
                httpOnly: true,
                domain: '.xmgc360.com',
                expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
            });
            throw Error('错误或无效的登录信息，请您手工登陆或注册.')
        }

        //返回uid
        var dat = {
            uid: uid
        };

        //返回数据
        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
}




/**
 * 获取用户自己信息的接口，可以用来检测是否已经登陆,根据cookie里面的m_ukey判断
 * @returns {usr} 用户基础信息对象{id:12,phone:...,...}
 */
_rotr.apis.getMyInfo = function() {
    var ctx = this;
    ctx.enableJsonp = true;
    ctx.jsonpDomains = 'all';

    var co = $co(function * () {
        var msg;

        //检测是否存在账号ukey，
        var ukey = ctx.cookies.get('m_ukey');
        if (!ukey) throw Error('没找到您的登录信息，请重新登陆或注册.');


        //登陆情况，读取用户id
        var mpkey = _rds.k.map_ukey2uid;
        var uid = yield _ctnu([_rds.cli, 'hget'], _rds.k.map_ukey2uid, ukey);

        //未登录情况,清除ukey并返回错误
        if (!uid) {
            ukey = undefined;
            ctx.cookies.set('m_ukey', ukey, {
                httpOnly: true,
                domain: '.xmgc360.com',
                expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
            });
            throw Error('错误或无效的登录信息，请您手工登陆或注册.')
        }

        //读取用户全部信息，仅返回部分安全信息
        var dat = yield _account.getUsrInfoCo(uid);
        dat.ukey = undefined;

        //对用户的phone字段做隐藏134******37
        dat.phone = dat.phone.substr(0, 3) + '******' + dat.phone.substr(dat.phone.length - 2);

        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
};



/**
 * 保存用户自己信息的接口,根据cookie里面的m_ukey判断
 * @returns {null}
 */
_rotr.apis.saveProfile = function() {
    var ctx = this;

    var co = $co(function * () {
        var msg;

        //检测是否存在账号ukey，
        var ukey = ctx.cookies.get('m_ukey');
        if (!ukey) throw Error('没找到您的登录信息，请重新登陆或注册.')

        //登陆情况，读取用户id
        var mpkey = _rds.k.map_ukey2uid;
        var uid = yield _ctnu([_rds.cli, 'hget'], _rds.k.map_ukey2uid, ukey);

        //未登录情况,清除ukey并返回错误
        if (!uid) {
            ukey = undefined;
            ctx.cookies.set('m_ukey', ukey, {
                httpOnly: true,
                domain: '.xmgc360.com',
                expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
            });
            throw Error('错误或无效的登录信息，请您手工登陆或注册.')
        }

        var usrkey = _rds.k.usr(uid);
        var mu = _rds.cli.multi();

        //仅保存限定的信息
        var nick = ctx.query.nick || ctx.request.body.nick;
        if (nick && _cfg.regx.nick.test(nick)) {
            mu.hset(usrkey, 'nick', nick);
        };

        var color = ctx.query.color || ctx.request.body.color;
        if (color && _cfg.regx.color.test(color)) {
            mu.hset(usrkey, 'color', color);
        };

        var icon = ctx.query.icon || ctx.request.body.icon;
        if (icon && _cfg.regx.icon.test(icon)) {
            mu.hset(usrkey, 'icon', icon);
        };

        var avatar = ctx.query.avatar || ctx.request.body.avatar;
        if (icon && _cfg.regx.avatar.test(avatar)) {
            mu.hset(usrkey, 'avatar', avatar);
        };

        var res = yield _ctnu([mu, 'exec']);

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};




/**
 * 使用手机号和密码登录
 * @param {string} phone 用户手机号
 * @param {string} pw 加密后的密码，应该32位
 * @returns {usrObj} 用户基本信息
 */

_rotr.apis.loginByPhone = function() {
    var ctx = this;

    var co = $co(function * () {
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone || !_cfg.regx.phone.test(phone)) throw Error('手机号码格式错误.');

        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw || !_cfg.regx.pw.test(pw)) throw Error('密码格式错误.');

        //验证
        var uid = yield _ctnu([_rds.cli, 'hget'], _rds.k.map_uphone2uid, phone);
        if (!uid) throw Error('找不到这个手机号对应的账号.');

        var usrkey = _rds.k.usr(uid);
        var dbpw = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pw');
        if (!dbpw) throw Error('账号异常，请尝试找回密码.');

        if (pw != dbpw) throw Error('密码不匹配，登陆失败.');

        //读取信息
        var dat = yield _account.getUsrInfoCo(uid);

        //删除旧版本的cookie
        ctx.cookies.set('m_ukey');

        //将用户身份识别key写入用户浏览器,所有cookie都以m_开头，避免和xmgc冲突
        ctx.cookies.set('m_ukey', dat.ukey, {
            httpOnly: true,
            domain: '.xmgc360.com',
            expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
        });
        dat.ukey = undefined;

        //返回数据
        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
};




/**
 * 读取用户基本信息的Co
 * @param   {uid} uid 用户id
 * @returns {usrObj} 用户数据对象
 */

_account.getUsrInfoCo = function(uid) {
    var co = $co(function * () {
        var res;
        var dbusr = yield _ctnu([_rds.cli, 'hgetall'], _rds.k.usr(uid));
        if (!dbusr) throw Error('获取用户数据信息失败.');
        res = {
            id: dbusr.id,
            phone: dbusr.phone,
            ukey: dbusr.ukey,
            nick: dbusr.nick,
            color: dbusr.color,
            icon: dbusr.icon,
            avatar: dbusr.avatar
        }

        return res;
    });
    return co;
}





/**
 * 注销账号，只是把浏览器的m_ukey清空
 * @returns {null}
 */
_rotr.apis.loginOut = function() {
    var ctx = this;

    var co = $co(function * () {
        var msg;

        ctx.cookies.set('m_ukey', undefined, {
            httpOnly: true,
            domain: '.xmgc360.com',
            expires: new Date((new Date()).getTime() - 60000),
        });

        //兼容旧有的未指定域名的key
        ctx.cookies.set('m_ukey', undefined, {
            httpOnly: true,
            expires: new Date((new Date()).getTime() - 60000),
        });

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};


/**
 * 向用户手机发送注册验证码的接口
 * 检查map_uphone2uid
 * 写入tmp_phoneRegCode
 * @returns {null} null
 */

_rotr.apis.getPhoneRegCode = function() {
    var ctx = this;

    var co = $co(function * () {
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone || !_cfg.regx.phone.test(phone)) throw Error('手机号码格式错误.');

        //检查电话号码是否已经被注册
        var mapKey = _rds.k.map_uphone2uid;
        var hasUsed = yield _ctnu([_rds.cli, 'hget'], mapKey, phone);
        if (hasUsed) throw Error('电话号码已经被注册，您可以直接使用这个电话号码登陆.');

        //检查上一次发送的验证码是否过期
        var codeKey = _rds.k.tmp_phoneRegCode(phone);
        var hasSend = yield _ctnu([_rds.cli, 'EXISTS'], codeKey);
        if (hasSend) throw Error('您已经发送过验证码，请不要重复发送.');

        //发送验证码并记录到redis设定过期时间
        var code = yield _account.sendPhoneCodeCo(phone);
        _rds.cli.setex(codeKey, _cfg.dur.phoneCode, code);

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};


/**
 * 向用户手机发送重置密码验证码的接口
 * 检查map_uphone2uid
 * 写入tmp_phoneRstCode
 * @returns {null} null
 */

_rotr.apis.getPhoneRstCode = function() {
    var ctx = this;

    var co = $co(function * () {
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone || !_cfg.regx.phone.test(phone)) throw Error('手机号码格式错误.');

        //检查电话号码是否已经被注册
        var mapKey = _rds.k.map_uphone2uid;
        var hasUsed = yield _ctnu([_rds.cli, 'hget'], mapKey, phone);
        if (!hasUsed) throw Error('电话号码尚未被注册，您可以直接使用这个电话号码注册新用户.');

        //检查上一次发送的验证码是否过期
        var codeKey = _rds.k.tmp_phoneRstCode(phone);
        var hasSend = yield _ctnu([_rds.cli, 'EXISTS'], codeKey);
        if (hasSend) throw Error('您已经发送过验证码，请不要重复发送.');

        //发送验证码并记录到redis设定过期时间
        var code = yield _account.sendPhoneCodeCo(phone);
        _rds.cli.setex(codeKey, _cfg.dur.phoneCode, code);

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};



/**
 * 重置密码，使用手机号码验证码重置,成功并自动登陆
 * @returns {null} 无，前端可单独请求getMyInfo接口获取信息
 */
_rotr.apis.rstPwByPhone = function() {
    var ctx = this;

    var co = $co(function * () {
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone || !_cfg.regx.phone.test(phone)) throw Error('手机号码格式错误.');

        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw || !_cfg.regx.pw.test(pw)) throw Error('密码格式错误.');

        var phoneCode = ctx.query.phoneCode || ctx.request.body.phoneCode;
        if (!phoneCode || !_cfg.regx.phoneCode.test(phoneCode)) throw Error('验证码格式错误.');

        //检查验证码
        var codeKey = _rds.k.tmp_phoneRstCode(phone);
        var rdsPhoneCode = yield _ctnu([_rds.cli, 'get'], codeKey);
        if (rdsPhoneCode != phoneCode) throw Error('验证码错误，请重试.');

        //用手机号获取用户id
        var uid = yield _ctnu([_rds.cli, 'hget'], _rds.k.map_uphone2uid, phone);
        var usrKey = _rds.k.usr(uid);

        //将新密码写入数据库usr.pw，返回值仅是新增属性个数，为0
        yield _ctnu([_rds.cli, 'hset'], usrKey, 'pw', pw);

        //获取用户ukey
        var ukey = yield _ctnu([_rds.cli, 'hget'], usrKey, 'ukey');

        //将用户身份识别key写入用户浏览器,所有cookie都以m_开头，避免和xmgc冲突
        ctx.cookies.set('m_ukey', ukey, {
            httpOnly: true,
            domain: '.xmgc360.com',
            expires: new Date((new Date()).getTime() + _cfg.dur.browserUkey),
        });

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};




/**
 * 向指定手机发送六位验证码
 * @param   {string} phone 目标手机，1开头11位数字
 * @returns {string} 六位验证码
 */

_account.sendPhoneCodeCo = function(phone) {
    var co = $co(function * () {
        //生成认证码
        var code = String(Math.random()).substr(2, 6);
        if (code.length < 6) {
            var n = 6 - code.length;
            for (var i = 0; i < n; i++) {
                code += '0';
            }
        };

        //发送验证码
        var minit = _cfg.dur.phoneCode / 60;
        var path = '/kingtto_media/106sms/106sms?mobile=' + phone;
        path += '&content=【项目工场】您的验证码是' + code + '，有效时间' + minit + '分钟，请不要告诉他人';
        path += '&tag=2'; //json格式返回
        path = encodeURI(path);
        var opt = {
            hostname: 'apis.baidu.com',
            port: 80,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': _xcfg.baidu.apikey,
            },
        };

        var res = yield _fns.httpReqPrms(opt);
        return code;
    });
    return co;
}




//导出模块
module.exports = _account;
