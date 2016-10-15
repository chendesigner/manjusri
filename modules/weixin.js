/**
 * Created by sony on 2016/10/12.
 */
var simpleget = require('simple-get'),
    js2xmlparser = require('js2xmlparser'),
    request = require('request'),
    md5 = require('md5');

module.exports = function (config) {
    this.apiBaseURL = config.apiBaseURL ||
        "https://api.weixin.qq.com/sns/oauth2/";
    this.appid = config.appId;
    this.appsecret = config.appSecret;
    this.oauth2BaseURL = config.oauth2BaseURL ||
        "https://open.weixin.qq.com/connect/oauth2/authorize";
    this.mch_id = config.mch_id,
        this.mch_key = config.mch_key

    this.createNonceStr = function () {
        return Math.random().toString(36).substr(2, 15);
    }

    this.createTimeStamp = function () {
        return parseInt(new Date().getTime() / 1000) + '';
    }

    this.getOpenId = function (code, callback) {
        var url = this.apiBaseURL + "access_token?appid="
            + this.appid + "&secret=" + this.appsecret
            + "&code=" + code + "&grant_type=authorization_code";

        simpleget.concat(url, function (err, res, data) {
            callback(data.openid);
        });
    }
    this.wrapRedirectURLByOath2Way = function (url) {
        var wrapedUrl = this.oauth2BaseURL + "?appid=" + this.appid
            + "&redirect_uri=" + url + "&response_type=code&scope=snsapi_base#wechat_redirect";
        return wrapedUrl;
    }
    this.prePay = function (order, callback) {
        var prepayOrderXML = this.preparePrepayXml(order);
        this.sendPrepayRequest(prepayOrderXML, function (err, prepayId) {
            var payData = {
                "appId": this.appid,
                "timeStamp": this.createTimeStamp(),
                "nonceStr": this.createNonceStr(),
                "package": "prepay_id=" + prepayId,
                "signType": "MD5"
            };
            payData.paySign = this.signMD5(payData, this.mch_key);
            payData.prepay_id = prepayId;
            callback(payData);
        })
    }
    this.sendPrepayRequest = function (prepayOrderXML, callback) {
        var options = {
            url: "https://api.mch.weixin.qq.com:443/pay/unifiedorder",
            method: "POST",
            headers: {
                "content-type": "application/xml",
            },
            body: prepayOrderXML
        };
        request(options, callback);
    }
    this.preparePrepayOrderXml = function (order) {
        var prepay = Object.assign({}, order);
        prepay.appid = this.appid;
        prepay.mch_id = this.mch_id;
        prepay.nonce_str = this.createNonceStr();
        prepay.trade_type = "JSAPI";
        prepay.sign = this.signMD5(prepay, this.mch_key);

        var xml = js2xmlparser.parse('xml', prepay);
        return xml;
    }
    this.signMD5 = function (data, key) {
        var keyvaluesort = function (data) {
            var keys = new Array();
            for (var k in data) {
                keys.push(k);
            }

            keys = keys.sort();
            var val = '';
            for (var i = 0; i < keys.length; i++) {
                if (i > 0) val = val + '&';
                val = val + keys[i] + '=' + data[keys[i]];
            }
            return val;
        }
        var tosign = keyvaluesort(data) + '&key=' + key;
        return md5(tosign).toUpperCase();
    }
    return this;
}