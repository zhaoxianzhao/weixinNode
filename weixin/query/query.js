'use strict' //设置为严格模式

const mysql = require('../wechat/TestMysql'); //引入mysql
var Query = function () {

};
Query.prototype.invitationQuery = function (req, res, next) {
    // var opinVal = '' + req.query.value + '';
    var queryList = []; //返回的数据
    var str = ""; //监听接口返回值
    var opinVal = ''; //openID
    var SqlSentence = ''; //sql 语句
    req.on("data", function (dt) {
        str += dt
    })
    req.on("end", function () {
        opinVal = str.substr(str.indexOf('=') + 1);
        if (opinVal === '' || opinVal=== null){
            SqlSentence = 'SELECT * FROM tb_zykj_merchants_users'
        }else{
            SqlSentence = 'SELECT * FROM tb_zykj_merchants_users WHERE user_openid=?'
        }
            mysql.query(SqlSentence, opinVal, function (err, results) {
                //循环查询保存一个数组
                for (let i = 0; i < err.length; i++) {
                    queryList.push({
                        name: err[i].user_login,
                        userNicename: err[i].user_nicename,
                        time: err[i].create_time,
                        openid:err[i].openid,
                    })
                }
                res.send(queryList);
            })
    })


}
//暴露可供外部访问的接口
module.exports = Query;