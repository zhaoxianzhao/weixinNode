'use strict' //设置为严格模式

const crypto = require('crypto'), //引入加密模块
    https = require('https'), //引入 https 模块
    http = require('http'), //引入 http 模块
    util = require('util'), //引入 util 工具包
    fs = require('fs'), //引入 fs 模块
    pathth = require('path'), //引入 fs 模块
    urltil = require('url'),//引入 url 模块
    accessTokenJson = require('./access_token'), //引入本地存储的 access_token
    menus = require('./menus'), //引入微信菜单配置
    parseString = require('xml2js').parseString,//引入xml2js包
    msg = require('./msg'),//引入消息处理模块
    CryptoGraphy = require('./cryptoGraphy'), //微信消息加解密模块
    mysql = require('./TestMysql'), //引入mysql
    sql = require('mysql'),//引入mysql
    request = require('request'),//http请求库
    formstream = require('formstream'),//http发送post请求构造表单数据的库
    qr = require('qr-image');//二维码


/**
 * 构建 WeChat 对象 即 js中 函数就是对象
 * @param {JSON} config 微信配置文件
 */
var WeChat = function (config) {
    //设置 WeChat 对象属性 config
    this.config = config;
    //设置 WeChat 对象属性 token
    this.token = config.token;
    //设置 WeChat 对象属性 appID
    this.appID = config.appID;
    //设置 WeChat 对象属性 appScrect
    this.appScrect = config.appScrect;
    //设置 WeChat 对象属性 apiDomain
    this.apiDomain = config.apiDomain;
    //设置 WeChat 对象属性 apiURL
    this.apiURL = config.apiURL;

    /**
     * 用于处理 https Get请求方法
     * @param {String} url 请求地址
     */
    this.requestGet = function (url) {
        return new Promise(function (resolve, reject) {
            https.get(url, function (res) {
                var buffer = [], result = "";
                //监听 data 事件
                res.on('data', function (data) {
                    buffer.push(data);
                });
                //监听 数据传输完成事件
                res.on('end', function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    //将最后结果返回
                    resolve(result);
                });
            }).on('error', function (err) {
                reject(err);
            });
        });
    }

    /**
     * 用于处理 https Post请求方法
     * @param {String} url  请求地址
     * @param {JSON} data 提交的数据
     */
    this.requestPost = function (url, data) {
        return new Promise(function (resolve, reject) {
            //解析 url 地址
            var urlData = urltil.parse(url);
            //设置 https.request  options 传入的参数对象
            var options = {
                //目标主机地址
                hostname: urlData.hostname,
                //目标地址 
                path: urlData.path,
                //请求方法
                method: 'POST',
                //头部协议
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data, 'utf-8')
                }
            };
            var req = https.request(options, function (res) {
                var buffer = [], result = '';
                //用于监听 data 事件 接收数据
                res.on('data', function (data) {
                    buffer.push(data);
                });
                //用于监听 end 事件 完成数据的接收
                res.on('end', function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                })
            })
            //监听错误事件
                .on('error', function (err) {
                    // console.log(err);
                    reject(err);
                });
            //传入数据
            req.write(data);
            req.end();
        });
    }
    // /**
    //  * 获取到的头像下载到本地
    //  * @param url 头像地址
    //  * @constructor
    //  */
    // this.HeadPortrait = function (url) {
    //     this.url = url;
    //     return function (re) {
    //         var headurl = util.format(this.url);
    //         http.get(headurl, function (res) {
    //             res.setEncoding("binary");
    //             var result = "";
    //             //监听 data 事件
    //             res.on('data', function (data) {
    //                 result += data;
    //             });
    //             //监听 数据传输完成事件
    //             res.on('end', function () {
    //                 // result = Buffer.concat(buffer).toString('utf-8');
    //                 //将最后结果返回
    //                 // console.log(result);
    //                 fs.writeFile("./public/images/Headportrait/1231.png", result, "binary", function (err) {
    //                     if (err) {
    //                         console.log("保存失败");
    //                     }
    //                     re('./public/images/Headportrait/1231.png"')
    //                 });
    //             });
    //         }).on('error', function (err) {
    //         });
    //     }
    // }
    /**
     * 用于处理 数据更新
     * @param {String} url 请求地址
     */
    this.Datapdate = function (fromUser) {
        var URLLL = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + accessTokenJson.access_token + '&openid=' + fromUser + '&lang=zh_CN';
        var url = util.format(URLLL);
        this.requestGet(url).then(function (data) {
            var userList = JSON.parse(data);
            var newDate = new Date();
            newDate.setTime(userList.subscribe_time * 1000);
            var follow_time = newDate.format('yyyy/MM/dd hh:mm:ss')
            var sqlString = {
                user_login: '' + userList.nickname + '',
                create_time: '' + follow_time + '',
                avatar: '' + userList.headimgurl + '',
                address: '' + userList.country + '',
                cityid: '' + userList.province + '',
                countyid: '' + userList.city + '',
                sex: userList.sex,
                openid: '' + userList.openid + '',
                unionid: '' + userList.unionid + ''
            }
            mysql.query('update biao set ? where openid=' + sql.escape(userList.openid) + '', sqlString, function (err, results) {
                if (err) {
                    // console.log(err);
                    return;
                }
            });
        });
    }

}
/**
 * 时间戳转化时间
 * @param nS：参数（传入的时间戳）
 * @returns {string}  返回一个时间年月日
 */
Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}
/**
 * 微信接入验证
 * @param {Request} req Request 对象
 * @param {Response} res Response 对象
 */
