/**
 * Created by clx on 2017/4/8.
 */
const redirects = require('../server/wechat/redirects');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

module.exports = {
    manjusri : function (req, res, next) {
        var sess = req.session;
        if (!sess.user) {
            logger.debug("begin login ..........................")
            req.session.redirectToUrl = req.originalUrl;
            return redirects.toLogin(req, res);
        }
        return next();
    }
}