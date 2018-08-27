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
};

//选中字体
/**
 * @param element 传参dom
 */
function selectText(element) {
    var text = element
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        alert("none");
    }
}

function query(val) {
    $.ajax({
        url: UrlQuery + '/query?',
        type: 'post',
        data: {value: val},
        dataType: 'json',
        async: true,
        cache: false,
        success: function (data) {
            var str = ' <tr>\n' +
                '<th>序号</th>\n' +
                    '<th>openID</th>\n' +
                    '<th>推荐人</th>\n' +
                    '<th>昵称</th>\n' +
                    '<th class="last_th">邀请时间</th>\n' +
                '</tr>'
            if (data.length === 0) {
                $('.list_kong').show();
                $('.table_box').hide();
            } else {
                for (var i = 0; i < data.length; i++) {
                    var queryTime = new Date(data[i].time)
                    var newDate = new Date();
                    newDate.setTime(queryTime);
                    str += '<tr><td>' + (i + 1) + '</td><td class="openidClick">' + data[i].openid + '</td><td>' + data[i].userNicename + '</td><td>' + data[i].name + '</td><td class="last_th">' + newDate.format('yyyy/MM/dd hh:mm:ss') + '</td></tr>';
                }
                $('.list_kong').hide();
                $('.table_box').show();
                $('.table').html(str);
                $('.openidClick').dblclick(function () {
                    $('.inp_text').val($(this).text());
                })
            }
        },
        error: function (data) {
            alert('网络错误')
        }
    })
}

query($.getUrlParam('id'));
$('.search').bind('click', function () {
    var inpVal = $('.inp_text').val();
    query(inpVal)
});
$('.empty').bind('click',function () {
    $('.inp_text').val('');
})