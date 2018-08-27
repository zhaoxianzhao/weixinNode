//全局变量

var UrlQuery = 'http://w32wrf.natappfree.cc';

//获取URL中的参数
(function ($) {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;

    }
})(jQuery);