var webboot = require('./modules/webboot'),
    route = require('./server/routes'),
    wechat = require('./server/wechat/wechat');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

var cluster = require('cluster'),
    os = require('os');

var ctx = {
    port: 80,
    //views: __dirname + '/client/views',
    //'static': __dirname + '/client/public',
    env: 'development',
    secret: 'jingyinmanjusriBiz',
    mongodb: 'shitongming:jIngyIn228793@121.41.93.210:17915/jingyin',
    wechat: {
        token: 'jingyinManjusri',
        post: wechat
    },
    route: route
};

if (cluster.isMaster) {
    var cpus = os.cpus().length;
    for (var i = 0; i < cpus; i++) { //[1]
        logger.debug('begin fork no.' + i + " ~~~~~~~~~~~~~~~~~~~");
        cluster.fork();
        cluster.on('exit', function (worker, code) {
            if (code != 0 && !worker.suicide) {
                logger.info('Worker crashed. Starting a new worker ~~~~~~~~~~~~~~~~~~~~~~~~~');
                cluster.fork();
            }
        });
    }
}
else {
    webboot(ctx);
}


