var mysql = require('mysql');
var db = {};
db.query = function  sqlback(sqllan,userId,fn) {
    var connection = mysql.createConnection({
        host:'*****',
        user:'*****',
        password:'*****',
        database:'*****',
        port:'****'
    });
    connection.connect(function (err) {
        if(err){
            // console.log(err);
            return;
        }
    });
    var sql = sqllan;
    if(!sql)return;

    connection.query(sql, userId, function(err, rows) {
        if (err){
            // console.log(err);
            return
        }
        fn(rows)
        // console.log('The solution is: ', rows[0].solution);
    });
    connection.end(function (err) {
        if(err){
            return
        }else{
            // console.log('连接失败')
        }
    });
}

//暴露出去
module.exports = db;