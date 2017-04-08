/**
 * Created by clx on 2017/4/8.
 */
const wechatLib = require('wechat'),
    wechat = require('./server/wechat/wechat'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session),
    promise = require('bluebird');

const mongodb = 'mongodb://shitongming:jIngyIn228793@121.41.93.210:17915/jingyin',
    secret = 'jingyinmanjusriBiz',
    token = 'jingyinManjusri';


module.exports = {
    port: 80,
    env: 'development',

    connectDb: function () {
        mongoose.Promise = promise;
        mongoose.connect(mongodb);
        mongoose.connection.on('open', function () {
            //console.log('Mongoose:' + mongodb + ' is connected!');
        });
    },

    useSession: function (app) {
        var store = new MongoDBStore(
            {
                uri: mongodb,
                collection: 'sessions'
            });

        // Catch errors
        store.on('error', function (error) {
            assert.ifError(error);
            assert.ok(false);
        });

        // Use express session support since OAuth2orize requires it
        app.use(session({
            //cookie: {maxAge: 1000 * 60 * 60 * 24 * 7},// 1 week
            cookie: {maxAge: 1000 * 60 * 60 * 24},// 1 week
            secret: secret || 'super secret for session',
            saveUninitialized: false,
            resave: false,
            store: store
        }));
    },

    userMiddlewares: function (app) {
        app.use('/jingyin/wechat', wechatLib(token, wechat));
    }
}