WeChat.prototype.auth = function (req, res) {

    var that = this;
    this.getAccessToken().then(function (data) {
        //格式化请求连接
        var url = util.format(that.apiURL.createMenu, that.apiDomain, data);
        //使用 Post 请求创建微信菜单
        // console.log(menus);
        that.requestPost(url, JSON.stringify(menus)).then(function (data) {
            //将结果打印
            // console.log(data);
        });
    });

    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    var signature = req.query.signature,//微信加密签名
        timestamp = req.query.timestamp,//时间戳
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [this.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
        res.send(echostr);
    } else {
        // res.redirect('./index.html');
        res.send('zhaoxian')
    }
}

/**
 * 获取微信 access_token
 */
WeChat.prototype.getAccessToken = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        //获取当前时间 
        var currentTime = new Date().getTime();
        //格式化请求地址
        var url = util.format(that.apiURL.accessTokenApi, that.apiDomain, that.appID, that.appScrect);
        //判断 本地存储的 access_token 是否有效
        if (accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime) {
            that.requestGet(url).then(function (data) {
                var result = JSON.parse(data);
                if (data.indexOf("errcode") < 0) {
                    accessTokenJson.access_token = result.access_token;
                    accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                    //更新本地存储的
                    fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));
                    //将获取后的 access_token 返回
                    resolve(accessTokenJson.access_token);
                } else {
                    //将错误返回
                    resolve(result);
                }
            });
        } else {
            //将本地存储的 access_token 返回
            resolve(accessTokenJson.access_token);
        }
    });
}


// 封装一个post请求方法
WeChat.prototype.uploadPost = function (url, data) {
    return new Promise(function (resolve, reject) {
        request.post({url: url, formData: data}, function (err, httpResponse, body) {
            resolve(body);
        })
    })
}

// 素材上传
WeChat.prototype.uploadFile = function (urlPath, type) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.getAccessToken().then(function (data) {
            var form = { //构造表单
                media: fs.createReadStream(urlPath)
            }
            var url = util.format(that.apiURL.uploadFile, that.apiDomain, data, type);
            that.uploadPost(url, form).then(function (result) {
                // console.log(result);
                resolve(JSON.parse(result).media_id);
            })
        })
    })
}
/**
 * 微信消息处理
 * @param {Request} req Request 对象
 * @param {Response} res Response 对象
 */
