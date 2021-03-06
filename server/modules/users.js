/**
 * Created by clx on 2016/11/3.
 */
var weixin = require('../weixin').weixin,
    weixinService = require('../weixin').weixinService,
    UserModel = require('../wechat/models/user'),
    Promise = require('bluebird');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

function Users() {
}

Users.prototype.findByOpenid = function (openid) {
    return UserModel.findOne({openid: openid});
}

Users.prototype.registerUser = function (data) {
    model = new UserModel(data);
    return model.save();
}

Users.prototype.updateProfileByOpenid = function (openid, dataToUpdate) {
    return this.findByOpenid(openid)
        .then(function (user) {
            for(var key in dataToUpdate){
                user[key] = dataToUpdate[key];
            }
            return user.save();
        });
}

Users.prototype.register = function (accessToken, openId) {
    return UserModel.findOne({openid: openId})
        .then(function (user) {
            logger.debug('The user with openid[' + openId + '] entering ..................\n' + JSON.stringify(user));
            if (user && user.name && user.subscribe) {
                logger.debug('The user with openid[' + openId + '] is already registered!');
                return Promise.resolve(user);
            }
            logger.debug('a new user? we will try to add or update the info of the user  with openid[' + openId + '] .......');
            (accessToken ? weixinService.getUserInfoByOpenIdAndToken(accessToken, openId)
                : weixinService.getUserInfoByOpenId(openId))
                .then(function (userInfo) {
                    var model = user;
                    if (!model) {
                        var data = {
                            name: userInfo.nickname,
                            openid: userInfo.openid,
                            img: userInfo.headimgurl,
                            city: userInfo.city,
                            province: userInfo.province,
                            sex: userInfo.sex,
                            subscribe: userInfo.subscribe_time
                        }
                        model = new UserModel(data);
                        logger.debug('a new user is registered:\n' + JSON.stringify(userInfo));
                    } else {
                        model.name = userInfo.nickname;
                        model.openid = userInfo.openid;
                        model.img = userInfo.headimgurl;
                        model.city = userInfo.city;
                        model.province = userInfo.province;
                        model.sex = userInfo.sex;
                        model.subscribe = userInfo.subscribe_time;
                        model.increment();
                        logger.debug('the user info is updated:\n' + JSON.stringify(userInfo));
                    }

                    return model.save();
                });
        });
}

module.exports = new Users();
