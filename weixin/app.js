const express = require('express'), //express 框架 
      wechat  = require('./wechat/wechat'),
        query = require('./query/query'),
       config = require('./config');//引入配置文件
       
var app = express();//实例express框架

var wechatApp = new wechat(config); //实例wechat 模块
var queryApp = new query();

//用于处理所有进入 80 端口 get 的连接请求
app.get('/',function(req,res){
    wechatApp.auth(req,res);
});

//用于处理所有进入 80 端口 post 的连接请求
app.post('/',function(req,res){
    wechatApp.handleMsg(req,res);
});

//用于请求获取 access_token
app.get('/getAccessToken',function(req,res){
    wechatApp.getAccessToken().then(function(data){
        res.send(data);
    });    
});
app.use(express.static("public"));
//监听80端口


// 查询请求
app.post('/query',function (req,res) {
    queryApp.invitationQuery(req,res)
});
app.listen(80);