WeChat.prototype.handleMsg = function (req, res) {
    var buffer = [], that = this;

    //实例微信消息加解密
    var cryptoGraphy = new CryptoGraphy(that.config, req);

    //监听 data 事件 用于接收数据
    req.on('data', function (data) {
        buffer.push(data);
    });
    //监听 end 事件 用于处理接收完成的数据
    req.on('end', function () {
        var msgXml = Buffer.concat(buffer).toString('utf-8');
        //解析xml
        parseString(msgXml, {explicitArray: false}, function (err, result) {
            if (!err) {
                result = result.xml;
                //判断消息加解密方式
                if (req.query.encrypt_type == 'aes') {
                    //对加密数据解密
                    result = cryptoGraphy.decryptMsg(result.Encrypt);
                }
                var toUser = result.ToUserName; //接收方微信
                var fromUser = result.FromUserName;//发送方微信(openid)
                var reportMsg = ""; //声明回复消息的变量
                var openidList = [];//定义一个空数组，用于判断是否有该用户的存储

                //判断消息类型
                if (result.MsgType.toLowerCase() === "event") {
                    //判断消息是否是关注类型
                    if (result.Event.toLowerCase() === 'subscribe') {
                        var contens = "欢迎关注北京掌盈科技有限公司";
                        reportMsg = msg.txtMsg(fromUser, toUser, contens);
                        //判断消息加解密方式，如果未加密则使用明文，对明文消息进行加密
                        reportMsg = req.query.encrypt_type == 'aes' ? cryptoGraphy.encryptMsg(reportMsg) : reportMsg;
                        //返回给微信服务器
                        res.send(reportMsg);
                        //查询数据openid
                        mysql.query('SELECT * FROM biao WHERE openid=?', fromUser, function (err, results) {
                            //循环查询保存一个数组
                            for (let i = 0; i < err.length; i++) {
                                openidList.push(err[i].openid)
                            }
                            //判断是否有这个用户
                            /*
                            * URLLL = '微信请求笛子
                            * url格式化请求
                            * */
                            var URLLL = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + accessTokenJson.access_token + '&openid=' + fromUser + '&lang=zh_CN';
                            var url = util.format(URLLL);
                            if (openidList.indexOf(fromUser) === -1) {
                                //没有用户就执行存储
                                //获取信息
                                that.requestGet(url).then(function (data) {
                                    var userList = JSON.parse(data);
                                    var newDate = new Date();
                                    newDate.setTime(userList.subscribe_time * 1000);
                                    var follow_time = newDate.format('yyyy/MM/dd hh:mm:ss');
                                    var sqlString = {}
                                    if (userList.qr_scene_str === '' || userList.qr_scene_str === undefined || userList.qr_scene_str === null) {
                                        sqlString = {
                                            user_login: '' + userList.nickname + '',
                                            create_time: '' + follow_time + '',
                                            avatar: '' + userList.headimgurl + '',
                                            address: '' + userList.country + '',
                                            cityid: '' + userList.province + '',
                                            countyid: '' + userList.city + '',
                                            sex: userList.sex,
                                            openid: '' + userList.openid + '',
                                            unionid: '' + userList.unionid + ''
                                        }
                                    } else {
                                        var Recommend = JSON.parse(userList.qr_scene_str); //推荐者信息
                                        sqlString = {
                                            user_openid: '' + Recommend.openid + '',
                                            user_nicename: '' + Recommend.userName + '',
                                            user_login: '' + userList.nickname + '',
                                            create_time: '' + follow_time + '',
                                            avatar: '' + userList.headimgurl + '',
                                            address: '' + userList.country + '',
                                            cityid: '' + userList.province + '',
                                            countyid: '' + userList.city + '',
                                            sex: userList.sex,
                                            openid: '' + userList.openid + '',
                                            unionid: '' + userList.unionid + ''
                                        }
                                    }
                                    mysql.query('INSERT into biao  SET ?', sqlString, function (err, results) {
                                        if (err) {
                                            // console.log(err);
                                            return;
                                        }
                                    });
                                });
                            } else {
                                //对已经存在的用户进行更新
                                that.Datapdate(fromUser);
                            }
                        })
                    }
                    if (result.Event.toLowerCase() === 'click') {
                        that.Datapdate(fromUser);
                        if (result.EventKey === 'QR_code') {
                            //回复消息
                            var content = "正在生成您的专属二维码，请稍后（不要重复点击获取）";
                            reportMsg = msg.txtMsg(fromUser, toUser, content);
                            //判断消息加解密方式，如果未加密则使用明文，对明文消息进行加密
                            reportMsg = req.query.encrypt_type == 'aes' ? cryptoGraphy.encryptMsg(reportMsg) : reportMsg;
                            //返回给微信服务器
                            res.send(reportMsg);
                            var userLoginList = [];
                            var sqlqrcode = '';
                            var qrcodeTime = '';
                            mysql.query('SELECT * FROM biao WHERE openid=?', fromUser, function (err, results) {
                                //循环查询保存一个数组
                                for (let i = 0; i < err.length; i++) {
                                    userLoginList.push(err[i].user_login);
                                    sqlqrcode = err[0].qrcode;
                                    qrcodeTime = err[0].qrcode_time;
                                }
                                if (sqlqrcode === '' || sqlqrcode === undefined || sqlqrcode === null || new Date().getTime() - qrcodeTime > 2592000000) {
                                    //推荐人信息
                                    var Referee = {
                                        userName: userLoginList[0],
                                        openid: fromUser
                                    };
                                    //二维码参数
                                    var QRCodeUrlJSON = {
                                        "expire_seconds": 2592000,
                                        "action_name": "QR_STR_SCENE",
                                        "action_info": {
                                            "scene": {
                                                "scene_str": JSON.stringify(Referee)
                                            }
                                        }
                                    };
                                    var QRCodeUrl = util.format(that.apiDomain + 'cgi-bin/qrcode/create?access_token=' + accessTokenJson.access_token);
                                    that.requestPost(QRCodeUrl, JSON.stringify(QRCodeUrlJSON)).then(function (data) {
                                        var QRCode = JSON.parse(data);
                                        var qr_png = qr.image(QRCode.url, {type: 'png', size: 6});
                                        var imgName = +(new Date()) + '' + Math.ceil(Math.random() * 89 + 10);
                                        var imgNameJpg = `${imgName}.jpg`;
                                        imgName = `${imgName}.png`;
                                        var qr_pipe = qr_png.pipe(fs.createWriteStream('./public/QRcodeImg/' + imgName));


                                        qr_pipe.on('error', function (err) {
                                            // console.log(err);
                                            return;
                                        });
                                        qr_pipe.on('finish', function () {


                                            /**
                                             * 简单不带logo版
                                             * @type {string}
                                             */

                                            // var pathUrl = pathth.join(__dirname, '../public/QRcodeImg/' + imgNameJpg);
                                            // that.uploadFile(pathUrl, 'image').then(function (mdeia_id) {
                                            //     var customService = util.format(that.apiURL.customService, that.apiDomain, accessTokenJson.access_token);
                                            //     //创建临时素材
                                            //     var customNews = {
                                            //         "touser": fromUser,
                                            //         "msgtype": "image",
                                            //         "image":
                                            //             {
                                            //                 "media_id": mdeia_id
                                            //             }
                                            //     };
                                            //     that.requestPost(customService, JSON.stringify(customNews)).then(function (data) {
                                            //         //将结果打印
                                            //         var sqlString = {
                                            //             qrcode: '' + pathUrl + '',
                                            //             qrcode_time: '' + new Date().getTime() + '',
                                            //         }
                                            //         mysql.query('update biao set ? where openid=' + sql.escape(fromUser) + '', sqlString, function (err, results) {
                                            //             if (err) {
                                            //                 // console.log(err);
                                            //                 return;
                                            //             }
                                            //         });
                                            //     });
                                            // });








                                            var NewPathUrl = pathth.join(__dirname, '../public/QRcodeImg/' + imgName);
                                            console.log(NewPathUrl);
                                            var logo = pathth.join(__dirname, '../public/images/logo_50.jpg');
                                            var sharp = require("sharp");//图片插件
                                            var zhao = sharp(NewPathUrl)
                                                .resize(246,246)
                                                .overlayWith(logo, { gravity: sharp.gravity.southeast,top: 98,left:98} )
                                                .toFile('./public/QRcodeImg/'+imgNameJpg, function(err) {
                                                    if (err) {
                                                        throw err;
                                                    }else{
                                                        var pathUrl = pathth.join(__dirname, '../public/QRcodeImg/' + imgNameJpg);
                                                        that.uploadFile(pathUrl, 'image').then(function (mdeia_id) {
                                                            var customService = util.format(that.apiURL.customService, that.apiDomain, accessTokenJson.access_token);
                                                            //创建临时素材
                                                            var customNews = {
                                                                "touser": fromUser,
                                                                "msgtype": "image",
                                                                "image":
                                                                    {
                                                                        "media_id": mdeia_id
                                                                    }
                                                            };
                                                            that.requestPost(customService, JSON.stringify(customNews)).then(function (data) {
                                                                //将结果打印
                                                                var sqlString = {
                                                                    qrcode: '' + pathUrl + '',
                                                                    qrcode_time: '' + new Date().getTime() + '',
                                                                }
                                                                mysql.query('update biao set ? where openid=' + sql.escape(fromUser) + '', sqlString, function (err, results) {
                                                                    if (err) {
                                                                        // console.log(err);
                                                                        return;
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }
                                                })






                                            /**
                                             * 这个方法不支持linux
                                             */
                                            //
                                            // var images = require("images");//图片插件
                                            // var NewPathUrl = pathth.join(__dirname, '../public/QRcodeImg/' + imgName);
                                            // var logo = pathth.join(__dirname, '../public/images/logo_50.jpg');   //logo路径
                                            // var qrImgWid = images(NewPathUrl).width();   //二维码宽
                                            // var qrImgHei = images(NewPathUrl).height();  //二维码高
                                            // var logImgWid = images(logo).width();       //logo宽
                                            // var logImgHei = images(logo).height();      //logo高
                                            //
                                            // images(NewPathUrl)
                                            //     .draw(images(logo), qrImgWid / 2 - logImgWid / 2, qrImgHei / 2 - logImgHei / 2)
                                            //     .save("./public/QRcodeImg/" + imgName);
                                            //
                                            // var pathUrl = pathth.join(__dirname, '../public/QRcodeImg/' + imgNameJpg);
                                            // console.log(pathUrl);
                                            // that.uploadFile(pathUrl, 'image').then(function (mdeia_id) {
                                            //     var customService = util.format(that.apiURL.customService, that.apiDomain, accessTokenJson.access_token);
                                            //     //创建临时素材
                                            //     var customNews = {
                                            //         "touser": fromUser,
                                            //         "msgtype": "image",
                                            //         "image":
                                            //             {
                                            //                 "media_id": mdeia_id
                                            //             }
                                            //     };
                                            //     that.requestPost(customService, JSON.stringify(customNews)).then(function (data) {
                                            //         //将结果打印
                                            //         var sqlString = {
                                            //             qrcode: '' + pathUrl + '',
                                            //             qrcode_time: '' + new Date().getTime() + '',
                                            //         }
                                            //         mysql.query('update biao set ? where openid=' + sql.escape(fromUser) + '', sqlString, function (err, results) {
                                            //             if (err) {
                                            //                 // console.log(err);
                                            //                 return;
                                            //             }
                                            //         });
                                            //     });
                                            // });
                                        })
                                    })
                                } else {

                                    that.uploadFile(sqlqrcode, 'image').then(function (mdeia_id) {
                                        var customService = util.format(that.apiURL.customService, that.apiDomain, accessTokenJson.access_token);
                                        //创建临时素材
                                        var customNews = {
                                            "touser": fromUser,
                                            "msgtype": "image",
                                            "image":
                                                {
                                                    "media_id": mdeia_id
                                                }
                                        };
                                        that.requestPost(customService, JSON.stringify(customNews)).then(function (data) {
                                            //将结果打印
                                            // console.log(data)
                                        });
                                    });
                                }
                            });
                        } else {
                            // console.log('dianji')
                        }
                    }

                } else {
                    //判断消息类型为 文本消息
                    if (result.MsgType.toLowerCase() === "text") {
                        that.Datapdate(fromUser);
                        //根据消息内容返回消息信息
                        switch (result.Content) {
                            case '1':
                                reportMsg = msg.txtMsg(fromUser, toUser, '欢迎关注北京掌盈科技有限公司');
                                break;
                            default:
                            // reportMsg = msg.txtMsg(fromUser, toUser, '没有这个选项哦');
                            // break;
                        }
                        //判断消息加解密方式，如果未加密则使用明文，对明文消息进行加密
                        reportMsg = req.query.encrypt_type == 'aes' ? cryptoGraphy.encryptMsg(reportMsg) : reportMsg;
                        //返回给微信服务器
                        res.send(reportMsg);
                    }
                }
                // //判断消息加解密方式，如果未加密则使用明文，对明文消息进行加密
                // reportMsg = req.query.encrypt_type == 'aes' ? cryptoGraphy.encryptMsg(reportMsg) : reportMsg;
                // //返回给微信服务器
                // res.send(reportMsg);

            } else {
                //打印错误
                // console.log(err);
            }
        });
    });
}


//暴露可供外部访问的接口
module.exports = WeChat;
