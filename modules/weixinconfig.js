/**
 * Created by clx on 2016/11/29.
 *
 */
var signMd5 = require('./weixinsignmd5'),
    signSha1 = require('./weixinsignsha1'),
    js2xmlparser = require('js2xmlparser');
var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

var nonceGen = function () {
    return Math.random().toString(36).substr(2, 15);
};
var timestampGen = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

var config, urlToGetAccessToken;
var apiBaseURL, oauth2BaseURL;
var appId, appSecret, mchId, mchKey;
var siteBaseUrl, payServerIp, payNotifyUrl;


function WeixinConfig() {
}

WeixinConfig.prototype.setNonceGenerator = function (nonceGenerator) {
    nonceGen = nonceGenerator;
};

WeixinConfig.prototype.setTimestampGenerator = function (timestampGenerator) {
    timestampGen = timestampGenerator;
};

WeixinConfig.prototype.setSignMD5 = function (weixinSignMd5) {
    signMd5 = weixinSignMd5;
};

WeixinConfig.prototype.getUrlToGetAccessToken = function () {
    return urlToGetAccessToken;
};

WeixinConfig.prototype.getUrlToGetOpenId = function (code) {
    var url = apiBaseURL + "access_token?appid="
        + appId + "&secret=" + appSecret + "&code=" + code + "&grant_type=authorization_code";
    return url;
};

WeixinConfig.prototype.getUrlToGetUserInfo = function (token, openid) {
    var url = 'https://api.weixin.qq.com/cgi-bin/user/info?' +
        'access_token=' + token + '&openid=' + openid + '&lang=zh_CN';
    return url;
};

/**
 * 获得通过网页授权获取用户基本信息的URL
 * @param token access_token
 * @param openid 用户id
 * @returns {string}
 */
WeixinConfig.prototype.getSnsUrlToGetUserInfo = function (token, openid) {
    var url = 'https://api.weixin.qq.com/sns/userinfo?' +
        'access_token=' + token + '&openid=' + openid + '&lang=zh_CN';
    return url;
};

WeixinConfig.prototype.getUrlToCheckAccessToken = function (token, openid) {
    return "https://api.weixin.qq.com/sns/auth?access_token=" + token + "&openid=" + openid;
}

WeixinConfig.prototype.getPrepayRequestOption = function (openId, transId, transName, amount) {
    var order = {
        out_trade_no: transId,
        body: transName,
        detail: transName,
        notify_url: payNotifyUrl,
        openid: openId,
        spbill_create_ip: payServerIp,
        total_fee: Math.round(amount * 100),
        attach: "jingyin",
        appid: appId,
        mch_id: mchId,
        nonce_str: nonceGen(),
        trade_type: "JSAPI"
    };
    order.sign = signMd5(order, mchKey);
    //TODO:如何避免由于transName中包含不允许出现在XML中的字符而导致异常？
    var prepayOrderXML;
    try {
        prepayOrderXML = js2xmlparser.parse('xml', order);
    } catch (err) {
        logger.error("Parse prepay request data error, please check prepay data: " + JSON.stringify(order));
        throw err;
    }

    var options = {
        url: 'https://api.mch.weixin.qq.com:443/pay/unifiedorder',
        method: 'POST',
        body: prepayOrderXML,
        headers: {
            'Content-Type': 'application/xml',
            "Content-Length": Buffer.byteLength(prepayOrderXML)
        }
    };
    return options;
}

WeixinConfig.prototype.generatePayData = function (prepayId) {
    var payData = {
        appId: appId,
        package: 'prepay_id=' + prepayId,
        timeStamp: timestampGen(),
        nonceStr: nonceGen(),
        signType: 'MD5'
    };
    payData.paySign = signMd5(payData, mchKey);
    payData.prepay_id = prepayId;
    return payData;
};

WeixinConfig.prototype.wrapRedirectURLByOath2WayBaseScope = function (url) {
    var redirectUrl = url.indexOf(siteBaseUrl) < 0 ? siteBaseUrl + url : url;
    logger.debug("the url weixin（Oath2WayBaseScope） will redirect to is: " + redirectUrl);
    var wrapedUrl = oauth2BaseURL + "?appid=" + appId
        + "&redirect_uri=" + redirectUrl + "&response_type=code&scope=snsapi_base#wechat_redirect";
    return wrapedUrl;
};

WeixinConfig.prototype.wrapRedirectURLByOath2Way = function (url) {
    var redirectUrl = url.indexOf(siteBaseUrl) < 0 ? siteBaseUrl + url : url;
    logger.debug("the url weixin（Oath2Way） will redirect to is: " + redirectUrl);
    var wrapedUrl = oauth2BaseURL + "?appid=" + appId
        + "&redirect_uri=" + redirectUrl + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
    return wrapedUrl;
};

WeixinConfig.prototype.parsePaymentNotification = function (paydata) {
    var result = {
        pass: false,
        openId: paydata.openid,
        virtueId: paydata.out_trade_no,
        paymentNo: paydata.transaction_id,
        replyOK: function () {
            return js2xmlparser.parse("xml", {
                return_code: "SUCCESS",
                return_msg: "OK"
            });
        }
    };

    if (paydata.result_code === "SUCCESS" && paydata.return_code === "SUCCESS") {
        var tosign = Object.assign({}, paydata);
        delete tosign.sign;
        if (signMd5(tosign, mchKey) === paydata.sign)
            result.pass = true;
    }
    return result;
};

WeixinConfig.prototype.getTicketURLForJsApi = function (token) {
    return "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + token + "&type=jsapi";
};

WeixinConfig.prototype.generateShareConfig = function (ticket, url) {
    var shareConfig = {
        noncestr: nonceGen(),
        jsapi_ticket: ticket,
        timestamp: timestampGen(),
        url: url
    };
    shareConfig.signature = signSha1(shareConfig);
    shareConfig.appId = appId;
    return shareConfig;
};

WeixinConfig.prototype.wrapUrlWithSitHost = function (url) {
    return siteBaseUrl + url;
};

WeixinConfig.prototype.getShareLogoImage = function () {
    return this.wrapUrlWithSitHost('/images/sharelogo.jpg');
}

module.exports = function (configData) {
    apiBaseURL = configData.apiBaseURL;
    oauth2BaseURL = configData.oauth2BaseURL;
    appId = configData.appId;
    appSecret = configData.appSecret;
    mchId = configData.mchId;
    mchKey = configData.mchKey;
    siteBaseUrl = configData.siteBaseUrl;
    payServerIp = configData.payServerIp;
    payNotifyUrl = configData.payNotifyUrl;

    urlToGetAccessToken = 'https://api.weixin.qq.com/cgi-bin/token?' +
        'grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
    return new WeixinConfig();
};