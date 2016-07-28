/*连接redis服务器
提供redis相关的基础功能函数
_cls（zset）键存储所有类型对象的autoid，由创建对象的时候incryby自动补齐
_map:key1.attr:key2.attr(hash/zset)存储各类映射检索，如果后者key2.attr是id数字，那么使用zset,否则使用hash
*/

var _rds = {};
var cli = _rds.cli = $redis.createClient(6379, 'localhost', {});


//全部key列表,所有映射map_开头,所有临时tmp_开头,所有对象直接写
_rds.k = {
    //存储类的自增id
    map_cls2id: '_map:cls:id',

    //用户手机号码到用户id映射
    map_uphone2uid: '_map:usr.phone:usr.id',

    //用户ukey到用户id的映射
    map_ukey2uid: '_map:usr.ukey:usr.id',


    //用户
    usr: function(id) {
        return 'usr-' + id;
    },



    //向用户发送的手机注册验证码
    tmp_phoneRegCode: function(phone) {
        return '_tmp:phoneRegCode-' + phone;
    },
    //向用户发送的手机注册验证码
    tmp_phoneRstCode: function(phone) {
        return '_tmp:phoneRstCode-' + phone;
    },
};


//导出模块
module.exports = _rds;
