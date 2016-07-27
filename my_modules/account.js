/*提供账号相关服务的接口*/
var _account = {};


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

        //注册用户,map_cls2id计数++,创建_usr-id，写入pw,phone
        var uid = yield _ctnu([_rds.cli, 'hincrby'], _rds.k.map_cls2id, 'usr', 1);
        var usrKey = _rds.k.usr(uid);
        var phoneMapKey = _rds.k.map_uphone2uid;

        var mu = _rds.cli.multi();
        mu.hset(usrKey, 'phone', phone);
        mu.hset(usrKey, 'pw', pw);
        mu.hset(phoneMapKey, phone, uid);
        mu.del(codeKey);
        var res = yield _ctnu([mu, 'exec']);

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
 * 向指定手机发送六位验证码
 * @param   {string} phone 目标手机，1开头11位数字
 * @returns {string} 六位验证码
 */

_account.sendPhoneCodeCo = function(phone) {
    var co = $co(function * () {
        //生成认证码
        var code = Math.floor(Math.random() * 1000000);

        //发送验证码
        var path = '/kingtto_media/106sms/106sms?mobile=' + phone + '&content=【项目工场】您的验证码是' + code + '，有效时间5分钟，请不要告诉他人';
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
