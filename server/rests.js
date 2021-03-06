/**
 * Created by clx on 2016/11/7.
 * rest资源注册。
 */
const querystring = require('querystring');
var urlMap = {
    //TODO:尚未实现/jingyin/rest/virtues/:id服务
    virtue: '/jingyin/rest/virtues/:id',
    prepay: '/jingyin/rest/virtues/prepay',
    //pay: 'http://jingyintemple.top/jingyin/manjusri/pay/confirm',
    pay: '/jingyin/manjusri/pay/confirm',
    weixinPaymentNotify: '/jingyin/manjusri/pay/notify',
    login: '/jingyin/manjusri/login',
    home: '/jingyin/manjusri/index',
    profile: '/jingyin/manjusri/lords/:openid/profile',

    "manjusri.index": "/jingyin/manjusri/new/index",
    "dailyVirtue": "/jingyin/manjusri/dailyVirtue",
    "suixi": "/jingyin/manjusri/suixi",
    "trans": '/jingyin/manjusri/trans/:partId',
    "jiansi": "/jingyin/manjusri/jiansi",
    "pray": "/jingyin/manjusri/pray",
    "examPray": "/jingyin/manjusri/pray/exam",
    "lesson": "/jingyin/manjusri/lesson",
    "me": "/jingyin/manjusri/lordvirtues",

    lord: "/jingyin/rests/lords/:id",
    manjusriStatistics: "/jingyin/rests/manjusri/statistics",
    lordPray:"/jingyin/rests/lords/:lordid/prays/:prayid",
    lordPrays: "/jingyin/rests/lords/:id/prays",
    lessonsResource: "/jingyin/rests/lessons",
    lessonPractices: '/jingyin/rests/practices/lords/:lordid/lessons/:lessonid',
};

function ResourceRegistry() {
}

ResourceRegistry.URLTemplate = function (urlTemplate) {
    this.urlTemplate = urlTemplate;
    this.pathParams = genPathParams(urlTemplate);

    //-------------------------------
    function genPathParams(urlTemplate) {
        var result = [];
        var parts = urlTemplate.split('/');
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf(':') === 0) {
                result.push(parts[i]);
            }
        }
        return result;
    }
};

ResourceRegistry.prototype.getUrlTemplete = function (rel) {
    return urlMap[rel];
};

ResourceRegistry.URLTemplate.prototype.expand = function (params) {
    var path = this.genPath(params);
    var query = this.genQuery(params);
    if (query.length > 0) {
        return path + '?' + query;
    }
    return path;
};

ResourceRegistry.URLTemplate.prototype.genPath = function (params) {
    var result = this.urlTemplate;
    for (var i = 0; i < this.pathParams.length; i++) {
        result = result.replace(this.pathParams[i], params[this.pathParams[i].substr(1)]);
    }
    return result;
};

ResourceRegistry.URLTemplate.prototype.isPathParam = function (param) {
    for (var i = 0; i < this.pathParams.length; i++) {
        if (this.pathParams[i] === ':' + param) {
            return true;
        }
    }
    return false;
};

ResourceRegistry.URLTemplate.prototype.genQuery = function (params) {
    var result = "";
    for (var property in params) {
        if (!this.isPathParam(property)) {
            result += property + '=' + params[property] + "&";
        }
    }
    if (result.length > 0) {
        result = result.substr(0, result.length - 1);
    }
    return result;
};

ResourceRegistry.prototype.getLink = function (resourceId, params) {
    var tempUrl = urlMap[resourceId];
    if (!tempUrl) return null; //TODO:如果指定资源未注册，getLink应该抛出ERROR
    var urlTemplate = new ResourceRegistry.URLTemplate(tempUrl);
    return urlTemplate.expand(params);
};

ResourceRegistry.prototype.getMainMenuLinkages = function () {
    var linkages = {
        home: this.getLink("home"),
        jiansi: this.getLink("jiansi"),
        pray: this.getLink('pray'),
        lesson: this.getLink('lesson'),
        lord: this.getLink("me")
    }
    return linkages;
}

module.exports = new ResourceRegistry();