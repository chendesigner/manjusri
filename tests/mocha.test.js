/**
 * Created by sony on 2016/9/26.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectID = require('mongodb').ObjectID,
    XML = require('pixl-xml'),
    js2xmlparser = require('js2xmlparser'),
    proxyquire = require('proxyquire');

describe('静音寺业务系统', function () {
    var stubs, err;
    var dateUtils;

    beforeEach(function () {
        stubs = {}
        err = new Error('any error message');
        dateUtils = require("../modules/utils").dateUtils;
    });

    describe('业务', function (done) {
        var partsData, usersData, lessonsData;
        var virtuesInDb, partsInDb, usersInDb, praysInDb, lessonsInDb, practicesInDb;
        var ObjectID;

        function initDB(insertDocs, callback) {
            var PartModel = require('../server/wechat/models/part');
            var UserModel = require('../server/wechat/models/user');
            var VirtueModel = require('../server/wechat/models/virtue');
            var PrayModel = require('../server/wechat/models/pray');
            var LessonModel = require('../server/wechat/models/lesson');
            var PracticeModel = require('../server/wechat/models/practice');

            partsData = require('./data/partsdata').data;
            usersData = require('./data/usersdata').data;
            lessonsData = require('./data/lessonsdata').data;

            insertDocs(PartModel, partsData, function (err, docs) {
                if (err) return callback(err);
                partsInDb = docs;
                insertDocs(UserModel, usersData, function (err, docs) {
                    if (err) return callback(err);
                    usersInDb = docs;
                    var virtuesData = [
                        {
                            "lord": usersInDb[1].id,
                            "subject": partsInDb[0].id,
                            "amount": 10,
                            "state": "payed",
                            "timestamp": new Date(2016, 2, 14)
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[0].id,
                            "amount": 20,
                            "state": "payed",
                            "timestamp": dateUtils.maxYestoday()
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[0].id,
                            "amount": 20,
                            "state": "payed"
                        },
                        {
                            "lord": usersInDb[1].id,
                            "subject": partsInDb[0].id,
                            "amount": 20,
                            "state": "payed"
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[1].id,
                            "amount": 20,
                            "state": "payed"
                        },
                        {
                            "lord": usersInDb[1].id,
                            "subject": partsInDb[1].id,
                            "amount": 50,
                            "state": 'new'
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[0].id,
                            "amount": 10,
                            "state": "new"
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[0].id,
                            "amount": 20,
                            "state": "payed",
                            "timestamp": dateUtils.minTomorrow()
                        },
                        {
                            "lord": usersInDb[0].id,
                            "subject": partsInDb[0].id,
                            "amount": 20,
                            "state": "payed",
                            "timestamp": new Date(2016, 5, 24)
                        },
                        {
                            "lord": usersInDb[2].id,
                            "subject": partsInDb[0].id,
                            "amount": 30,
                            "state": "payed",
                            "timestamp": new Date(2016, 5, 24)
                        },
                        {
                            "lord": usersInDb[1].id,
                            "subject": partsInDb[0].id,
                            "amount": 40,
                            "state": "payed",
                            "timestamp": new Date(2016, 7, 24)
                        },
                    ];
                    insertDocs(VirtueModel, virtuesData, function (err, docs) {
                        if (err) return callback(err);
                        virtuesInDb = docs;
                        var praysData = [
                            {
                                prayer: usersInDb[0]._id,
                                context: "this is the pray from " + usersInDb[0]._id
                            },
                            {
                                prayer: usersInDb[1]._id,
                                context: "this is the pray 1 from " + usersInDb[1]._id
                            },
                            {
                                prayer: usersInDb[0]._id,
                                context: "this is the pray 2 from " + usersInDb[0]._id,
                                printed: true
                            },
                            {
                                prayer: usersInDb[2]._id,
                                context: "this is the pray 1 from " + usersInDb[2]._id
                            },
                        ];
                        insertDocs(PrayModel, praysData, function (err, docs) {
                            if (err) return callback(err);
                            praysInDb = docs;
                            insertDocs(LessonModel, lessonsData, function (err, docs) {
                                if (err) return callback(err);
                                lessonsInDb = docs;
                                var parcticesData = [
                                    {
                                        lord: usersInDb[0],
                                        lesson: lessonsInDb[0],
                                        begDate: new Date(2017, 3, 24),
                                        num: 2000
                                    },
                                    {
                                        lord: usersInDb[1],
                                        lesson: lessonsInDb[1],
                                        begDate: new Date(2017, 2, 20),
                                        num: 3000
                                    },
                                    {
                                        lord: usersInDb[2],
                                        lesson: lessonsInDb[1],
                                        begDate: new Date(2017, 2, 20),
                                        num: 3000,
                                        state: "deleted"
                                    }
                                ];
                                insertDocs(PracticeModel, parcticesData, function (err, docs) {
                                    practicesInDb = docs;
                                    return callback();
                                });
                            });
                        });
                    });
                });
            });
        }

        beforeEach(function (done) {
            ObjectID = require('mongodb').ObjectID;
            mongoose.Promise = global.Promise;
            if (!mongoose.connection.db)
                mongoose.connect(dbURI);

            initDB(insertDocsInSequential, done);
            //initDB(insertDocsInParallel, done);
        });

        afterEach(function (done) {
            clearDB(done);
        });

        describe('业务对象', function () {
            describe('法物', function () {
                describe('更新法物数量', function () {
                    it('访问法物时失败', function () {
                        var partId = 12234556;
                        var partFindByIdStub = createPromiseStub([partId], null, err);
                        stubs['../wechat/models/part'] = {findById: partFindByIdStub}

                        var parts = proxyquire('../server/modules/parts', stubs);
                        return parts.updatePartNum(partId, 23)
                            .catch(function (error) {
                                expect(error).eql(err);
                            });
                    });

                    it('未找到指定法物', function () {
                        var partId = 12234556;
                        var partFindByIdStub = createPromiseStub([partId], [null]);
                        stubs['../wechat/models/part'] = {findById: partFindByIdStub}

                        var parts = proxyquire('../server/modules/parts', stubs);
                        return parts.updatePartNum(partId, 23)
                            .catch(function (error) {
                                expect(error instanceof Error).true;
                                expect(error.message).eql('The part ' + partId + ' is not found');
                            });
                    });

                    it('保存法物时失败', function () {
                        var partId = 12234556;
                        var partUpdateSpy = sinon.spy();

                        var partSaveStub = createPromiseStub([], null, err);
                        var part = {
                            updateNum: partUpdateSpy,
                            save: partSaveStub
                        };

                        var partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['../wechat/models/part'] = {findById: partFindByIdStub};

                        var parts = proxyquire('../server/modules/parts', stubs);
                        return parts.updatePartNum(partId, 23)
                            .catch(function (error) {
                                expect(partUpdateSpy).calledWith(23);
                                expect(partSaveStub).calledOnce;
                                expect(error).eql(err);
                            });
                    });

                    it('成功', function () {
                        var partId = 12234556;
                        var partUpdateSpy = sinon.spy();

                        var partSaveStub = createPromiseStub([], []);
                        var part = {
                            updateNum: partUpdateSpy,
                            save: partSaveStub
                        };

                        var partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['../wechat/models/part'] = {findById: partFindByIdStub};

                        var parts = proxyquire('../server/modules/parts', stubs);
                        return parts.updatePartNum(partId, 23)
                            .then(function () {
                                expect(partUpdateSpy).calledWith(23);
                                expect(partSaveStub).calledOnce;
                            });
                    });
                });

                it('查询正在募捐的法物', function () {
                    var parts = require('../server/modules/parts');
                    return parts.listPartsOnSale()
                        .then(function (data) {
                            expect(data).eql([
                                {
                                    _id: partsInDb[3]._id,
                                    "name": partsInDb[3].name,
                                    "img": partsInDb[3].img,
                                    "price": partsInDb[3].price,
                                    "num": partsInDb[3].num,
                                    "sold": partsInDb[3].sold,
                                }
                            ]);
                        })
                });
            });

            describe('用户', function () {
                var users;

                beforeEach(function () {
                    users = require('../server/modules/users');
                });

                describe('查找指定openid的用户', function () {
                    it('指定openid的用户不存在', function (done) {
                        var result;
                        users.findByOpenid('fooopenid')
                            .then(function (user) {
                                expect(user).to.be.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            });
                    });
                });

                describe('用户注册', function (done) {
                    it('成功注册', function () {
                        var openId = 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M';
                        var userInfo = {
                            "subscribe": 1,
                            "openid": openId,
                            "nickname": "Band",
                            "sex": 1,
                            "language": "zh_CN",
                            "city": "广州",
                            "province": "广东",
                            "country": "中国",
                            "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
                            "subscribe_time": 1382694957,
                            "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL",
                            "remark": "",
                            "groupid": 0
                        }
                        var userData = {
                            name: userInfo.nickname,
                            openid: userInfo.openid,
                            img: userInfo.headimgurl,
                            city: userInfo.city,
                            province: userInfo.province,
                            sex: userInfo.sex,
                            subscribe: userInfo.subscribe_time
                        }
                        users.registerUser(userData)
                            .then(function (data) {
                                expect(data._id).not.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            });
                    });
                });

                it('补充个人资料', function (done) {
                    var data = {
                        realname: "clx",
                        phone: "1234567",
                        addr: 'foo address',
                        email: "my email address"
                    };

                    users.updateProfileByOpenid(usersData[0].openid, data)
                        .then(function (user) {
                            expect(user.realname).eql(data.realname);
                            expect(user.phone).eql(data.phone);
                            expect(user.addr).eql(data.addr);
                            expect(user.email).eql(data.email);
                            done();
                        })
                        .catch(function (err) {
                            done(err);
                        });
                })
            });

            describe('功德', function () {
                var virtues;

                beforeEach(function () {
                    virtues = require('../server/modules/virtues');
                });

                describe('预置捐助交易', function () {
                    var subject, timestampStub;

                    beforeEach(function () {
                        virtues.getTimestamp = timestampStub;

                        subject = partsInDb[0].id;

                    });

                    it('未给出捐助对象subject', function () {
                        return virtues.place()
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['subject'].message)
                                        .eql('Path `subject` is required.');
                                });
                    });

                    it('捐助对象subject不存在', function () {
                        subject = new ObjectID();
                        return virtues.place(subject, 23.12)
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['subject'].message)
                                        .eql('subject ' + subject + ' 不存在');
                                });
                    });

                    it('数量必须为正整数', function () {
                        return virtues.place(subject, 23.34, {num: 2.1})
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['num'].message)
                                        .eql('num必须为正整数');
                                });
                    });

                    it('数量必须为正整数', function () {
                        return virtues.place(subject, 23.34, {num: -34})
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['num'].message)
                                        .eql('num必须为正整数');
                                });
                    });

                    it('价格为金额，最多两位小数', function () {
                        return virtues.place(subject, 462.2, {price: 23.345})
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['price'].message)
                                        .eql('price:[23.345], 为金额最多两位小数且大于零');
                                });
                    });

                    it('价格为金额应大于零', function () {
                        return virtues.place(subject, 462.2, {price: -23.34})
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['price'].message)
                                        .eql('price:[-23.34], 为金额最多两位小数且大于零');
                                });
                    });

                    it('金额必须给出', function () {
                        return virtues.place(subject)
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['amount'].message)
                                        .eql('Path `amount` is required.');
                                });
                    });

                    it('金额最多两位小数', function () {
                        return virtues.place(subject, 23.345)
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['amount'].message)
                                        .eql('amount:[23.345], 为金额最多两位小数且大于零');
                                });
                    });

                    it('金额应大于零', function () {
                        return virtues.place(subject, -23.34)
                            .then(function () {
                                    assert.fail(0, 1, 'Exception not thrown');
                                },
                                function (err) {
                                    expect(err.errors['amount'].message)
                                        .eql('amount:[-23.34], 为金额最多两位小数且大于零');
                                });
                    });

                    it('正确预置捐助交易', function () {
                        return virtues.place(subject, 462.2, {price: 23.11, num: 20}, 'this is any giving')
                            .then(function (doc) {
                                expect(doc.subject.toString()).eql(subject);
                                expect(doc.num).eql(20);
                                expect(doc.price).eql(23.11);
                                expect(doc.amount).eql(462.2);
                                expect(doc.giving).eql('this is any giving');
                                expect(new Date().valueOf() - doc.timestamp.valueOf() < 100).eql(true);
                                expect(doc.state).eql('new');
                            });
                    });
                });

                describe('指定功德主的功德', function () {

                    it('当今日无daily类型的交易时，列出指定功德主的捐助交易', function () {
                        return virtues.listLordVirtues(usersInDb[0]._id, new Date(2017, 0, 15))
                            .then(function (result) {
                                expect(result).eql({
                                    daily: {
                                        thisday: {count: 0, sum: 0},
                                        thisMonth: {count: 0, sum: 0},
                                        total: {count: 4, sum: 80}
                                    },
                                    virtues: {
                                        count: 1, sum: 20,
                                        details: [
                                            {
                                                date: virtuesInDb[3].timestamp,
                                                num: virtuesInDb[3].num,
                                                amount: virtuesInDb[3].amount,
                                                img: partsInDb[1].img,
                                                subject: partsInDb[1].name

                                            }
                                        ]
                                    }
                                });
                            });
                    });

                    it('列出指定功德主的捐助交易', function () {
                        return virtues.listLordVirtues(usersInDb[0]._id)
                            .then(function (result) {
                                expect(result).eql({
                                    daily: {
                                        thisday: {count: 1, sum: 20},
                                        thisMonth: {count: 3, sum: 60},
                                        total: {count: 4, sum: 80}
                                    },
                                    virtues: {
                                        count: 1, sum: 20,
                                        details: [
                                            {
                                                date: virtuesInDb[3].timestamp,
                                                num: virtuesInDb[3].num,
                                                amount: virtuesInDb[3].amount,
                                                img: partsInDb[1].img,
                                                subject: partsInDb[1].name

                                            }
                                        ]
                                    }
                                });
                            });
                    });
                });

                describe('查询指定单号的预置捐助交易，以便支付', function () {
                    var virtueId;

                    it('指定单号未查到', function () {
                        virtueId = '583fdfcc77ce2f2b702a5449';
                        return virtues.findNewVirtueById(virtueId)
                            .then(function (doc) {
                                expect(doc).to.be.null;
                            }, function (err) {
                                throw 'should not be here';
                            });
                    });

                    it('指定单号状态不为new', function () {
                        virtueId = virtuesInDb[0].id.toString();
                        return virtues.findNewVirtueById(virtueId)
                            .then(function (doc) {
                                expect(doc).to.be.null;
                            }, function (err) {
                                throw 'should not be here';
                            });
                    });

                    it('查找成功', function () {
                        virtueId = virtuesInDb[5].id.toString();
                        return virtues.findNewVirtueById(virtueId)
                            .then(function (doc) {
                                expect(doc.state).eql('new');
                                expect(doc.subject.name).eql(partsInDb[1].name);
                            }, function (err) {
                                throw 'should not be here';
                            });
                    });
                });

                describe('查询最近N笔交易及其次数', function () {
                    var year, month, day;

                    beforeEach(function () {
                        var today = new Date();
                        year = today.getFullYear();
                        month = today.getMonth() + 1;
                        day = today.getDate();
                    });

                    it('最近N笔日行一善捐助交易', function () {
                        return virtues.lastVirtuesAndTotalCount("daily", 3)
                            .then(function (data) {
                                expect(data).eql({
                                    id: partsInDb[0]._id,
                                    count: 8,
                                    virtues: [
                                        {
                                            "amount": 20,
                                            "city": usersInDb[0].city,
                                            "day": day + 1,
                                            "month": month,
                                            "name": usersInDb[0].name,
                                            "year": year
                                        },
                                        {
                                            "amount": 20,
                                            "city": usersInDb[0].city,
                                            "day": day,
                                            "month": month,
                                            "name": usersInDb[0].name,
                                            "year": year
                                        },
                                        {
                                            "amount": 20,
                                            "city": usersInDb[1].city,
                                            "day": day,
                                            "month": month,
                                            "name": usersInDb[1].name,
                                            "year": year
                                        }
                                    ]
                                });
                            });
                    });

                    it('最近N笔随喜捐助交易', function () {
                        return virtues.lastVirtuesAndTotalCount("suixi", 3)
                            .then(function (data) {
                                expect(data).eql({
                                    id: partsInDb[1]._id,
                                    count: 1,
                                    virtues: [
                                        {
                                            "amount": 20,
                                            "city": usersInDb[0].city,
                                            "day": day,
                                            "month": month,
                                            "name": usersInDb[0].name,
                                            "year": year
                                        },
                                    ]
                                });
                            });
                    });
                });
            });

            describe('统计所有捐助', function () {
                var statistics, thisYear, thisMonth, thisDay;

                beforeEach(function () {
                    statistics = require('../server/modules/statistics');
                    var today = new Date();
                    thisYear = today.getFullYear();
                    thisMonth = today.getMonth() + 1;
                    thisDay = today.getDate();
                });

                it('各年度及总计', function () {
                    return statistics.byYears()
                        .then(function (data) {
                            expect(data).eql({
                                "count": 9,
                                "sum": 200,
                                "years": [
                                    {
                                        "year": 2016,
                                        "count": 4,
                                        "sum": 100
                                    },
                                    {
                                        "year": 2017,
                                        "count": 5,
                                        "sum": 100
                                    }
                                ]
                            });
                        });
                });

                it('无各年度数据', function (done) {
                    return clearDB(function () {
                        return statistics.byYears()
                            .then(function (data) {
                                expect(data).eql({
                                    "count": 0,
                                    "sum": 0,
                                    "years": []
                                });
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            });
                    });
                });

                it('各个省市及总计', function () {
                    return statistics.byProvicesAndCities()
                        .then(function (data) {
                            expect(data).eql({
                                "count": 9,
                                "sum": 200,
                                "provinces": {
                                    "直辖市": {
                                        "count": 1,
                                        "sum": 30,
                                        "cities": {
                                            "北京": {
                                                "count": 1,
                                                "sum": 30,
                                            }
                                        }
                                    },
                                    "江苏": {
                                        "count": 8,
                                        "sum": 170,
                                        "cities": {
                                            "南京": {
                                                "count": 5,
                                                "sum": 100,
                                            },
                                            "无锡": {
                                                "count": 3,
                                                "sum": 70,
                                            }
                                        }
                                    }
                                }
                            });
                        });
                });

                it('前N名排名', function () {
                    return statistics.topN(2)
                        .then(function (data) {
                            expect(data).eql({
                                "top": 2,
                                "count": 9,
                                "sum": 200,
                                "percent": 85,
                                "details": [
                                    {
                                        lord: {
                                            nickname: usersInDb[0].name,
                                            name: usersInDb[0].realname,
                                            province: usersInDb[0].province,
                                            city: usersInDb[0].city,
                                            phone: usersInDb[0].phone,
                                            addr: usersInDb[0].addr,
                                            email: usersInDb[0].email,
                                        },
                                        count: 5,
                                        sum: 100
                                    },
                                    {
                                        lord: {
                                            nickname: usersInDb[1].name,
                                            name: usersInDb[1].realname,
                                            province: usersInDb[1].province,
                                            city: usersInDb[1].city,
                                            phone: usersInDb[1].phone,
                                            addr: usersInDb[1].addr,
                                            email: usersInDb[1].email,
                                        },
                                        count: 3,
                                        sum: 70
                                    }
                                ]
                            });
                        });
                });

                it('指定金额区间排名', function () {
                    var rangeExpStub3 = sinon.stub();
                    rangeExpStub3.returns({$lt: 20});
                    var rangeArrStub3 = sinon.stub();
                    rangeArrStub3.returns([null, 20]);

                    var rangeExpStub0 = sinon.stub();
                    rangeExpStub0.returns({$gte: 20, $lt: 40});
                    var rangeArrStub0 = sinon.stub();
                    rangeArrStub0.returns([20, 40]);

                    var rangeExpStub1 = sinon.stub();
                    rangeExpStub1.returns({$gte: 40, $lt: 80});
                    var rangeArrStub1 = sinon.stub();
                    rangeArrStub1.returns([40, 80]);

                    var rangeExpStub2 = sinon.stub();
                    rangeExpStub2.returns({$gte: 80});
                    var rangeArrStub2 = sinon.stub();
                    rangeArrStub2.returns([80, null]);

                    return statistics.eachRangeOfAmount([
                        {name: rangeArrStub3, exp: rangeExpStub3},
                        {name: rangeArrStub0, exp: rangeExpStub0},
                        {name: rangeArrStub1, exp: rangeExpStub1},
                        {name: rangeArrStub2, exp: rangeExpStub2},
                    ])
                        .then(function (data) {
                            expect(data).eql({
                                "count": 9,
                                "sum": 200,
                                "buckets": [
                                    {
                                        "bucket": [20, 40],
                                        "count": 1,
                                        "sum": 30,
                                        "virtues": [
                                            {
                                                "count": 1,
                                                "lord": {
                                                    nickname: usersInDb[2].name,
                                                    name: usersInDb[2].realname,
                                                    province: usersInDb[2].province,
                                                    city: usersInDb[2].city,
                                                    phone: usersInDb[2].phone,
                                                    addr: usersInDb[2].addr,
                                                    email: usersInDb[2].email,
                                                },
                                                "sum": 30,
                                            }
                                        ]
                                    },
                                    {
                                        bucket: [40, 80],
                                        virtues: [
                                            {
                                                lord: {
                                                    nickname: usersInDb[1].name,
                                                    name: usersInDb[1].realname,
                                                    province: usersInDb[1].province,
                                                    city: usersInDb[1].city,
                                                    phone: usersInDb[1].phone,
                                                    addr: usersInDb[1].addr,
                                                    email: usersInDb[1].email,
                                                },
                                                count: 3,
                                                sum: 70
                                            }
                                        ],
                                        count: 3,
                                        sum: 70
                                    },
                                    {
                                        bucket: [80, null],
                                        virtues: [
                                            {
                                                lord: {
                                                    nickname: usersInDb[0].name,
                                                    name: usersInDb[0].realname,
                                                    province: usersInDb[0].province,
                                                    city: usersInDb[0].city,
                                                    phone: usersInDb[0].phone,
                                                    addr: usersInDb[0].addr,
                                                    email: usersInDb[0].email,
                                                },
                                                count: 5,
                                                sum: 100
                                            }
                                        ],
                                        count: 5,
                                        sum: 100
                                    },
                                ]
                            });
                        });
                });

                it('指定年度的各个月份', function () {
                    return statistics.byMonthesOfTheYear(2016)
                        .then(function (data) {
                            expect(data).eql({
                                "count": 4,
                                "sum": 100,
                                "year": 2016,
                                "monthes": {
                                    "3": {
                                        "count": 1,
                                        "sum": 10
                                    },
                                    "6": {
                                        "count": 2,
                                        "sum": 50
                                    },
                                    "8": {
                                        "count": 1,
                                        "sum": 40
                                    }
                                },
                            });
                        });
                });

                it('指定年度的各个省市', function () {
                    return statistics.byProvicesAndCities(2016)
                        .then(function (data) {
                            expect(data).eql({
                                "count": 4,
                                "sum": 100,
                                "year": 2016,
                                "provinces": {
                                    "直辖市": {
                                        "count": 1,
                                        "sum": 30,
                                        "cities": {
                                            "北京": {
                                                "count": 1,
                                                "sum": 30,
                                            }
                                        }
                                    },
                                    "江苏": {
                                        "count": 3,
                                        "sum": 70,
                                        "cities": {
                                            "南京": {
                                                "count": 1,
                                                "sum": 20,
                                            },
                                            "无锡": {
                                                "count": 2,
                                                "sum": 50,
                                            }
                                        }
                                    }
                                }
                            });
                        });
                });

                it('指定年度前N名排名', function () {
                    return statistics.topN(1, thisYear)
                        .then(function (data) {
                            expect(data).eql({
                                "year": 2017,
                                "top": 1,
                                "count": 5,
                                "sum": 100,
                                "percent": 80,
                                "details": [
                                    {
                                        lord: {
                                            nickname: usersInDb[0].name,
                                            name: usersInDb[0].realname,
                                            province: usersInDb[0].province,
                                            city: usersInDb[0].city,
                                            phone: usersInDb[0].phone,
                                            addr: usersInDb[0].addr,
                                            email: usersInDb[0].email,
                                        },
                                        count: 4,
                                        sum: 80
                                    }
                                ]
                            });
                        });
                });

                it('指定年度金额区间排名', function () {
                    var rangeExpStub3 = sinon.stub();
                    rangeExpStub3.returns({$lt: 20});
                    var rangeArrStub3 = sinon.stub();
                    rangeArrStub3.returns([null, 20]);

                    var rangeExpStub0 = sinon.stub();
                    rangeExpStub0.returns({$gte: 20, $lt: 40});
                    var rangeArrStub0 = sinon.stub();
                    rangeArrStub0.returns([20, 40]);

                    var rangeExpStub1 = sinon.stub();
                    rangeExpStub1.returns({$gte: 40, $lt: 80});
                    var rangeArrStub1 = sinon.stub();
                    rangeArrStub1.returns([40, 80]);

                    var rangeExpStub2 = sinon.stub();
                    rangeExpStub2.returns({$gte: 80});
                    var rangeArrStub2 = sinon.stub();
                    rangeArrStub2.returns([80, null]);

                    return statistics.eachRangeOfAmount([
                        {name: rangeArrStub3, exp: rangeExpStub3},
                        {name: rangeArrStub0, exp: rangeExpStub0},
                        {name: rangeArrStub1, exp: rangeExpStub1},
                        {name: rangeArrStub2, exp: rangeExpStub2},
                    ], thisYear)
                        .then(function (data) {
                            expect(data).eql({
                                "year": thisYear,
                                "count": 5,
                                "sum": 100,
                                "buckets": [
                                    {
                                        "bucket": [20, 40],
                                        "count": 1,
                                        "sum": 20,
                                        "virtues": [
                                            {
                                                "count": 1,
                                                "lord": {
                                                    nickname: usersInDb[1].name,
                                                    name: usersInDb[1].realname,
                                                    province: usersInDb[1].province,
                                                    city: usersInDb[1].city,
                                                    phone: usersInDb[1].phone,
                                                    addr: usersInDb[1].addr,
                                                    email: usersInDb[1].email,
                                                },
                                                "sum": 20,
                                            }
                                        ]
                                    },
                                    {
                                        bucket: [80, null],
                                        virtues: [
                                            {
                                                lord: {
                                                    nickname: usersInDb[0].name,
                                                    name: usersInDb[0].realname,
                                                    province: usersInDb[0].province,
                                                    city: usersInDb[0].city,
                                                    phone: usersInDb[0].phone,
                                                    addr: usersInDb[0].addr,
                                                    email: usersInDb[0].email,
                                                },
                                                count: 4,
                                                sum: 80
                                            }
                                        ],
                                        count: 4,
                                        sum: 80
                                    },
                                ]
                            });
                        });
                });

                it('指定月度的各个省市', function () {
                    return statistics.byProvicesAndCities(2016, 3)
                        .then(function (data) {
                            expect(data).eql({
                                "count": 1,
                                "sum": 10,
                                "year": 2016,
                                "month": 3,
                                "provinces": {
                                    "江苏": {
                                        "count": 1,
                                        "sum": 10,
                                        "cities": {
                                            "无锡": {
                                                "count": 1,
                                                "sum": 10,
                                            }
                                        }
                                    }
                                }
                            });
                        });
                });

                it('指定月度前N名排名', function () {
                    return statistics.topN(1, thisYear, thisMonth)
                        .then(function (data) {
                            expect(data).eql({
                                "year": thisYear,
                                "month": thisMonth,
                                "top": 1,
                                "count": 5,
                                "sum": 100,
                                "percent": 80,
                                "details": [
                                    {
                                        lord: {
                                            nickname: usersInDb[0].name,
                                            name: usersInDb[0].realname,
                                            province: usersInDb[0].province,
                                            city: usersInDb[0].city,
                                            phone: usersInDb[0].phone,
                                            addr: usersInDb[0].addr,
                                            email: usersInDb[0].email,
                                        },
                                        count: 4,
                                        sum: 80
                                    }
                                ]
                            });
                        });
                });

                it('指定月度金额区间排名', function () {
                    var rangeExpStub3 = sinon.stub();
                    rangeExpStub3.returns({$lt: 20});
                    var rangeArrStub3 = sinon.stub();
                    rangeArrStub3.returns([null, 20]);

                    var rangeExpStub0 = sinon.stub();
                    rangeExpStub0.returns({$gte: 20, $lt: 40});
                    var rangeArrStub0 = sinon.stub();
                    rangeArrStub0.returns([20, 40]);

                    var rangeExpStub1 = sinon.stub();
                    rangeExpStub1.returns({$gte: 40, $lt: 80});
                    var rangeArrStub1 = sinon.stub();
                    rangeArrStub1.returns([40, 80]);

                    var rangeExpStub2 = sinon.stub();
                    rangeExpStub2.returns({$gte: 80});
                    var rangeArrStub2 = sinon.stub();
                    rangeArrStub2.returns([80, null]);

                    return statistics.eachRangeOfAmount([
                        {name: rangeArrStub3, exp: rangeExpStub3},
                        {name: rangeArrStub0, exp: rangeExpStub0},
                        {name: rangeArrStub1, exp: rangeExpStub1},
                        {name: rangeArrStub2, exp: rangeExpStub2},
                    ], thisYear, thisMonth)
                        .then(function (data) {
                            expect(data).eql({
                                "year": thisYear,
                                "month": thisMonth,
                                "count": 5,
                                "sum": 100,
                                "buckets": [
                                    {
                                        "bucket": [20, 40],
                                        "count": 1,
                                        "sum": 20,
                                        "virtues": [
                                            {
                                                "count": 1,
                                                "lord": {
                                                    nickname: usersInDb[1].name,
                                                    name: usersInDb[1].realname,
                                                    province: usersInDb[1].province,
                                                    city: usersInDb[1].city,
                                                    phone: usersInDb[1].phone,
                                                    addr: usersInDb[1].addr,
                                                    email: usersInDb[1].email,
                                                },
                                                "sum": 20,
                                            }
                                        ]
                                    },
                                    {
                                        bucket: [80, null],
                                        virtues: [
                                            {
                                                lord: {
                                                    nickname: usersInDb[0].name,
                                                    name: usersInDb[0].realname,
                                                    province: usersInDb[0].province,
                                                    city: usersInDb[0].city,
                                                    phone: usersInDb[0].phone,
                                                    addr: usersInDb[0].addr,
                                                    email: usersInDb[0].email,
                                                },
                                                count: 4,
                                                sum: 80
                                            }
                                        ],
                                        count: 4,
                                        sum: 80
                                    },
                                ]
                            });
                        });
                });

                it('指定日各个省市', function () {
                    return statistics.byProvicesAndCities(thisYear, thisMonth, thisDay)
                        .then(function (data) {
                            expect(data).eql({
                                "count": 3,
                                "sum": 60,
                                "year": thisYear,
                                "month": thisMonth,
                                "day": thisDay,
                                "provinces": {
                                    "江苏": {
                                        "count": 3,
                                        "sum": 60,
                                        "cities": {
                                            "无锡": {
                                                "count": 1,
                                                "sum": 20,
                                            },
                                            "南京": {
                                                "count": 2,
                                                "sum": 40,
                                            }
                                        }
                                    }
                                }
                            });
                        });
                });

                it('指定日前N名排名', function () {
                    return statistics.topN(1, thisYear, thisMonth, thisDay)
                        .then(function (data) {
                            expect(data).eql({
                                "year": thisYear,
                                "month": thisMonth,
                                "day": thisDay,
                                "top": 1,
                                "count": 3,
                                "sum": 60,
                                "percent": 66.67,
                                "details": [
                                    {
                                        lord: {
                                            nickname: usersInDb[0].name,
                                            name: usersInDb[0].realname,
                                            province: usersInDb[0].province,
                                            city: usersInDb[0].city,
                                            phone: usersInDb[0].phone,
                                            addr: usersInDb[0].addr,
                                            email: usersInDb[0].email,
                                        },
                                        count: 2,
                                        sum: 40
                                    }
                                ]
                            });
                        });
                });
            });

            describe('祈福', function () {
                var prays, lordid, pray;

                beforeEach(function () {
                    prays = require("../server/modules/prays");
                    lordid = usersInDb[0]._id;
                    pray = 'my pray to be added';
                });

                describe('读取祈福', function () {
                    it('标识不合法', function (done) {
                        prays.findByLordAndId("58f1d1c9a", "58f1d1c9aa0f364b6cb1231e")
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('未查找到指定祈福 ', function (done) {
                        prays.findByLordAndId("58f1d1c9aa0f364b6cb1231e", "58f1d1c9aa0f364b6cb1231e")
                            .then(function (apray) {
                                expect(apray).to.be.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('正确查找到指定祈福 ', function (done) {
                        prays.findByLordAndId(praysInDb[0]._id, usersInDb[0]._id)
                            .then(function (apray) {
                                expect(apray).not.null;
                                expect(apray.context).eql(praysInDb[0].context);
                                expect(apray.date).eql(praysInDb[0].date);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });
                });

                describe('添加祈福', function () {
                    it('功德主标识不合法', function (done) {
                        prays.add("58f1d1c9a", pray)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('功德主不存在', function (done) {
                        prays.add("58f1d1c9aa0f364b6cb1231e", pray)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('添加祈福成功', function (done) {
                        prays.add(lordid, pray)
                            .then(function (data) {
                                expect(data._id).not.null;
                                expect(data.context).eql(pray);
                                expect(data.printed).eql(false);
                                var today = new Date();
                                expect(data.date.getFullYear()).eql(today.getFullYear());
                                expect(data.date.getMonth()).eql(today.getMonth());
                                expect(data.date.getDate()).eql(today.getDate());
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            });
                    })
                });

                it('统计祈福的人次-未做祈福', function (done) {
                    prays.countTimesOfPrays(usersInDb[3]._id)
                        .then(function (data) {
                            expect(data).eql({
                                me: 0,
                                total: {
                                    NOP: 3,
                                    times: 4
                                }
                            });
                            done();
                        })
                        .catch(function (err) {
                            expect(err).not.null;
                            done(err);
                        })
                });

                it('统计祈福的人次', function (done) {
                    prays.countTimesOfPrays(usersInDb[0]._id)
                        .then(function (data) {
                            expect(data).eql({
                                me: 2,
                                total: {
                                    NOP: 3,
                                    times: 4
                                }
                            });
                            done();
                        })
                        .catch(function (err) {
                            expect(err).not.null;
                            done(err);
                        })
                });

                it('列出所有未打印的祈福', function (done) {
                    prays.praysToPrint()
                        .then(function (list) {
                            expect(list.length).eql(3);
                            expect(list[0]).eql(praysInDb[0]._doc);
                            done()
                        })
                        .catch(function (err) {
                            expect(err).not.null;
                            done(err);
                        })
                });

                it('更新已打印祈福的状态', function (done) {
                    prays.setAllPrinted()
                        .then(function (rows) {
                            expect(rows).eql({
                                "n": 3,
                                "nModified": 3,
                                "ok": 1
                            });
                            var praySchema = require('../server/wechat/models/pray');
                            return praySchema.find({printed: false});
                        })
                        .then(function (list) {
                            expect(list.length).eql(0);
                            done();
                        })
                        .catch(function (err) {
                            expect(err).not.null;
                            done(err);
                        })
                });
            });

            describe('功课', function () {
                var lessons, lordid, lessonid;

                beforeEach(function () {
                    lessons = require("../server/modules/lessons");
                    lordid = usersInDb[0]._id;
                    lessonid = lessonsInDb[1]._id;
                });

                describe('查询指定功课的共修及指定同修的修行状况', function () {
                    it('功课标识不合法', function (done) {
                        lessons.getLessonPractices("58f1d1c9a", lordid)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('功德主标识不合法', function (done) {
                        lessons.getLessonPractices(lessonid, "58f1d1c9a")
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('获得共修状况', function (done) {
                        lessons.getLessonPractices(lessonid, usersInDb[1]._id)
                            .then(function (practices) {
                                expect(practices).eql({
                                    join: 1,
                                    practice: 3000,
                                    me: {
                                        practice: 3000,
                                        begDate: practicesInDb[1].begDate
                                    }
                                });
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                });

                describe('列出各功课的当前状态', function () {
                    it('功德主标识不合法', function (done) {
                        lessons.listLessons("58f1d1c9a")
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('列出各功课的当前状态', function (done) {
                        lessons.listLessons(lordid)
                            .then(function (list) {
                                expect(list).eql([
                                    {
                                        lesson: {
                                            _id: lessonsInDb[0]._id,
                                            name: lessonsInDb[0].name,
                                            img: lessonsInDb[0].img,
                                            unit: lessonsInDb[0].unit
                                        },
                                        join: 1,
                                        practice: 2000,
                                        me: {
                                            practice: 2000,
                                            begDate: practicesInDb[0].begDate
                                        },
                                    },
                                    {
                                        lesson: {
                                            _id: lessonsInDb[1]._id,
                                            name: lessonsInDb[1].name,
                                            img: lessonsInDb[1].img,
                                            unit: lessonsInDb[1].unit
                                        },
                                        join: 1,
                                        practice: 3000,
                                        me: {
                                            practice: 0,
                                        },
                                    },
                                ]);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('列出指定用户参与的各功课的当前状态', function (done) {
                        lessons.listMyLessons(lordid)
                            .then(function (list) {
                                expect(list).eql([
                                    {
                                        lesson: {
                                            _id: lessonsInDb[0]._id,
                                            name: lessonsInDb[0].name,
                                            img: lessonsInDb[0].img,
                                            unit: lessonsInDb[0].unit
                                        },
                                        join: 1,
                                        practice: 2000,
                                        me: {
                                            practice: 2000,
                                            begDate: practicesInDb[0].begDate
                                        },
                                    },
                                ]);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                });

                describe('功课报数', function () {
                    it('功德主标识不合法', function (done) {
                        lessons.announce("58f1d1c9a", lessonid, 5000)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('功课标识不合法', function (done) {
                        lessons.announce(lordid, "58f1d1c9a", 5000)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('功德主不存在', function (done) {
                        lessons.announce("58fc5f7d9395a84aaad50dad", lessonid, 5000)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('功课不存在', function (done) {
                        lessons.announce(lordid, "58fc5f7d9395a84aaad50dad", 5000)
                            .then(function () {
                                done(err);
                            })
                            .catch(function (err) {
                                expect(err).not.null;
                                done();
                            })
                    });

                    it('若功德主首次报负数或零，则未参加功课', function (done) {
                        lessons.announce(lordid, lessonid, -1)
                            .then(function (anno) {
                                expect(anno).null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('功课报数正确 - 功德主首次报数', function (done) {
                        lessons.announce(lordid, lessonid, 5000)
                            .then(function (anno) {
                                expect(anno.lord).eql(lordid);
                                expect(anno.lesson).eql(lessonid);
                                expect(new Date().getTime() - anno.begDate.getTime() < 5000).eql(true);
                                expect(anno.num).eql(5000);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('功课报数正确 - 功德主再次报数', function (done) {
                        lordid = lordid.toString();
                        lessonid = lessonsInDb[0]._id.toString();
                        lessons.announce(lordid, lessonid, -1000)
                            .then(function (anno) {
                                expect(anno.lord).eql(usersInDb[0]._id);
                                expect(anno.lesson).eql(lessonsInDb[0]._id);
                                expect(anno.begDate).eql(practicesInDb[0].begDate);
                                expect(anno.num).eql(1000);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('功课报数正确 - 功德主再次报数 - 过去曾经退出', function (done) {
                        lordid = usersInDb[2]._id;
                        lessons.announce(lordid, lessonid, 1000)
                            .then(function (anno) {
                                expect(anno._id).eql(practicesInDb[2]._id);
                                expect(anno.lord).eql(usersInDb[2]._id);
                                expect(anno.lesson).eql(lessonsInDb[1]._id);
                                expect(new Date().getTime() - anno.begDate.getTime() < 5000).eql(true);
                                //expect(new Date().getTime() - anno.begDate.getTime()).eql(true);
                                expect(anno.num).eql(1000);
                                expect(anno.state).eql('on');
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('功德主再次报数无效 - 过去曾经退出', function (done) {
                        lordid = usersInDb[2]._id;
                        lessons.announce(lordid, lessonid, 0)
                            .then(function (anno) {
                                expect(anno).null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });


                    it('功德主报数负数', function (done) {
                        lordid = lordid.toString();
                        lessonid = lessonsInDb[0]._id.toString();
                        lessons.announce(lordid, lessonid, -2000)
                            .then(function (anno) {
                                expect(anno).null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });
                });
            });

            describe('缓存accesstoken等', function () {
                var wxcache;
                var val, timeout;

                beforeEach(function () {
                    wxcache = require("../server/modules/wxcache");
                    val = '=909654739&openid=o0ghywSHHoT2BINz0CV1mNaWxhjQ';
                    timeout = 10;
                });

                describe('access token', function () {
                    it('首次缓存accesstoken', function (done) {
                        wxcache.setAccessToken(val, timeout)
                            .then(function (data) {
                                expect(data._id).not.null;
                                expect(data.type).eql('accesstoken');
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('更新accesstoken', function (done) {
                        var id;
                        wxcache.setAccessToken("adfnnfnfnfnf", 100)
                            .then(function (olddata) {
                                id = olddata._id;
                                return wxcache.setAccessToken(val, timeout);
                            })
                            .then(function (data) {
                                expect(data._id).eql(id);
                                expect(data.type).eql('accesstoken');
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取已过期的accesstoken', function (done) {
                        wxcache.setAccessToken(val, timeout)
                            .then(function (data) {
                                setTimeout(function () {
                                    return wxcache.getAccessToken()
                                        .then(function (token) {
                                            expect(token).null;
                                            done();
                                        });
                                }, timeout);
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取accesstoken', function (done) {
                        wxcache.setAccessToken(val, timeout)
                            .then(function (data) {
                                return wxcache.getAccessToken()
                                    .then(function (token) {
                                        expect(token).eql(val);
                                        done();
                                    });
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });
                });

                describe('Ticket For JsAPI', function () {
                    var token;

                    beforeEach(function () {
                        token = 'ghywSHHoT2BINz0CV1mNaWxhjQ';
                    });

                    it('首次缓存ticket', function (done) {
                        wxcache.setTicketForJsAPI(token, val, timeout)
                            .then(function (data) {
                                expect(data._id).not.null;
                                expect(data.type).eql('TicketForJsAPI');
                                expect(data.ref).eql(token);
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('更新ticket', function (done) {
                        var id;
                        wxcache.setTicketForJsAPI('tokenccccc', "adfnnfnfnfnf", 100)
                            .then(function (olddata) {
                                id = olddata._id;
                                return wxcache.setTicketForJsAPI(token, val, timeout);
                            })
                            .then(function (data) {
                                expect(data._id).eql(id);
                                expect(data.type).eql('TicketForJsAPI');
                                expect(data.ref).eql(token);
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取已过期的ticket', function (done) {
                        wxcache.setTicketForJsAPI(token, val, timeout)
                            .then(function (data) {
                                setTimeout(function () {
                                    return wxcache.getTicketForJsAPI(token)
                                        .then(function (ticket) {
                                            expect(ticket).null;
                                            done();
                                        });
                                }, timeout);
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取accesstoken已过期的ticket', function (done) {
                        wxcache.setTicketForJsAPI(token, val, timeout)
                            .then(function (data) {
                                return wxcache.getTicketForJsAPI('timeout token')
                                    .then(function (ticket) {
                                        expect(ticket).null;
                                        done();
                                    });
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取ticket', function (done) {
                        wxcache.setTicketForJsAPI(token, val, timeout)
                            .then(function (data) {
                                return wxcache.getTicketForJsAPI(token)
                                    .then(function (ticket) {
                                        expect(ticket).eql(val);
                                        done();
                                    });
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });
                });

                describe('第三方授权access token', function () {
                    var openid, refreshToken;

                    beforeEach(function () {
                        openid = 'ghywSHHoT2BINz0CV1mNaWxhjQ';
                        refreshToken = 'ddddddddddddddddwvev';
                    });

                    it('首次缓存', function (done) {
                        wxcache.setAuthAccessToken(openid, val, timeout, refreshToken)
                            .then(function (data) {
                                expect(data._id).not.null;
                                expect(data.type).eql('AuthAccessToken');
                                expect(data.ref).eql(openid);
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                expect(data.refresh).eql(refreshToken);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('更新', function (done) {
                        var id;
                        wxcache.setAuthAccessToken('tokenccccc', "adfnnfnfnfnf", 100, 'aaaaaaaaa')
                            .then(function (olddata) {
                                id = olddata._id;
                                return wxcache.setAuthAccessToken(openid, val, timeout, refreshToken);
                            })
                            .then(function (data) {
                                expect(data._id).eql(id);
                                expect(data.type).eql('AuthAccessToken');
                                expect(data.ref).eql(openid);
                                expect(data.val).eql(val);
                                expect(data.timeout).not.null;
                                expect(data.refresh).eql(refreshToken);
                                done();
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('未读到指定openid相关的AccessToken', function (done) {
                        wxcache.setAuthAccessToken(openid, val, timeout, refreshToken)
                            .then(function (data) {
                                return wxcache.getAuthAccessToken("unknown openid")
                                    .then(function (token) {
                                        expect(token).null;
                                        done();
                                    });
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('已过期', function (done) {
                        wxcache.setAuthAccessToken(openid, val, timeout, refreshToken)
                            .then(function (data) {
                                setTimeout(function () {
                                    return wxcache.getAuthAccessToken(openid)
                                        .then(function (token) {
                                            expect(token).null;
                                            done();
                                        });
                                }, timeout);
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });

                    it('读取ticket', function (done) {
                        wxcache.setTicketForJsAPI(openid, val, timeout)
                            .then(function (data) {
                                return wxcache.getTicketForJsAPI(openid)
                                    .then(function (ticket) {
                                        expect(ticket).eql(val);
                                        done();
                                    });
                            })
                            .catch(function (err) {
                                done(err);
                            })
                    });
                });
            });
        });
    });

    describe("Restful服务", function () {
        var linkages, urlTemplete, url, request, app, bodyParser;
        var requestAgent;
        var controller;

        before(function () {
            linkages = require('../server/rests');
        });

        beforeEach(function () {
            bodyParser = require('body-parser');
            requestAgent = require('supertest');
            app = require('express')();
            request = requestAgent(app);
            app.use(bodyParser.json());
        });

        describe('rest服务的路由', function () {
            var routes;

            beforeEach(function () {
                controller = function (req, res) {
                    return res.json(200, {data: 'ok'});
                };
            });

            describe('功德主', function () {
                //TODO:实现读取功德主的restful服务
                it('读取功德主', function (done) {
                    url = linkages.getLink('lord', {id: 43567});
                    stubs['./rest/lords'] = {lord: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/lords/43567');
                    request.get(url)
                        .expect(200, {data: 'ok'}, done);
                });
            });

            describe('祈福', function () {
                it('读取祈福', function (done) {
                    url = linkages.getLink('lordPray', {lordid: 43567, prayid: "abcdef"});
                    stubs['./rest/prays'] = {pray: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/lords/43567/prays/abcdef');
                    request.get(url)
                        .expect(200, {data: 'ok'}, done);
                });

                it('添加祈福', function (done) {
                    url = linkages.getLink('lordPrays', {id: 43567});
                    stubs['./rest/prays'] = {add: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/lords/43567/prays');
                    request.post(url)
                        .expect(200, {data: 'ok'}, done);
                });
            });

            it('统计服务', function (done) {
                url = linkages.getLink('manjusriStatistics');
                stubs['./rest/statistics'] = {query: controller}
                routes = proxyquire('../server/routes', stubs);
                routes.attachTo(app);

                expect(url).eql('/jingyin/rests/manjusri/statistics');
                request.get(url)
                    .expect(200, {data: 'ok'}, done);
            });

            describe('功课', function () {
                it('功课报数', function (done) {
                    url = linkages.getLink('lessonPractices', {lordid: 43567, lessonid: 3456});
                    stubs['./rest/practices'] = {announcePractice: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/practices/lords/43567/lessons/3456');
                    request.post(url)
                        .expect(200, {data: 'ok'}, done);
                });

                it('查询功课共修状况', function (done) {
                    url = linkages.getLink('lessonPractices', {lordid: 43567, lessonid: 3456});
                    stubs['./rest/practices'] = {getLessonPractices: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/practices/lords/43567/lessons/3456');
                    request.get(url)
                        .expect(200, {data: 'ok'}, done);
                });

                it('新增功课', function (done) {
                    url = linkages.getLink('lessonsResource');
                    stubs['./rest/practices'] = {addLesson: controller}
                    routes = proxyquire('../server/routes', stubs);
                    routes.attachTo(app);

                    expect(url).eql('/jingyin/rests/lessons');
                    request.post(url)
                        .expect(200, {data: 'ok'}, done);
                });
            })
        });

        describe('祈福', function () {
            var userid;

            beforeEach(function () {
                userid = "gdggdgd";
            });

            describe('获得功德主特定的祈福', function () {
                var findPrayStub;
                var prayid, prayObj;

                beforeEach(function () {
                    prayid = '12345';
                    userid = "gdggdgd";
                    prayObj = {pray: "abcdef"};
                    urlTemplete = linkages.getUrlTemplete('lordPray');
                    url = linkages.getLink('lordPray', {lordid: userid, prayid: prayid});
                });

                it('查找指定祈福失败', function (done) {
                    findPrayStub = createPromiseStub([userid, prayid], null, err);
                    stubs['../modules/prays'] = {findByLordAndId: findPrayStub};
                    controller = proxyquire('../server/rest/prays', stubs).pray;

                    app.get(urlTemplete, controller);
                    request
                        .get(url)
                        .expect(500, err, done);
                });

                it('未能查找到指定祈福', function (done) {
                    findPrayStub = createPromiseStub([userid, prayid], [null]);
                    stubs['../modules/prays'] = {findByLordAndId: findPrayStub};
                    controller = proxyquire('../server/rest/prays', stubs).pray;

                    app.get(urlTemplete, controller);
                    request
                        .get(url)
                        .expect(404, done);
                });

                it('查找到指定祈福', function (done) {
                    var thePray = {id: "dfdfvkfvdf"};
                    findPrayStub = createPromiseStub([userid, prayid], [thePray]);
                    stubs['../modules/prays'] = {findByLordAndId: findPrayStub};
                    controller = proxyquire('../server/rest/prays', stubs).pray;

                    app.get(urlTemplete, controller);
                    request
                        .get(url)
                        .expect(200, {
                            data: thePray,
                            links: {
                                self: url,
                                related: {
                                    lord: linkages.getLink('lord', {id: userid})
                                }
                            }
                        }, done);
                });
            });

            describe('提交祈福卡', function () {
                var dataToPost;
                var linkageStub, addPrayStub;

                beforeEach(function () {
                    dataToPost = {pray: "abcdef"};
                    urlTemplete = linkages.getUrlTemplete('lordPrays');
                    url = linkages.getLink('lordPrays', {id: userid});
                    linkageStub = sinon.stub();
                    stubs['../rests'] = {getLink: linkageStub};
                });

                it('保存祈福内容失败', function (done) {
                    addPrayStub = createPromiseStub([userid, dataToPost.pray], null, err);
                    stubs['../modules/prays'] = {add: addPrayStub};
                    controller = proxyquire('../server/rest/prays', stubs).add;

                    app.post(urlTemplete, controller);
                    request
                        .post(url)
                        .send(dataToPost)
                        .expect(500, err, done);
                });

                it('保存祈福成功', function (done) {
                    var prayid = 1234556;
                    var prayobj = {_id: prayid};
                    var selflink = "/url/self";
                    var lordpraylink = "/url/lord/pray";
                    var lordlink = "/url/lord";

                    linkageStub.withArgs("lordPrays", {id: userid}).returns(selflink);
                    linkageStub.withArgs("lordPray", {lordid: userid, prayid: prayid}).returns(lordpraylink);
                    linkageStub.withArgs("lord", {id: userid}).returns(lordlink);


                    addPrayStub = createPromiseStub([userid, dataToPost.pray], [prayobj]);
                    stubs['../modules/prays'] = {add: addPrayStub};
                    controller = proxyquire('../server/rest/prays', stubs).add;

                    app.post(urlTemplete, controller);
                    request
                        .post(url)
                        .send(dataToPost)
                        .expect(201, {
                            data: prayobj,
                            links: {
                                self: selflink,
                                related: {
                                    pray: lordpraylink,
                                    lord: lordlink,
                                }
                            }
                        }, done);
                });
            });
        });

        describe('统计', function () {
            var statistics, queryStub;
            var data;

            beforeEach(function () {
                data = {foo: 1, fee: 2};
                url = '/foo/url';
            });

            it('查询参数中未包含查询类型', function (done) {
                controller = require('../server/rest/statistics').query;

                app.get(url, controller);
                request
                    .get(url)
                    .expect(400, {error: "The query parameter[type] is missed!"}, done);
            });

            it('未知查询类型', function (done) {
                controller = require('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + '?type=foo')
                    .expect(400, {error: "The query parameter[type] is invalide!"}, done);
            });

            it('数据查询失败', function (done) {
                queryStub = createPromiseStub([], null, err);
                stubs['../modules/statistics'] = {byYears: queryStub};
                controller = proxyquire('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + "?type=byYears")
                    .expect(500, err, done);
            });

            it('成功', function (done) {
                queryStub = createPromiseStub([], [data]);
                stubs['../modules/statistics'] = {byYears: queryStub};
                controller = proxyquire('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + "?type=byYears")
                    .expect(200, data, done);
            });

            it('查询N名排名，当前使用前20000名', function (done) {
                queryStub = createPromiseStub([20000], [data]);
                stubs['../modules/statistics'] = {topN: queryStub};
                controller = proxyquire('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + "?type=topN")
                    .expect(200, data, done);
            });

            it('查询指定N名排名', function (done) {
                queryStub = createPromiseStub([40], [data]);
                stubs['../modules/statistics'] = {topN: queryStub};
                controller = proxyquire('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + "?type=topN&top=40")
                    .expect(200, data, done);
            });

            it('查询指定N名排名时，top查询参数不合法', function (done) {
                controller = require('../server/rest/statistics').query;
                app.get(url, controller);
                request
                    .get(url + "?type=topN&top=aa")
                    .expect(400, {error: "The value of query parameter[top] is invalide!"}, done);
            });

            it('按金额等级查询，当前使用[1000, 5000, 10000]', function (done) {
                var range = {range: "fooo"};
                var utilStub = sinon.stub();
                utilStub.withArgs([1000, 5000, 10000, null]).returns(range);
                stubs['../../modules/utils'] = {range: {create: utilStub}};

                queryStub = createPromiseStub([range], [data]);
                stubs['../modules/statistics'] = {eachRangeOfAmount: queryStub};
                controller = proxyquire('../server/rest/statistics', stubs).query;

                app.get(url, controller);
                request
                    .get(url + "?type=eachRangeOfAmount")
                    .expect(200, data, done);
            });

            describe('查询指定期间', function () {
                var year, month, day;

                beforeEach(function () {
                    var today = new Date();
                    year = today.getFullYear();
                    month = today.getMonth() + 1;
                    day = today.getDate();
                });

                it('指定月份却未指定年份时缺省使用当年', function (done) {
                    queryStub = createPromiseStub([year, 4], [data]);
                    stubs['../modules/statistics'] = {byProvicesAndCities: queryStub};
                    controller = proxyquire('../server/rest/statistics', stubs).query;

                    app.get(url, controller);
                    request
                        .get(url + "?type=byProvicesAndCities&month=4")
                        .expect(200, data, done);
                });

                it('指定日却未指定年份和月份时，缺省使用当年当月', function (done) {
                    queryStub = createPromiseStub([year, month, 21], [data]);
                    stubs['../modules/statistics'] = {byProvicesAndCities: queryStub};
                    controller = proxyquire('../server/rest/statistics', stubs).query;

                    app.get(url, controller);
                    request
                        .get(url + "?type=byProvicesAndCities&day=21")
                        .expect(200, data, done);
                });

                describe('指定年月日不合法', function () {
                    beforeEach(function () {
                        controller = require('../server/rest/statistics').query;
                        app.get(url, controller);
                    });

                    it('指定年份不合法', function (done) {
                        request
                            .get(url + '?type=byProvicesAndCities&year=abc')
                            .expect(400, {error: "The value of query parameter[year] is invalide!"}, done);
                    });

                    it('指定月份不合法', function (done) {
                        request
                            .get(url + '?type=byProvicesAndCities&month=0')
                            .expect(400, {error: "The value of query parameter[month] is invalide!"}, done);
                    });

                    it('指定日不合法', function (done) {
                        request
                            .get(url + '?type=byProvicesAndCities&day=34')
                            .expect(400, {error: "The value of query parameter[day] is invalide!"}, done);
                    });

                    it('指定润月日不合法', function (done) {
                        request
                            .get(url + '?type=byProvicesAndCities&month=2&day=29')
                            .expect(400, {error: "The value of query parameter[day] is invalide!"}, done);
                    });
                });

                it('成功', function (done) {
                    queryStub = createPromiseStub([2019, 5, 26], [data]);
                    stubs['../modules/statistics'] = {byProvicesAndCities: queryStub};
                    controller = proxyquire('../server/rest/statistics', stubs).query;

                    app.get(url, controller);
                    request
                        .get(url + "?type=byProvicesAndCities&month=5&year=2019&day=26")
                        .expect(200, data, done);
                });
            });
        });

        describe('virtues', function () {
            var virtues;
            beforeEach(function () {
                virtues = require('../server/rest/virtues');
            });

            describe("预置交易单", function () {
                var trans;
                var id, obj, virtueModelPlaceStub;
                var self, payUrl, getLinkStub;
                var prepay;

                beforeEach(function () {
                    prepay = virtues.prepay;
                    trans = {
                        subject: 12345667,
                        amount: 45.67,
                        giving: 'this is giving'
                    }
                    expectedVirtuePlaceParams = [
                        trans.subject,
                        trans.amount,
                        null,
                        trans.giving
                    ];

                    id = 1235566;
                    obj = {
                        id: id,
                        others: 'others'
                    }
                    virtueModelPlaceStub = createPromiseStub(expectedVirtuePlaceParams, [obj]);
                    stubs['../modules/virtues'] = {place: virtueModelPlaceStub};

                    self = 'self/link';
                    payUrl = 'weixin/pay';
                    getLinkStub = sinon.stub();
                    getLinkStub.withArgs('virtue', {id: id}).returns(self);
                    getLinkStub.withArgs('pay', {virtue: id}).returns(payUrl);
                    stubs['../rests'] = {getLink: getLinkStub};
                });

                it('预置捐助交易失败', function (done) {
                    virtueModelPlaceStub = createPromiseStub(expectedVirtuePlaceParams, null, err);
                    stubs['../modules/virtues'] = {place: virtueModelPlaceStub};

                    prepay = proxyquire('../server/rest/virtues', stubs).prepay;
                    app.post('/prepay', prepay);

                    request
                        .post('/prepay')
                        .send(trans)
                        .expect(500, err, done);
                });

                it('成功, 捐助交易中不包含数量和价格', function (done) {
                    prepay = proxyquire('../server/rest/virtues', stubs).prepay;
                    app.post('/prepay', prepay);

                    request
                        .post('/prepay')
                        .send(trans)
                        .expect('link', '<' + self + '>; rel="self", <' + payUrl + '>; rel="pay"')
                        .expect('Location', self)
                        .expect(201, obj, done);
                });

                it('更新法物数量失败', function (done) {
                    var num = '2';
                    var price = '25.67';
                    trans.num = num;
                    trans.price = price;

                    expectedVirtuePlaceParams[2] = {price: price, num: num};
                    virtueModelPlaceStub = createPromiseStub(expectedVirtuePlaceParams, [obj]);
                    stubs['../modules/virtues'] = {place: virtueModelPlaceStub};

                    var updatePartNumStub = createPromiseStub([trans.subject, num * 1], null, err);
                    stubs['../modules/parts'] = {updatePartNum: updatePartNumStub};

                    prepay = proxyquire('../server/rest/virtues', stubs).prepay;
                    app.post('/prepay', prepay);

                    request
                        .post('/prepay')
                        .send(trans)
                        .expect(500, err, done);
                });

                it('成功, 捐助交易中包含数量和价格', function (done) {
                    var num = '2';
                    var price = '25.67';
                    trans.num = num;
                    trans.price = price;

                    expectedVirtuePlaceParams[2] = {price: price, num: num};
                    virtueModelPlaceStub = createPromiseStub(expectedVirtuePlaceParams, [obj]);
                    stubs['../modules/virtues'] = {place: virtueModelPlaceStub};

                    var updatePartNumStub = createPromiseStub([trans.subject, 2], []);
                    stubs['../modules/parts'] = {updatePartNum: updatePartNumStub};

                    prepay = proxyquire('../server/rest/virtues', stubs).prepay;
                    app.post('/prepay', prepay);

                    request
                        .post('/prepay')
                        .send(trans)
                        //TODO: 根据资源定义由framework中间件实现
                        //.expect('Content-Type', 'application/json; charset=utf-8')
                        //.expect('link', '<http://jingyintemple.top/rest/profile>; rel="profile", <http://jingyintemple.top/rest/profile>; rel="self"')
                        //------------------------------------------------------------------------

                        .expect('link', '<' + self + '>; rel="self", <' + payUrl + '>; rel="pay"')
                        .expect('Location', self)
                        .expect(201, obj, done);
                });
            });

            describe('捐助交易支付成功', function () {
                var virtueId, openId, payDataFromWeixin
            })
        });

        describe('功课', function () {
            describe('功课', function () {
                var lordid, lessonid, practice;

                beforeEach(function () {
                    lordid = "sdcsdsdvsdv";
                    lessonid = "aaaa64747";
                    practice = {foo: "ff"};
                    urlTemplete = linkages.getUrlTemplete('lessonPractices');
                    url = linkages.getLink('lessonPractices', {lordid: lordid, lessonid: lessonid});
                });

                describe('获得指定功课的共修状况', function () {
                    var getLessonPracticesStub;

                    beforeEach(function () {
                    });

                    it('查询失败', function (done) {
                        getLessonPracticesStub = createPromiseStub([lessonid, lordid], null, err);
                        stubs['../modules/lessons'] = {getLessonPractices: getLessonPracticesStub};
                        controller = proxyquire('../server/rest/practices', stubs).getLessonPractices;

                        app.get(urlTemplete, controller);
                        request
                            .get(url)
                            .expect(500, err, done);
                    });

                    it('查询成功', function (done) {
                        getLessonPracticesStub = createPromiseStub([lessonid, lordid], [practice]);
                        stubs['../modules/lessons'] = {getLessonPractices: getLessonPracticesStub};
                        controller = proxyquire('../server/rest/practices', stubs).getLessonPractices;

                        app.get(urlTemplete, controller);
                        request
                            .get(url)
                            .expect(200, {
                                data: practice,
                                links: {self: url}
                            }, done);
                    });
                });

                describe('功课报数', function () {
                    var num;
                    var announceStub;

                    beforeEach(function () {
                        num = 100;
                    });

                    it('保存功课报数失败', function (done) {
                        announceStub = createPromiseStub([lordid, lessonid, num], null, err);
                        stubs['../modules/lessons'] = {announce: announceStub};
                        controller = proxyquire('../server/rest/practices', stubs).announcePractice;

                        app.post(urlTemplete, controller);
                        request
                            .post(url)
                            .send({num: num})
                            .expect(500, err, done);
                    });

                    it('保存功课报数成功', function (done) {
                        announceStub = createPromiseStub([lordid, lessonid, num], [practice]);
                        stubs['../modules/lessons'] = {announce: announceStub};
                        controller = proxyquire('../server/rest/practices', stubs).announcePractice;

                        app.post(urlTemplete, controller);
                        request
                            .post(url)
                            .send({num: num})
                            .expect(200, {
                                data: practice
                            }, done);
                    });
                });
            });

            describe('新增功课', function () {
                var lessonid, newlessonData, lessonData, addStub, selflink;

                beforeEach(function () {
                    lessonid = 12345;
                    newlessonData = {name: 'foo'};
                    lessonData = {_id: lessonid, name: 'foo'};
                    selflink = "/self/link";
                    urlTemplete = linkages.getUrlTemplete('lessonsResource');
                    url = linkages.getLink('lessonsResource');
                });

                it('新增功课失败', function (done) {
                    addStub = createPromiseStub([newlessonData], null, err);
                    stubs['../modules/lessons'] = {add: addStub};
                    controller = proxyquire('../server/rest/practices', stubs).addLesson;

                    app.post(urlTemplete, controller);
                    request
                        .post(url)
                        .send(newlessonData)
                        .expect(500, err, done);
                });

                it('新增功课成功', function (done) {
                    addStub = createPromiseStub([newlessonData], [lessonData]);
                    stubs['../modules/lessons'] = {add: addStub};
                    controller = proxyquire('../server/rest/practices', stubs).addLesson;

                    app.post(urlTemplete, controller);
                    request
                        .post(url)
                        .send(newlessonData)
                        .expect(201, {
                            data: lessonData,
                            links: {
                                self: linkages.getLink("lessonResource", {id: lessonid})
                            }
                        }, done);
                });
            });
        });
    });

    describe('技术', function () {
        describe('Http请求', function () {
            var opt, request, data;
            var simpleGetStub;
            beforeEach(function () {
                opt = {
                    url: 'http://example.com',
                    method: 'POST',
                    body: 'this is the POST body',
                    headers: {
                        'user-agent': 'my cool app'
                    },
                    json: true
                }
                data = {foo: 'foo'};
                simpleGetStub = sinon.stub();
            });

            it('请求失败', function () {
                simpleGetStub.withArgs(opt).callsArgWith(1, err);
                stubs['simple-get'] = {concat: simpleGetStub};
                request = proxyquire('../modules/httprequest', stubs);
                return request.concat(opt)
                    .then(function (responseData) {
                        expect(err).to.be.undefined;
                    }, function (error) {
                        expect(error).eql(err);
                    })
            });

            it('请求成功', function () {
                simpleGetStub.withArgs(opt).callsArgWith(1, null, null, data);
                stubs['simple-get'] = {concat: simpleGetStub};
                request = proxyquire('../modules/httprequest', stubs);
                return request.concat(opt)
                    .then(function (responseData) {
                        expect(responseData).eql(data);
                    }, function (error) {
                        expect(err).to.be.null;
                    });
            });
        });

        describe('关于日期', function () {
            it('today', function () {
                var d = new Date();
                var thedate = d.getDate();
                var todaystart = new Date();
                todaystart.setHours(0, 0, 0, 0);
                var todaystartend = new Date();
                todaystartend.setHours(23, 59, 59, 999);
                var thisyear, thismonth;
                thisyear = d.getFullYear();
                thismonth = d.getMonth();
                var firstDayOfThisMonth = new Date(thisyear, thismonth, 1);
                var lastDayOfThisMonth = new Date(new Date(thisyear, thismonth + 1, 1) - 1);

                var days = lastDayOfThisMonth - firstDayOfThisMonth;
            })
        });

        describe('集群', function () {
            it('cpu', function () {
                var os = require('os');
                //expect(os.cpus().length).eql(2);
            })
        })
    });

    describe('utils', function () {
        var utils;

        it('直接从GET请求中获取JSON对象', function () {
            var data = {
                foo: 'foo',
                fee: 'fee'
            }
            var url = 'http://something';
            var buffer = new Buffer(JSON.stringify(data));
            var simpleGetStub = sinon.stub();
            simpleGetStub.withArgs(url).callsArgWith(1, null, null, buffer);
            stubs['simple-get'] = {concat: simpleGetStub}

            utils = proxyquire('../modules/utils', stubs);
            var callbackIsCalled = false;
            utils.simpleGetJson(url, function (err, obj) {
                callbackIsCalled = true;
                expect(err).to.be.null;
                expect(obj).eql(data);
            });
            expect(callbackIsCalled).to.be.true;

        });

        it('四舍五入', function () {
            round = require('../modules/utils').round;
            expect(round(2 / 3, 2)).eql(0.67);
        });

        describe('日期 utils', function () {

            var theDay, expected;
            beforeEach(function () {
                theDay = new Date(2017, 1, 17);
                utils = require('../modules/utils').dateUtils;
            });

            it('昨日最晚', function () {
                expected = new Date(new Date(2017, 1, 16).setHours(23, 59, 59, 999));
                expect(utils.maxYestoday(theDay)).eql(expected);
            });

            it('明日最早', function () {
                expected = new Date(new Date(2017, 1, 18).setHours(0, 0, 0, 0));
                var actual = utils.minTomorrow(theDay);
                expect(actual).eql(expected);
            });

            it('今日最早', function () {
                expect(utils.minToday(theDay)).eql(theDay);
            });

            it('今日最晚', function () {
                expected = new Date(theDay.setHours(23, 59, 59, 999));
                expect(utils.maxToday(theDay)).eql(expected);
            });

            it('本月最早', function () {
                expected = utils.minToday(new Date(2017, 1, 1));
                expect(utils.minThisMonth(theDay)).eql(expected);
            });

            it('本月最晚', function () {
                expected = utils.maxToday(new Date(2017, 1, 28));
                expect(utils.maxThisMonth(theDay)).eql(expected);
            });
        });

        describe('范围', function () {
            var range;

            beforeEach(function () {
                range = require('../modules/utils').range;
            });

            it('范围在上下限之间', function () {
                var rangeObj = range.create([20, 50]);
                expect(rangeObj[0].exp()).eql({$gte: 20, $lt: 50});
                expect(rangeObj[0].name()).eql([20, 50]);
            });

            it('大于下限', function () {
                var rangeObj = range.create([20, null]);
                expect(rangeObj[0].exp()).eql({$gte: 20});
                expect(rangeObj[0].name()).eql([20, null]);
            });

            it('小于上限', function () {
                var rangeObj = range.create([null, 50]);
                expect(rangeObj[0].exp()).eql({$lt: 50});
                expect(rangeObj[0].name()).eql([null, 50]);
            });

            it('多个区间', function () {
                var rangeObj = range.create([20, 50, 80, null]);

                expect(rangeObj[0].exp()).eql({$gte: 20, $lt: 50});
                expect(rangeObj[0].name()).eql([20, 50]);
                expect(rangeObj[1].exp()).eql({$gte: 50, $lt: 80});
                expect(rangeObj[1].name()).eql([50, 80]);
                expect(rangeObj[2].exp()).eql({$gte: 80});
                expect(rangeObj[2].name()).eql([80, null]);
            });
        })
    });

    describe('Response Wrapper', function () {
        var wrapper, resStub;
        var endSpy, statusSpy, renderSpy, resSendSpy;
        beforeEach(function () {
            statusSpy = sinon.spy();
            endSpy = sinon.spy();
            renderSpy = sinon.spy();
            resSendSpy = sinon.spy();
            resStub = {
                status: statusSpy,
                end: endSpy,
                render: renderSpy,
                send: resSendSpy
            }
            wrapper = require('../modules/responsewrap')(resStub);
        });

        it('设置响应状态码并立刻将响应发送至客户端', function () {
            var code = 400;
            wrapper.setError(code);
            expect(statusSpy).calledWith(400).calledOnce;
            expect(endSpy).calledOnce;
        });

        it('设置响应状态码及相关原因，并立刻将响应发送至客户端', function () {
            var code = 400;
            var msg = 'the reason of this status';
            wrapper.setError(code, msg);
            expect(statusSpy).calledWith(400).calledOnce;
            expect(resStub.statusMessage).eql(msg);
            expect(resSendSpy).calledWith(msg).calledOnce;
        });

        it('设置响应状态码及相关原因，响应体中包含详细错误', function () {
            var code = 400;
            var err = new Error();
            var msg = 'the reason of this status';
            wrapper.setError(code, msg, err);
            expect(statusSpy).calledWith(400).calledOnce;
            expect(resStub.statusMessage).eql(msg);
            expect(resSendSpy).calledWith(err).calledOnce;
        });

        it('渲染客户端', function () {
            var page = '../view/p1';
            var data = {foo: 'foo data'};

            wrapper.render(page, data);
            expect(renderSpy).calledWith('../view/p1', {foo: 'foo data'}).calledOnce;
        });
    });


    describe('微信公众号', function () {
        describe('微信MD5签名', function () {
            var weixinSignMD5, md5Stub, key, signResult, data;
            beforeEach(function () {
                key = 'hdhhdvdveqr';
                signResult = 'ddJfvndFnvdfgbsfbfg';
                data = {
                    sss: 1,
                    a: 567,
                    bbb: 2
                };
            });

            it('MD5签名', function () {
                md5Stub = sinon.stub();
                md5Stub.withArgs("a=567&bbb=2&sss=1&key=" + key).returns(signResult);
                stubs['md5'] = md5Stub;
                weixinSignMD5 = proxyquire('../modules/weixinsignmd5', stubs);

                expect(weixinSignMD5(data, key)).eql(signResult.toUpperCase());
            });
        });

        describe('微信接口配置', function () {
            var config;
            var appid, appsecret, mch_id, mch_key;
            var apiBaseURL, oauth2BaseURL;
            var payServerIp, payNotifyUrl;
            var nonce, nonceStub, sign, signStub, timestamp, timestampStub;

            beforeEach(function () {
                appid = 'appid';
                appsecret = 'appsecret';
                mch_id = 'eveqveqfvfvff';
                mch_key = 'womendoushiwutaishanjingyinsidet';
                apiBaseURL = 'apiBaseURL';
                oauth2BaseURL = 'oauth2BaseURL';
                siteBaseUrl = 'http://www.site.com';
                payServerIp = '121.41.93.210';
                payNotifyUrl = 'http://jingyintemple.top/jingyin/manjusri/pay/notify';
                nonce = 'adasfsfsgsgd';
                sign = 'dbcwgf4y84cwcned34r';
                timestamp = 4456457458865;
                nonceStub = sinon.stub();
                nonceStub.returns(nonce);
                signStub = sinon.stub();
                timestampStub = sinon.stub();
                timestampStub.returns(timestamp);

                config = require('../modules/weixinconfig')({
                    apiBaseURL: apiBaseURL,
                    appId: appid,
                    appSecret: appsecret,
                    oauth2BaseURL: oauth2BaseURL,
                    mchId: mch_id,
                    mchKey: mch_key,
                    siteBaseUrl: siteBaseUrl,
                    payServerIp: payServerIp,
                    payNotifyUrl: payNotifyUrl
                });
            });

            describe('网页授权url', function () {
                it('url未包含授权网站的BaseUrl', function () {
                    var url = "/foo/fee";
                    var expectedUrl = oauth2BaseURL + "?appid=" + appid
                        + "&redirect_uri=" + siteBaseUrl + url
                        + "&response_type=code&scope=snsapi_base#wechat_redirect";
                    expect(config.wrapRedirectURLByOath2WayBaseScope(url))
                        .eql(expectedUrl);
                });

                it('url已包含授权网站的BaseUrl', function () {
                    var url = siteBaseUrl + "/foo/fee";
                    var expectedUrl = oauth2BaseURL + "?appid=" + appid
                        + "&redirect_uri=" + url
                        + "&response_type=code&scope=snsapi_base#wechat_redirect";
                    expect(config.wrapRedirectURLByOath2WayBaseScope(url))
                        .eql(expectedUrl);
                });
            });

            it('获得accesstoken的Url', function () {
                var url = 'https://api.weixin.qq.com/cgi-bin/token?' +
                    'grant_type=client_credential&appid=' + appid + '&secret=' + appsecret;
                expect(config.getUrlToGetAccessToken()).eql(url);
            });

            it('获得openid的Url', function () {
                var code = '1234534566';
                var url = apiBaseURL + "access_token?appid="
                    + appid + "&secret=" + appsecret
                    + "&code=" + code + "&grant_type=authorization_code";
                expect(config.getUrlToGetOpenId(code)).eql(url);
            });

            it('获得微信用户信息的Url', function () {
                var token = '1234534566';
                var openid = 'hfcqehcehrv3f42f24yf34f';
                var url = 'https://api.weixin.qq.com/cgi-bin/user/info?' +
                    'access_token=' + token + '&openid=' + openid + '&lang=zh_CN';
                expect(config.getUrlToGetUserInfo(token, openid)).eql(url);
            });

            it('获得检验授权凭证（access_token）是否有效的Url', function () {
                var token = '1234534566';
                var openid = 'hfcqehcehrv3f42f24yf34f';
                var url = 'https://api.weixin.qq.com/sns/auth?' +
                    'access_token=' + token + '&openid=' + openid;
                expect(config.getUrlToCheckAccessToken(token, openid)).eql(url);
            });

            it('拼装预置微信支付请求', function () {
                var openId = 'foo-openid';
                var transId = 'transOrderNo';
                var transName = 'transOrder description';
                var amount = 58.7;

                var orderToSign = {
                    out_trade_no: transId,
                    body: transName,
                    detail: transName,
                    notify_url: payNotifyUrl,
                    openid: openId,
                    spbill_create_ip: payServerIp,
                    total_fee: Math.round(amount * 100),
                    attach: "jingyin",
                    appid: appid,
                    mch_id: mch_id,
                    nonce_str: nonce,
                    trade_type: "JSAPI",
                };
                var order = Object.assign({}, orderToSign);
                order.sign = sign;
                var prepayOrderXML = js2xmlparser.parse('xml', order);

                var expectedOption = {
                    url: 'https://api.mch.weixin.qq.com:443/pay/unifiedorder',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/xml',
                        "Content-Length": Buffer.byteLength(prepayOrderXML)
                    }
                }

                config.setNonceGenerator(nonceStub);
                signStub.withArgs(orderToSign, mch_key).returns(sign);
                config.setSignMD5(signStub);

                var result = config.getPrepayRequestOption(openId, transId, transName, amount);
                var bodyXml = result.body;
                delete result.body;

                expect(result).eql(expectedOption);
                expect(bodyXml).xml.to.equal(prepayOrderXML);
            });

            it('产生微信支付数据', function () {
                var prepayId = '234677889O9';
                var payDataToSign = {
                    appId: appid,
                    package: 'prepay_id=' + prepayId,
                    timeStamp: timestamp,
                    nonceStr: nonce,
                    signType: 'MD5'
                };

                config.setNonceGenerator(nonceStub);
                config.setTimestampGenerator(timestampStub);
                signStub.withArgs(payDataToSign, mch_key).returns(sign);
                config.setSignMD5(signStub);

                var payData = config.generatePayData(prepayId);
                var expectedPayData = payDataToSign;
                expectedPayData.paySign = sign;
                expectedPayData.prepay_id = prepayId;
                expect(payData).eql(expectedPayData);
            });

            describe('解读由微信给出的支付数据', function () {
                var paydata, openId, out_trade_no, transaction_id, sign;

                beforeEach(function () {
                    openId = 'wdgqeurf1bsdncsdvnefnf';
                    out_trade_no = '12345';
                    transaction_id = '98765';
                    sign = 'weergqergqergwerh45g1g';

                    paydata = {
                        result_code: 'SUCCESS',
                        return_code: 'SUCCESS',
                        openid: openId,
                        out_trade_no: out_trade_no,
                        transaction_id: transaction_id,
                        sign: sign
                    }

                    var paydataToSign = Object.assign({}, paydata);
                    delete paydataToSign.sign;
                    signStub.withArgs(paydataToSign, mch_key).returns(sign);
                    config.setSignMD5(signStub);
                });

                it('result_code!=SUCCESS则表示不成功', function () {
                    delete paydata.result_code;
                    var result = config.parsePaymentNotification(paydata);
                    expect(result.pass).to.be.false;
                });

                it('return_code!=SUCCESS则表示不成功', function () {
                    delete paydata.return_code;
                    var result = config.parsePaymentNotification(paydata);
                    expect(result.pass).to.be.false;
                });

                it('签名不一致则表示不成功', function () {
                    delete paydata.sign;
                    var result = config.parsePaymentNotification(paydata);
                    expect(result.pass).to.be.false;
                });

                it('支付成功', function () {
                    var result = config.parsePaymentNotification(paydata);
                    expect(result.pass).to.be.true;
                    expect(result.openId).eql(openId);
                    expect(result.virtueId).eql(out_trade_no);
                    expect(result.paymentNo).eql(transaction_id);
                });
            });
        });

        describe('微信接口Promise实现', function () {
            var weixinConfig, weixinFactory, weixin;

            beforeEach(function () {
                weixinConfig = {}
            });

            describe('获取AccessToken', function () {
                var requestStub, urlToGetAccessToken;

                beforeEach(function () {
                    urlToGetAccessToken = 'https:/api.weixin.qq.com/cgi-bin/...';
                    requestStub = sinon.stub();
                    requestStub.returns(urlToGetAccessToken);
                    weixinConfig.getUrlToGetAccessToken = requestStub;
                });

                it('微信接口访问失败', function () {
                    var requestStub = createPromiseStub([{url: urlToGetAccessToken, json: true}], null, err);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    return weixin.getAccessToken()
                        .then(function () {
                            throw 'get accesstoken should rejected!';
                        }, function (error) {
                            expect(error).eql(err);
                        });
                });

                it('正确获得', function () {
                    var accessToken = '233546457357';
                    var data = {access_token: accessToken};

                    var requestStub = createPromiseStub([{url: urlToGetAccessToken, json: true}], [data]);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    return weixin.getAccessToken()
                        .then(function (token) {
                            expect(token).eql(accessToken);
                        }, function (error) {
                            expect(err).to.be.null;
                        });
                })
            });

            describe('获得openId', function () {
                var requestStub, urlToGetOpenId;
                var code;

                beforeEach(function () {
                    code = '1234';
                    urlToGetOpenId = 'https:/api.weixin.qq.com/cgi-bin/getopenid...';
                    var getUrlToGetOpenIdStub = sinon.stub();
                    getUrlToGetOpenIdStub.withArgs(code).returns(urlToGetOpenId);
                    weixinConfig.getUrlToGetOpenId = getUrlToGetOpenIdStub;
                });

                it('微信接口访问失败', function () {
                    requestStub = createPromiseStub([{url: urlToGetOpenId, json: true}], null, err);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    return weixin.getOpenId(code)
                        .then(function () {
                            throw 'get openid should rejected!';
                        }, function (error) {
                            expect(error).eql(err);
                        });
                });

                it("获得OpenId", function () {
                    var expectedOpenId = '123456789033';
                    var dataFromWeixin = {openid: expectedOpenId};

                    requestStub = createPromiseStub([{url: urlToGetOpenId, json: true}], [dataFromWeixin]);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    return weixin.getOpenId(code)
                        .then(function (data) {
                            expect(data).eql(dataFromWeixin);
                        }, function (error) {
                            throw 'should not goes here';
                        });
                });
            })

            describe('获得特定OpenId的用户信息', function () {
                var openid, accesstoken, getAccessTokenStub;
                var requestStub, userInfo;

                beforeEach(function () {
                    openid = '123457744333';
                    accesstoken = 'cehqdcqeceqeg4h66n';
                    userInfo = {foo: 'foo user info'}

                    urlToGetUserInfo = 'https:/api.weixin.qq.com/cgi-bin/getuserinfo...';
                    var getUrlToGetUserInfoStub = sinon.stub();
                    getUrlToGetUserInfoStub.withArgs(accesstoken, openid).returns(urlToGetUserInfo);
                    weixinConfig.getUrlToGetUserInfo = getUrlToGetUserInfoStub;
                })

                it('获取accesstoken失败', function () {
                    getAccessTokenStub = createPromiseStub(null, null, err);
                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    weixin.getAccessToken = getAccessTokenStub;

                    return weixin.getUserInfoByOpenId(openid)
                        .then(function () {
                            throw 'should not goes here';
                        }, function (error) {
                            expect(error).eql(err);
                        });
                });

                it('获取用户信息失败', function () {
                    getAccessTokenStub = createPromiseStub(null, [accesstoken]);
                    requestStub = createPromiseStub([{url: urlToGetUserInfo, json: true}], null, err);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    weixin.getAccessToken = getAccessTokenStub;

                    return weixin.getUserInfoByOpenId(openid)
                        .then(function () {
                            throw 'should not goes here';
                        }, function (error) {
                            expect(error).eql(err);
                        });
                });

                it('获得用户信息', function () {
                    getAccessTokenStub = createPromiseStub(null, [accesstoken]);
                    requestStub = createPromiseStub([{url: urlToGetUserInfo, json: true}], [userInfo]);
                    stubs['./httprequest'] = {concat: requestStub}

                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);
                    weixin.getAccessToken = getAccessTokenStub;

                    return weixin.getUserInfoByOpenId(openid)
                        .then(function (data) {
                            expect(data).eql(userInfo);
                        }, function (error) {
                            throw 'should not goes here';
                        });
                })
            });

            describe('准备微信支付单', function () {
                var openId, transId, transName, amount;
                var prepayRequestOption;
                var prepayRequestStub;

                beforeEach(function () {
                    openId = 'foo-openid';
                    transId = 'transOrderNo';
                    transName = 'transOrder description';
                    amount = 58.7;

                    prepayRequestOption = {url: 'http://ssssss/ssss', methods: 'POST', body: 'any data in boby'};
                    var getPrepayRequestOptionStub = sinon.stub();
                    getPrepayRequestOptionStub.withArgs(openId, transId, transName, amount).returns(prepayRequestOption);
                    weixinConfig.getPrepayRequestOption = getPrepayRequestOptionStub;
                });

                it('请求预置微信支付失败', function () {
                    prepayRequestStub = createPromiseStub([prepayRequestOption], null, err);
                    stubs['./httprequest'] = {concat: prepayRequestStub}
                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);

                    return weixin.prepay(openId, transId, transName, amount)
                        .then(function () {
                            throw 'should not goes here';
                        }, function (error) {
                            expect(error).eql(err);
                        });
                });

                it('预置微信支付单未成功', function () {
                    var prepayXml = '<xml><err_code_desc>abcdefg</err_code_desc></xml>';

                    prepayRequestStub = createPromiseStub([prepayRequestOption], [prepayXml]);
                    stubs['./httprequest'] = {concat: prepayRequestStub}
                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);

                    return weixin.prepay(openId, transId, transName, amount)
                        .then(function (prepayid) {
                            throw 'should not goes here';
                        }, function (error) {
                            expect(error).eql(new Error('abcdefg'));
                        });
                });

                it('准备微信支付单', function () {
                    var prepayXml = '<xml><return_code><![CDATA[SUCCESS]]></return_code>' +
                        ' <return_msg><![CDATA[OK]]></return_msg> ' +
                        '<appid><![CDATA[wx76c06da9928cd6c3]]></appid>' +
                        ' <mch_id><![CDATA[1364986702]]></mch_id>' +
                        ' <nonce_str><![CDATA[mtQySHbBzr0BRIlY]]></nonce_str>' +
                        ' <sign><![CDATA[EB3B9DABCFF551E5185016E1E26C98BE]]></sign>' +
                        ' <result_code><![CDATA[SUCCESS]]></result_code>' +
                        ' <prepay_id><![CDATA[wx20161201131507f7a93ee1c90980898906]]></prepay_id>' +
                        ' <trade_type><![CDATA[JSAPI]]></trade_type> </xml>'

                    prepayRequestStub = createPromiseStub([prepayRequestOption], [prepayXml]);
                    stubs['./httprequest'] = {concat: prepayRequestStub}
                    weixinFactory = proxyquire('../modules/weixinfactory', stubs);
                    weixin = weixinFactory(weixinConfig);

                    var payData = {foo: 'foo', fee: 'fee', fuu: 'fuu'}
                    var genPayDataStub = sinon.stub();
                    genPayDataStub.withArgs('wx20161201131507f7a93ee1c90980898906').returns(payData);
                    weixinConfig.generatePayData = genPayDataStub;

                    return weixin.prepay(openId, transId, transName, amount)
                        .then(function (data) {
                            expect(data).eql(payData);
                        }, function (error) {
                            throw 'should not goes here';
                        });
                });
            });
        });

        describe('微信接口', function () {
            var weixinModule, weixinConfig;
            var apiBaseURL, appid, appsecret, oauth2BaseURL;
            var mch_id, mch_key;
            var weixin;

            beforeEach(function () {
                apiBaseURL = 'apiBaseURL';
                appid = 'appid';
                appsecret = 'appsecret';
                oauth2BaseURL = 'oauth2BaseURL';
                mch_id = 'eveqveqfvfvff';
                mch_key = 'womendoushiwutaishanjingyinsidet'; //-----IT IS VERY IMPORTMENT

                weixinConfig = {
                    apiBaseURL: apiBaseURL,
                    appId: appid,
                    appSecret: appsecret,
                    oauth2BaseURL: oauth2BaseURL,
                    mchId: mch_id,
                    mchKey: mch_key
                };
                weixinModule = require('../modules/weixin');
                weixin = weixinModule(weixinConfig);
            });
        });

        describe('服务端控制', function () {
            describe('处理请求（改版）', function () {
                var reqStub, resStub;
                var statusSpy, resEndSpy, resSendSyp, resRenderSpy;
                var controller;

                function checkResponseStatusCodeAndMessage(code, message, err) {
                    expect(statusSpy).calledWith(code).calledOnce;
                    if (message)
                        expect(resStub.statusMessage).eql(message);
                    if (err) {
                        var actual = resSendSyp.getCall(0).args[0];
                        expect(actual instanceof Error).true;
                        expect(actual.message).eql(err.message);
                    }
                }

                beforeEach(function () {
                    statusSpy = sinon.spy();
                    resSendSyp = sinon.spy();
                    resEndSpy = sinon.spy();
                    resRenderSpy = sinon.spy();

                    reqStub = {
                        query: {},
                        params: {}
                    };
                    resStub = {
                        status: statusSpy,
                        render: resRenderSpy,
                        send: resSendSyp,
                        end: resEndSpy
                    }
                });

                //TODO:重新考虑如何测试页面处理的路由
                /*describe('页面处理url Routes', function () {
                 var routes, authStub;
                 var request, express, app, bodyParser;
                 var requestAgent;
                 var linkages, controller, url;

                 beforeEach(function () {
                 bodyParser = require('body-parser');
                 requestAgent = require('supertest');
                 express = require('express');

                 app = express();

                 url = "/url/foo";
                 linkages = sinon.stub();
                 linkages.withArgs("home").returns(url + '/index');
                 linkages.withArgs("dailyVirtue").returns(url + '/dailyVirtue');
                 linkages.withArgs("suixi").returns(url + '/suixi');
                 linkages.withArgs("jiansi").returns(url + '/jiansi');
                 linkages.withArgs("pray").returns(url + '/pray');
                 stubs["./rests"] = {getUrlTemplete: linkages}

                 authStub = function (req, res, next) {
                 next();
                 }
                 stubs['./auth'] = {manjusri: authStub}

                 controller = function (req, res) {
                 return res.status(200).json({data: 'ok'});
                 };
                 });

                 it('首页', function (done) {
                 stubs['./wechat/manjusriPages'] = {home: controller}
                 routes = proxyquire('../server/routes', stubs);

                 routes.attachTo(app);
                 request = requestAgent(app);

                 request.get(url + '/index')
                 .expect(200, {data: 'ok'}, done);
                 });

                 it('日行一善', function (done) {
                 stubs['./wechat/manjusriPages'] = {dailyVirtue: controller}
                 routes = proxyquire('../server/routes', stubs);

                 routes.attachTo(app);
                 request = requestAgent(app);

                 request.get(url + '/dailyVirtue')
                 .expect(200, {data: 'ok'}, done);
                 });

                 it('随喜', function (done) {
                 stubs['./wechat/manjusriPages'] = {suixi: controller}
                 routes = proxyquire('../server/routes', stubs);

                 routes.attachTo(app);
                 request = requestAgent(app);

                 request.get(url + '/suixi')
                 .expect(200, {data: 'ok'}, done);
                 });

                 it('建寺', function (done) {
                 stubs['./wechat/manjusriPages'] = {jiansi: controller}
                 routes = proxyquire('../server/routes', stubs);

                 routes.attachTo(app);
                 request = requestAgent(app);

                 request.get(url + '/jiansi')
                 .expect(200, {data: 'ok'}, done);
                 });

                 it('祈福', function (done) {
                 stubs['./wechat/manjusriPages'] = {pray: controller}
                 routes = proxyquire('../server/routes', stubs);

                 routes.attachTo(app);
                 request = requestAgent(app);

                 request.get(url + '/pray')
                 .expect(200, {data: 'ok'}, done);
                 });
                 });*/

                describe('响应微信消息', function () {
                    var openid, msg, msgReplySpy;

                    beforeEach(function () {
                        controller = require('../server/wechat/wechat');
                        openid = '1234567890';
                        msg = {
                            FromUserName: openid,
                            MsgType: 'event',
                            Event: 'subscribe'
                        };
                        reqStub.weixin = msg;

                        msgReplySpy = sinon.spy();
                        resStub.reply = msgReplySpy;
                    });

                    it('对于无需处理的消息，直接应答空串', function () {
                        msg.Event = 'foo';
                        controller(reqStub, resStub);
                        expect(msgReplySpy).calledWith('');
                    });

                    describe('响应关注消息', function () {
                        it('应答欢迎信息', function () {
                            var user = {name: 'foo'};
                            var registerUserStub = createPromiseStub([null, openid], [user]);
                            stubs['../modules/users'] = {
                                register: registerUserStub
                            };

                            var answer = {foo: 'foo'};
                            var welcomeStub = createPromiseStub([user], [answer]);
                            stubs['../modules/welcome'] = welcomeStub;

                            controller = proxyquire('../server/wechat/wechat', stubs);
                            controller(reqStub, resStub);
                            expect(msgReplySpy).calledWith(answer);
                        });
                    });
                });

                describe('重定向', function () {
                    beforeEach(function () {
                    });

                    it('重定向到经微信认证的登录', function () {
                        reqStub.session = {};

                        var loginUrl = "redirects page url";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("login").returns(loginUrl);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var auth2WrapedUrl = 'url/to/auth2WrapedUrl';
                        var urlWrapStub = sinon.stub();
                        urlWrapStub.withArgs(loginUrl).returns(auth2WrapedUrl);
                        stubs['../weixin'] = {weixinConfig: {wrapRedirectURLByOath2Way: urlWrapStub}};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toLogin;
                        controller(reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(auth2WrapedUrl);
                    });

                    it('重定向到用户注册页面', function () {
                        var openid = "12324556";
                        var url = "user/register/url";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("profile", {openid: openid}).returns(url);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toProfile;
                        controller(openid, reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(url);
                    });

                    it('重定向到首页', function () {
                        var url = "user/home";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("home").returns(url);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toHome;
                        controller(reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(url);
                    });
                });

                describe('用户登录', function () {
                    var code, openid, accesstoken, refresh_token, lord;

                    beforeEach(function () {
                        reqStub.session = {};
                        code = '12345678';
                        openid = 'ahbsdbjvhqervhr3';
                        accesstoken = 'eurf3urf3urfr3r';
                        refresh_token = 'abdfdgdhdhdhdhdh';
                        lord = {name: "foo"};
                    });

                    it('请求未包含查询参数code，客户端403错', function () {
                        controller = require('../server/wechat/manjusri').login;
                        controller(reqStub, resStub);
                        expect(statusSpy).calledWith(403).calledOnce;
                    });

                    it('获得当前用户的OpenId失败', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], null, err);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};
                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(400, null, err);
                            });
                    });

                    it('当前用户为一个新用户， 如果系统在试图获取用户信息时失败， 则系统报500错', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], null, err);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('当前用户为一个新用户， 如果添加新用户时失败， 则系统报500错', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var userInfoFromWeixin = {
                            nickname: "nickname",
                            openid: "openid",
                            headimgurl: "headimgurl",
                            city: "city",
                            province: "province",
                            sex: "1",
                            subscribe_time: "subscribetime"
                        }
                        var userInfo = {
                            name: userInfoFromWeixin.nickname,
                            openid: userInfoFromWeixin.openid,
                            img: userInfoFromWeixin.headimgurl,
                            city: userInfoFromWeixin.city,
                            province: userInfoFromWeixin.province,
                            sex: userInfoFromWeixin.sex,
                            subscribe: userInfoFromWeixin.subscribe_time
                        }

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], [userInfoFromWeixin]);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        var registerUserStub = createPromiseStub([userInfo], null, err);
                        stubs['../modules/users'].registerUser = registerUserStub;

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('当前用户为一个新用户时，以新用户的身份登录，并重定向到用户注册页面', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var userInfoFromWeixin = {
                            nickname: "nickname",
                            openid: "openid",
                            headimgurl: "headimgurl",
                            city: "city",
                            province: "province",
                            sex: "1",
                            subscribe_time: "subscribetime"
                        }
                        var userInfo = {
                            name: userInfoFromWeixin.nickname,
                            openid: userInfoFromWeixin.openid,
                            img: userInfoFromWeixin.headimgurl,
                            city: userInfoFromWeixin.city,
                            province: userInfoFromWeixin.province,
                            sex: userInfoFromWeixin.sex,
                            subscribe: userInfoFromWeixin.subscribe_time
                        }

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], [userInfoFromWeixin]);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        var user = {name: "foo"}
                        var registerUserStub = createPromiseStub([userInfo], [user]);
                        stubs['../modules/users'].registerUser = registerUserStub;

                        var redirectToProfileSpy = sinon.spy();
                        stubs['./redirects'] = {toProfile: redirectToProfileSpy};

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectToProfileSpy).calledOnce.calledWith(openid, reqStub, resStub);
                            });
                    });

                    it('当前用户已存在，登录成功，如果session中有重定向url，则按此重定向', function () {
                        var redirectToUrl = "foo/url";
                        reqStub.query.code = code;
                        reqStub.session.redirectToUrl = redirectToUrl;

                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var user = {name: "foo"};
                        var findUserStub = createPromiseStub([openid], [user]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var redirectSpy = sinon.spy();
                        resStub.redirect = redirectSpy;
                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectSpy).calledOnce.calledWith(redirectToUrl);
                            });
                    });

                    it('当前用户已存在，登录成功，如果session中无重定向url，则重定向至首页', function () {
                        reqStub.query.code = code;

                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var user = {name: "foo"};
                        var findUserStub = createPromiseStub([openid], [user]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var redirectToHomeSpy = sinon.spy();
                        stubs['./redirects'] = {toHome: redirectToHomeSpy};

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectToHomeSpy).calledOnce.calledWith(reqStub, resStub);
                            });
                    });
                });

                describe('处理各个页面', function () {
                    var linkages, selfLink;
                    var menuLinks, getMenuLinksStub, shareLogo, getShareLogoImageStub, wrapUrlWithSitHostStub;
                    var shareConfig, generateShareConfigStub;

                    beforeEach(function () {
                        linkages = sinon.stub();
                        selfLink = '/self/link';

                        menuLinks = {home: "foo", jiansi: "fee"}
                        getMenuLinksStub = sinon.stub();
                        getMenuLinksStub.returns(menuLinks);

                        shareLogo = '/share/logo/image';
                        getShareLogoImageStub = sinon.stub();
                        getShareLogoImageStub.returns(shareLogo);

                        wrapUrlWithSitHostStub = sinon.stub();
                        shareConfig = {config: 'foo'};
                        stubs['../weixin'] = {
                            weixinConfig: {
                                getShareLogoImage: getShareLogoImageStub,
                                wrapUrlWithSitHost: wrapUrlWithSitHostStub,
                            },
                            weixinService: {
                                generateShareConfig: generateShareConfigStub,
                            }
                        };

                        stubs["../rests"] = {
                            getLink: linkages,
                            getMainMenuLinkages: getMenuLinksStub,
                        };
                    });

                    describe('显示首页', function () {
                        beforeEach(function () {
                        });

                        it('正确显示', function () {
                            var dailyVirtueLink = "/dailyVirtueLink";
                            var suixiLink = "/suixiLink";
                            var prayLink = "/prayLink";
                            var homeLink = "/homeLink";
                            //var linkages = sinon.stub();
                            linkages.withArgs("dailyVirtue").returns(dailyVirtueLink);
                            linkages.withArgs("suixi").returns(suixiLink);
                            linkages.withArgs("pray").returns(prayLink);
                            linkages.withArgs("home").returns(homeLink);

                            stubs["../rests"] = {
                                getLink: linkages,
                                getMainMenuLinkages: getMenuLinksStub,
                            };

                            var url = '/home';
                            reqStub.url = url;
                            var currentShareUrl = '/current/share/url';
                            wrapUrlWithSitHostStub.withArgs(url).returns(currentShareUrl);


                            var sharelink = '/share/link';
                            wrapUrlWithSitHostStub.withArgs(homeLink).returns(sharelink);

                            generateShareConfigStub = createPromiseStub([currentShareUrl], [shareConfig]);
                            stubs['../weixin'].weixinService.generateShareConfig = generateShareConfigStub;

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).home;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    expect(resRenderSpy).calledWith('manjusri/index',
                                        {
                                            share: {
                                                title: '静音寺.文殊禅林', // 分享标题
                                                desc: '传承正法，培养僧才，实修实证，弘扬人间佛教，共建人间净土！', // 分享描述
                                                link: sharelink,  // 分享链接
                                                imgUrl: shareLogo, // 分享图标
                                            },
                                            linkages: {
                                                dailyVirtue: dailyVirtueLink,
                                                suixi: suixiLink,
                                                pray: prayLink
                                            },
                                            shareConfig: shareConfig,
                                            menu: menuLinks
                                        });
                                });
                        });
                    });

                    describe('日行一善', function () {
                        var virtuesList, virtueListStub;

                        beforeEach(function () {
                            virtuesList = {foo: "data"};
                        });

                        it('查询最近N笔日行一善失败', function () {
                            virtueListStub = createPromiseStub(["daily", 30], null, err);
                            stubs['../modules/virtues'] = {lastVirtuesAndTotalCount: virtueListStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).dailyVirtue;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('正确显示', function () {
                            var url = '/daily';
                            reqStub.url = url;
                            var currentShareUrl = '/current/share/url';
                            wrapUrlWithSitHostStub.withArgs(url).returns(currentShareUrl);

                            generateShareConfigStub = createPromiseStub([currentShareUrl], [shareConfig]);
                            stubs['../weixin'].weixinService.generateShareConfig = generateShareConfigStub;

                            var dailyLink = '/daily/link';
                            linkages.withArgs('dailyVirtue').returns(dailyLink);

                            virtueListStub = createPromiseStub(["daily", 30], [virtuesList]);
                            stubs['../modules/virtues'] = {lastVirtuesAndTotalCount: virtueListStub};



                            controller = proxyquire('../server/wechat/manjusriPages', stubs).dailyVirtue;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    virtuesList.share = {
                                        title: '日行一善', // 分享标题
                                        desc: '捐助五台山静音寺建设，圆满福慧资粮！', // 分享描述
                                        link: dailyLink,  // 分享链接
                                        imgUrl: shareLogo, // 分享图标
                                    };
                                    virtuesList.menu = menuLinks;
                                    virtuesList.shareConfig = shareConfig;
                                    expect(resRenderSpy).calledWith('manjusri/dailyVirtue', virtuesList);
                                });
                        });
                    });

                    describe('随喜', function () {
                        var virtuesList, virtueListStub;
                        beforeEach(function () {
                            virtuesList = {foo: "data"};
                        });

                        it('查询最近N笔随喜失败', function () {
                            virtueListStub = createPromiseStub(["suixi", 30], null, err);
                            stubs['../modules/virtues'] = {lastVirtuesAndTotalCount: virtueListStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).suixi;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('正确显示', function () {
                            var url = '/suixi';
                            reqStub.url = url;
                            var currentShareUrl = '/current/share/url';
                            wrapUrlWithSitHostStub.withArgs(url).returns(currentShareUrl);

                            generateShareConfigStub = createPromiseStub([currentShareUrl], [shareConfig]);
                            stubs['../weixin'].weixinService.generateShareConfig = generateShareConfigStub;

                            var suixiLink = '/suixi/link';
                            linkages.withArgs('suixi').returns(suixiLink);

                            virtueListStub = createPromiseStub(["suixi", 30], [virtuesList]);
                            stubs['../modules/virtues'] = {lastVirtuesAndTotalCount: virtueListStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).suixi;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    virtuesList.share = {
                                        title: '随喜五台山静音寺建设', // 分享标题
                                        desc: '五台山静音寺文殊禅林是以培养僧才为核心，弘扬人间佛教的道场！', // 分享描述
                                        link: suixiLink,  // 分享链接
                                        imgUrl: shareLogo, // 分享图标
                                    };
                                    virtuesList.menu = menuLinks;
                                    virtuesList.shareConfig = shareConfig;
                                    expect(resRenderSpy).calledWith('manjusri/suixi', virtuesList);
                                });
                        });
                    });

                    describe('建寺', function () {
                        var findPartsStub, parts;

                        beforeEach(function () {
                            parts = [
                                {
                                    _id: "foo",
                                    field: "v"
                                },
                                {
                                    _id: "fee",
                                    field: "v"
                                },
                            ];
                        });

                        it('查询正在募捐的法物失败', function () {
                            findPartsStub = createPromiseStub([], null, err);
                            stubs['../modules/parts'] = {listPartsOnSale: findPartsStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).jiansi;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('正确显示', function () {
                            var dailyVirtueLink = "/dailyVirtueLink";
                            var suixiLink = "/suixiLink";
                            var transfooLink = "/trans/foo";
                            var transfeeLink = "/trans/fee";
                            var linkages = sinon.stub();
                            linkages.withArgs("dailyVirtue").returns(dailyVirtueLink);
                            linkages.withArgs("suixi").returns(suixiLink);
                            linkages.withArgs("trans", {partId: "foo"}).returns(transfooLink);
                            linkages.withArgs("trans", {partId: "fee"}).returns(transfeeLink);
                            stubs["../rests"] = {
                                getLink: linkages,
                                getMainMenuLinkages: getMenuLinksStub,
                            };

                            findPartsStub = createPromiseStub([], [parts]);
                            stubs['../modules/parts'] = {listPartsOnSale: findPartsStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).jiansi;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    expect(resRenderSpy).calledWith('manjusri/jiansi', {
                                        daily: dailyVirtueLink,
                                        suixi: suixiLink,
                                        menu: menuLinks,
                                        parts: [
                                            {
                                                url: transfooLink,
                                                field: "v"
                                            },
                                            {
                                                url: transfeeLink,
                                                field: "v"
                                            },
                                        ]
                                    });
                                });
                        });
                    });

                    describe('祈福', function () {
                        var openid, lordid, lord, praysData;
                        var getUserByOpenIdStub, countTimesOfPraysStub;

                        beforeEach(function () {
                            openid = "openid";
                            lordid = "lordid";
                            lord = {
                                _id: lordid,
                            };
                            praysData = {
                                me: 12,
                                total: {
                                    NOP: 2,
                                    times: 20
                                }
                            };

                            reqStub.session = {
                                user: {openid: openid},
                            };
                        });

                        it('用户未登录', function () {
                            delete reqStub.session;
                            controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                            controller(reqStub, resStub)
                            checkResponseStatusCodeAndMessage(400);
                        });

                        it('获取用户失败', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], null, err);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('当前用户不存在', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [null]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    var errmsg = "the user with openid[" + openid + "] not exists!!!";
                                    checkResponseStatusCodeAndMessage(400, errmsg);
                                });
                        });

                        it('统计人次失败', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            countTimesOfPraysStub = createPromiseStub([lordid], null, err);
                            stubs['../modules/prays'] = {countTimesOfPrays: countTimesOfPraysStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    var errmsg = "the user with openid[" + openid + "] not exists!!!";
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('正确显示', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            countTimesOfPraysStub = createPromiseStub([lordid], [praysData]);
                            stubs['../modules/prays'] = {countTimesOfPrays: countTimesOfPraysStub};

                            var lordPraysLink = "/lord/prays";
                            var prayLink = "/pray";
                            var linkages = sinon.stub();
                            linkages.withArgs("lordPrays", {id: lordid}).returns(lordPraysLink);
                            linkages.withArgs("pray").returns(prayLink);

                            var mainmenulinks = {foo: "foo", fee: "fee"}
                            var getMainMenuLinksStub = sinon.stub();
                            getMainMenuLinksStub.returns(mainmenulinks);

                            stubs["../rests"] = {
                                getMainMenuLinkages: getMainMenuLinksStub,
                                getLink: linkages
                            };

                            var shareUrl = '/www/shareurl';
                            var wrapUrlWithSitHostStub = sinon.stub();
                            wrapUrlWithSitHostStub.withArgs(prayLink).returns(shareUrl);

                            var shareImg = '/share/image/logo';
                            var getShareLogoImageStub = sinon.stub();
                            getShareLogoImageStub.returns(shareImg);

                            var shareConfig = {shareConfig: "config"};
                            reqStub.url = prayLink;
                            var generateShareConfigStub = createPromiseStub([shareUrl], [shareConfig]);

                            stubs['../weixin'] = {
                                weixinConfig: {
                                    wrapUrlWithSitHost: wrapUrlWithSitHostStub,
                                    getShareLogoImage: getShareLogoImageStub
                                },
                                weixinService: {
                                    generateShareConfig: generateShareConfigStub
                                }
                            };

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    viewdata = {
                                        share: {
                                            title: '填写祈福卡', // 分享标题
                                            desc: '向五台山文殊菩萨许个愿！', // 分享描述
                                            link: shareUrl,  // 分享链接
                                            imgUrl: shareImg, // 分享图标
                                        },
                                        shareConfig: shareConfig,
                                        data: praysData,
                                        self: prayLink,
                                        links: {addPray: lordPraysLink},
                                        menu: mainmenulinks
                                    };
                                    expect(resRenderSpy).calledOnce.calledWith('manjusri/pray', viewdata);
                                });
                        });
                    });

                    describe('功课', function () {
                        var openid, lordid, lord, lessonsList;
                        var lessonid1, lessonid2;
                        var getUserByOpenIdStub;

                        beforeEach(function () {
                            openid = "openid";
                            lordid = "lordid";
                            lord = {
                                _id: lordid,
                            };

                            lessonid1 = 'aaaaaaaaa';
                            lessonid2 = 'bbbbbbbb';
                            lessonsList = [
                                {
                                    lesson: {_id: lessonid1},
                                    foo: 'foo'
                                },
                                {
                                    lesson: {_id: lessonid2},
                                    foo: 'fee'
                                }
                            ];
                            reqStub.session = {
                                user: {openid: openid},
                            };
                        });

                        /*it('用户未登录', function () {
                         delete reqStub.session;
                         controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                         controller(reqStub, resStub)
                         checkResponseStatusCodeAndMessage(400);
                         });*/

                        /*it('获取用户失败', function () {
                         getUserByOpenIdStub = createPromiseStub([openid], null, err);
                         stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                         controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                         return controller(reqStub, resStub)
                         .then(function () {
                         checkResponseStatusCodeAndMessage(500, null, err);
                         });
                         });*/

                        /*it('当前用户不存在', function () {
                         getUserByOpenIdStub = createPromiseStub([openid], [null]);
                         stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                         controller = proxyquire('../server/wechat/manjusriPages', stubs).pray;
                         return controller(reqStub, resStub)
                         .then(function () {
                         var errmsg = "the user with openid[" + openid + "] not exists!!!";
                         checkResponseStatusCodeAndMessage(400, errmsg);
                         });
                         });*/

                        it('获取功课列表失败', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            listLessonsStub = createPromiseStub(null, null, err);
                            stubs['../modules/lessons'] = {listLessons: listLessonsStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lesson;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        //TODO:将分享链接的相关过程整合为一个函数
                        it('正确显示', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            listLessonsStub = createPromiseStub([lordid], [lessonsList]);
                            stubs['../modules/lessons'] = {listLessons: listLessonsStub};

                            linkages.withArgs("lesson").returns(selfLink);
                            var announceLink1 = "/announce/link/1";
                            var announceLink2 = "/announce/link/2";
                            linkages.withArgs("lessonPractices", {
                                lordid: lordid,
                                lessonid: lessonid1
                            }).returns(announceLink1);
                            linkages.withArgs("lessonPractices", {
                                lordid: lordid,
                                lessonid: lessonid2
                            }).returns(announceLink2);

                            var url = '/lesson';
                            reqStub.url = url;
                            var currentShareUrl = '/current/share/url';
                            wrapUrlWithSitHostStub.withArgs(url).returns(currentShareUrl);

                            var shareUrl = '/www/shareurl';
                            wrapUrlWithSitHostStub.withArgs(selfLink).returns(shareUrl);

                            generateShareConfigStub = createPromiseStub([currentShareUrl], [shareConfig]);
                            stubs['../weixin'].weixinService.generateShareConfig = generateShareConfigStub;

                            var expectedLessonsList = [
                                {
                                    lesson: {_id: lessonid1},
                                    links: {self: announceLink1},
                                    foo: 'foo'
                                },
                                {
                                    lesson: {_id: lessonid2},
                                    links: {self: announceLink2},
                                    foo: 'fee'
                                }
                            ];
                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lesson;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    viewdata = {
                                        share: {
                                            title: '共修', // 分享标题
                                            desc: '众人共修之功德是各人所修功德的总和！', // 分享描述
                                            link: shareUrl,  // 分享链接
                                            imgUrl: shareLogo, // 分享图标
                                        },
                                        shareConfig: shareConfig,
                                        data: expectedLessonsList,
                                        menu: menuLinks
                                    };
                                    expect(resRenderSpy).calledOnce.calledWith('manjusri/lesson', viewdata);
                                });
                        });
                    });

                    describe('功德主', function () {
                        var token, openid, lord, virtues, viewdata;
                        var getUserByOpenIdStub, listLordVirtuesStub, listMyLessonsStub;

                        beforeEach(function () {
                            token = 'ddfffffdffffffffff';
                            openid = 'gfghhfhjfjkfkfkf';
                            lord = {
                                _id: '587240dea0191d6754dcc0ba',
                                name: 'foo'
                            }
                            virtues = [{foo: "foo"}, {fee: "fee"}];

                            reqStub.session = {
                                user: {access_token: token, openid: openid},
                            };
                        });

                        it('当前用户未登录', function () {
                            delete reqStub.session;

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lordVirtues;
                            controller(reqStub, resStub)
                            checkResponseStatusCodeAndMessage(400);
                        });

                        it('未能成功获得当前用户', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], null, err);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lordVirtues;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('没有找到当前用户', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [null]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lordVirtues;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    var errmsg = "The User with openid(" + openid + ") not exists?";
                                    checkResponseStatusCodeAndMessage(500, errmsg);
                                });
                        });

                        it('未能成功获得当前用户的所有捐助', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            listLordVirtuesStub = createPromiseStub([lord._id], null, err);
                            stubs['../modules/virtues'] = {listLordVirtues: listLordVirtuesStub};

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lordVirtues;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    checkResponseStatusCodeAndMessage(500, null, err);
                                });
                        });

                        it('成功显示功德主页面', function () {
                            getUserByOpenIdStub = createPromiseStub([openid], [lord]);
                            stubs['../modules/users'] = {findByOpenid: getUserByOpenIdStub};

                            listLordVirtuesStub = createPromiseStub([lord._id], [virtues]);
                            stubs['../modules/virtues'] = {listLordVirtues: listLordVirtuesStub};

                            var lessons = [{lesson: {_id: "foo"}}, {lesson: {_id: "fee"}}];
                            listMyLessonsStub = createPromiseStub([lord._id], [lessons]);
                            stubs['../modules/lessons'] = {listMyLessons: listMyLessonsStub}

                            var mainmenulinks = {foo: "foo", fee: "fee"}
                            var getMainMenuLinksStub = sinon.stub();
                            getMainMenuLinksStub.returns(mainmenulinks);

                            var profilelink = "profile link";
                            var dailylink = "daily link";
                            var suixilink = "suixi link";
                            var getLinkStub = sinon.stub();
                            getLinkStub.withArgs('profile', {openid: openid}).returns(profilelink);
                            getLinkStub.withArgs('dailyVirtue').returns(dailylink);
                            getLinkStub.withArgs('suixi').returns(suixilink);
                            var lesslink1 = "less link1";
                            var lesslink2 = "less link2";
                            getLinkStub.withArgs('lessonPractices', {
                                lordid: lord._id,
                                lessonid: 'foo'
                            }).returns(lesslink1);
                            getLinkStub.withArgs('lessonPractices', {
                                lordid: lord._id,
                                lessonid: 'fee'
                            }).returns(lesslink2);
                            var expectedLessons = [
                                {
                                    lesson: {_id: "foo"},
                                    links: {self: lesslink1}
                                },
                                {
                                    lesson: {_id: "fee"},
                                    links: {self: lesslink2}
                                }
                            ]

                            stubs["../rests"] = {
                                getMainMenuLinkages: getMainMenuLinksStub,
                                getLink: getLinkStub
                            }

                            controller = proxyquire('../server/wechat/manjusriPages', stubs).lordVirtues;
                            return controller(reqStub, resStub)
                                .then(function () {
                                    viewdata = {
                                        lord: lord,
                                        virtues: virtues,
                                        lessons: expectedLessons,
                                        links: {
                                            profile: profilelink,
                                            daily: dailylink,
                                            suixi: suixilink
                                        },
                                        menu: mainmenulinks
                                    };
                                    expect(resRenderSpy).calledOnce.calledWith('manjusri/me', viewdata);
                                });
                        });
                    });
                });

                describe('认捐法物', function () {
                    var partId, part, partFindByIdStub;

                    beforeEach(function () {
                        partId = 12345;
                        part = {name: 'foo'}

                        reqStub.params.partId = partId;
                        partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['./models/part'] = {findById: partFindByIdStub};
                    });

                    it('访问法物的相关信息失败', function () {
                        var partId = 12345;
                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], null, err);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('指定法物不存在', function () {
                        var partId = 12345;
                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], [null]);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(404, 'part ' + partId.toString() + ' is not found');
                            });
                    });

                    it('正确显示', function () {
                        var partId = 12345;
                        var part = {name: 'foo'}

                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/trans', {
                                    title: '建寺-' + part.name,
                                    part: part
                                });
                            });
                    });
                });

                describe('微信支付', function () {
                    var virtueId, openId, virtue, payData;
                    var getOpenIdStub, findNewVirtueByIdStub, prepayStub;

                    beforeEach(function () {
                        virtueId = 'bbsd3fg12334555';
                        virtue = {
                            subject: {name: 'foo'},
                            amount: 300
                        };
                        openId = 'gfghhfhjfjkfkfkf';
                        payData = {foo: 'foo', fee: 'fee'};

                        reqStub.session = {user: {openid: openId}};
                        reqStub.query.virtue = virtueId;
                    });

                    it('请求中未包含virtue的查询变量', function () {
                        delete reqStub.query.virtue;
                        controller = proxyquire('../server/wechat/payment', stubs).pay;
                        controller(reqStub, resStub);
                        return checkResponseStatusCodeAndMessage(400, null, new Error('virtue is not found in query'));
                    });

                    it('查找捐助交易操作失败', function () {
                        findNewVirtueByIdStub = createPromiseStub([virtueId], null, err);
                        stubs['../modules/virtues'] = {findNewVirtueById: findNewVirtueByIdStub};

                        controller = proxyquire('../server/wechat/payment', stubs).pay;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(400, null, err);
                            });
                    });

                    it('未查找到指定的捐助交易', function () {
                        findNewVirtueByIdStub = createPromiseStub([virtueId], [null]);
                        stubs['../modules/virtues'] = {findNewVirtueById: findNewVirtueByIdStub};

                        controller = proxyquire('../server/wechat/payment', stubs).pay;
                        return controller(reqStub, resStub)
                            .then(function () {
                                var error = new Error('The virtue[id=' + virtueId + '] is not found');
                                checkResponseStatusCodeAndMessage(400, null, error);
                            });
                    });

                    it('预置微信支付操作失败', function () {
                        findNewVirtueByIdStub = createPromiseStub([virtueId], [virtue]);
                        stubs['../modules/virtues'] = {findNewVirtueById: findNewVirtueByIdStub};
                        prepayStub = createPromiseStub([openId, virtueId, 'foo', 300], null, err);
                        stubs['../weixin'] = {weixinService: {prepay: prepayStub}};

                        controller = proxyquire('../server/wechat/payment', stubs).pay;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(400, null, err);
                            });
                    });

                    it('渲染前端进行微信支付', function () {
                        var homeLink = "/homeLink";
                        var notifyLink = "/notifyLink";
                        var linkages = sinon.stub();
                        linkages.withArgs("home").returns(homeLink);
                        linkages.withArgs("weixinPaymentNotify").returns(notifyLink);
                        stubs["../rests"] = {getLink: linkages};

                        findNewVirtueByIdStub = createPromiseStub([virtueId], [virtue]);
                        stubs['../modules/virtues'] = {findNewVirtueById: findNewVirtueByIdStub};
                        prepayStub = createPromiseStub([openId, virtueId, 'foo', 300], [payData]);
                        stubs['../weixin'] = {weixinService: {prepay: prepayStub}};

                        controller = proxyquire('../server/wechat/payment', stubs).pay;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/payment', {
                                    links: {home: homeLink, notify: notifyLink},
                                    openId: openId,
                                    virtue: virtueId,
                                    payData: payData
                                });
                            });
                    });
                });

                describe('响应微信支付结果', function () {
                    //TODO: 编写响应微信支付结果的测试用例
                });
            });

            describe('处理请求', function () {
                var reqStub, resStub;
                var statusSpy, resEndSpy, resSendSyp, resRenderSpy;
                var controller;

                function checkResponseStatusCodeAndMessage(code, message, err) {
                    expect(statusSpy).calledWith(code).calledOnce;
                    if (message)
                        expect(resStub.statusMessage).eql(message);
                    if (err) {
                        var actual = resSendSyp.getCall(0).args[0];
                        expect(actual instanceof Error).true;
                        expect(actual.message).eql(err.message);
                    }
                }

                beforeEach(function () {
                    statusSpy = sinon.spy();
                    resSendSyp = sinon.spy();
                    resEndSpy = sinon.spy();
                    resRenderSpy = sinon.spy();

                    reqStub = {
                        query: {},
                        params: {}
                    };
                    resStub = {
                        status: statusSpy,
                        render: resRenderSpy,
                        send: resSendSyp,
                        end: resEndSpy
                    }
                });

                describe('响应微信消息', function () {
                    var openid, msg, msgReplySpy;

                    beforeEach(function () {
                        controller = require('../server/wechat/wechat');
                        openid = '1234567890';
                        msg = {
                            FromUserName: openid,
                            MsgType: 'event',
                            Event: 'subscribe'
                        };
                        reqStub.weixin = msg;

                        msgReplySpy = sinon.spy();
                        resStub.reply = msgReplySpy;
                    });

                    it('对于无需处理的消息，直接应答空串', function () {
                        msg.Event = 'foo';
                        controller(reqStub, resStub);
                        expect(msgReplySpy).calledWith('');
                    });

                    describe('响应关注消息', function () {
                        it('应答欢迎信息', function () {
                            var user = {name: 'foo'};
                            var registerUserStub = createPromiseStub([null, openid], [user]);
                            stubs['../modules/users'] = {
                                register: registerUserStub
                            };

                            var answer = {foo: 'foo'};
                            var welcomeStub = createPromiseStub([user], [answer]);
                            stubs['../modules/welcome'] = welcomeStub;

                            controller = proxyquire('../server/wechat/wechat', stubs);
                            controller(reqStub, resStub);
                            expect(msgReplySpy).calledWith(answer);
                        });
                    });
                });

                describe('重定向', function () {
                    beforeEach(function () {
                    });

                    it('重定向到经微信认证的登录', function () {
                        reqStub.session = {};

                        var loginUrl = "redirects page url";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("login").returns(loginUrl);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var auth2WrapedUrl = 'url/to/auth2WrapedUrl';
                        var urlWrapStub = sinon.stub();
                        urlWrapStub.withArgs(loginUrl).returns(auth2WrapedUrl);
                        stubs['../weixin'] = {weixinConfig: {wrapRedirectURLByOath2Way: urlWrapStub}};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toLogin;
                        controller(reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(auth2WrapedUrl);
                    });

                    it('重定向到用户注册页面', function () {
                        var openid = "12324556";
                        var url = "user/register/url";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("profile", {openid: openid}).returns(url);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toProfile;
                        controller(openid, reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(url);
                    });

                    it('重定向到首页', function () {
                        var url = "user/home";
                        restUrlMapStub = sinon.stub();
                        restUrlMapStub.withArgs("home").returns(url);
                        stubs['../rests'] = {getLink: restUrlMapStub};

                        var redirctSpy = sinon.spy();
                        resStub.redirect = redirctSpy;

                        controller = proxyquire('../server/wechat/redirects', stubs).toHome;
                        controller(reqStub, resStub);

                        expect(redirctSpy).calledOnce.calledWith(url);
                    });
                });

                describe('用户登录', function () {
                    var code, openid, accesstoken, refresh_token, lord;

                    beforeEach(function () {
                        reqStub.session = {};
                        code = '12345678';
                        openid = 'ahbsdbjvhqervhr3';
                        accesstoken = 'eurf3urf3urfr3r';
                        refresh_token = 'abdfdgdhdhdhdhdh';
                        lord = {name: "foo"};
                    });

                    it('请求未包含查询参数code，客户端403错', function () {
                        controller = require('../server/wechat/manjusri').login;
                        controller(reqStub, resStub);
                        expect(statusSpy).calledWith(403).calledOnce;
                    });

                    it('获得当前用户的OpenId失败', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], null, err);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};
                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(400, null, err);
                            });
                    });

                    it('当前用户为一个新用户， 如果系统在试图获取用户信息时失败， 则系统报500错', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], null, err);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('当前用户为一个新用户， 如果添加新用户时失败， 则系统报500错', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var userInfoFromWeixin = {
                            nickname: "nickname",
                            openid: "openid",
                            headimgurl: "headimgurl",
                            city: "city",
                            province: "province",
                            sex: "1",
                            subscribe_time: "subscribetime"
                        }
                        var userInfo = {
                            name: userInfoFromWeixin.nickname,
                            openid: userInfoFromWeixin.openid,
                            img: userInfoFromWeixin.headimgurl,
                            city: userInfoFromWeixin.city,
                            province: userInfoFromWeixin.province,
                            sex: userInfoFromWeixin.sex,
                            subscribe: userInfoFromWeixin.subscribe_time
                        }

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], [userInfoFromWeixin]);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        var registerUserStub = createPromiseStub([userInfo], null, err);
                        stubs['../modules/users'].registerUser = registerUserStub;

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('当前用户为一个新用户时，以新用户的身份登录，并重定向到用户注册页面', function () {
                        reqStub.query.code = code;
                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var findUserStub = createPromiseStub([openid], [null]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var userInfoFromWeixin = {
                            nickname: "nickname",
                            openid: "openid",
                            headimgurl: "headimgurl",
                            city: "city",
                            province: "province",
                            sex: "1",
                            subscribe_time: "subscribetime"
                        }
                        var userInfo = {
                            name: userInfoFromWeixin.nickname,
                            openid: userInfoFromWeixin.openid,
                            img: userInfoFromWeixin.headimgurl,
                            city: userInfoFromWeixin.city,
                            province: userInfoFromWeixin.province,
                            sex: userInfoFromWeixin.sex,
                            subscribe: userInfoFromWeixin.subscribe_time
                        }

                        var getUserInfoByOpenIdAndTokenStub = createPromiseStub([accesstoken, openid], [userInfoFromWeixin]);
                        stubs['../weixin'] = {
                            weixinService: {
                                getOpenId: getOpenIdStub,
                                getUserInfoByOpenIdAndToken: getUserInfoByOpenIdAndTokenStub
                            }
                        };

                        var user = {name: "foo"}
                        var registerUserStub = createPromiseStub([userInfo], [user]);
                        stubs['../modules/users'].registerUser = registerUserStub;

                        var redirectToProfileSpy = sinon.spy();
                        stubs['./redirects'] = {toProfile: redirectToProfileSpy};

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectToProfileSpy).calledOnce.calledWith(openid, reqStub, resStub);
                            });
                    });

                    it('当前用户已存在，登录成功，如果session中有重定向url，则按此重定向', function () {
                        var redirectToUrl = "foo/url";
                        reqStub.query.code = code;
                        reqStub.session.redirectToUrl = redirectToUrl;

                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var user = {name: "foo"};
                        var findUserStub = createPromiseStub([openid], [user]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var redirectSpy = sinon.spy();
                        resStub.redirect = redirectSpy;
                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectSpy).calledOnce.calledWith(redirectToUrl);
                            });
                    });

                    it('当前用户已存在，登录成功，如果session中无重定向url，则重定向至首页', function () {
                        reqStub.query.code = code;

                        var getOpenIdStub = createPromiseStub([code], [{
                            "access_token": accesstoken,
                            "refresh_token": refresh_token,
                            "openid": openid
                        }]);
                        stubs['../weixin'] = {weixinService: {getOpenId: getOpenIdStub}};

                        var user = {name: "foo"};
                        var findUserStub = createPromiseStub([openid], [user]);
                        stubs['../modules/users'] = {findByOpenid: findUserStub};

                        var redirectToHomeSpy = sinon.spy();
                        stubs['./redirects'] = {toHome: redirectToHomeSpy};

                        controller = proxyquire('../server/wechat/manjusri', stubs).login;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(reqStub.session.user).eql({access_token: accesstoken, openid: openid});
                                //expect(reqStub.session.refresh_token).eql(refresh_token);
                                expect(redirectToHomeSpy).calledOnce.calledWith(reqStub, resStub);
                            });
                    });
                });

                describe('显示首页', function () {
                    var virtuesList, virtueListStub;
                    var times, countStub;

                    beforeEach(function () {
                        virtuesList = [{}, {}];
                        virtueListStub = createPromiseStub([30], [virtuesList]);
                        stubs['../modules/virtues'] = {listLastVirtues: virtueListStub};

                        times = 10;
                        countStub = createPromiseStub([{state: 'payed'}], [times]);
                        stubs['./models/virtue'] = {count: countStub};
                    });

                    it('未能列出最近的捐助交易', function () {
                        virtueListStub = createPromiseStub([30], null, err);
                        stubs['../modules/virtues'] = {listLastVirtues: virtueListStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).home;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('未能列出捐助交易总数', function () {
                        countStub = createPromiseStub([{state: 'payed'}], null, err);
                        stubs['./models/virtue'] = {count: countStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).home;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('正确显示', function () {
                        controller = proxyquire('../server/wechat/manjusri', stubs).home;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/index', {
                                    virtues: virtuesList,
                                    times: 10,
                                    title: '首页'
                                });
                            });
                    });
                });

                describe('显示建寺', function () {
                    var partFindStub, partslist;

                    beforeEach(function () {
                        partslist = [{foo: 'fffff'}, {}];
                        partFindStub = createPromiseStub([{type: 'part', onSale: true}], [partslist]);
                        stubs['./models/part'] = {find: partFindStub};
                    });

                    it('未能列出当前上架的法物', function () {
                        partFindStub = createPromiseStub([{type: 'part', onSale: true}], null, err);
                        stubs['./models/part'] = {find: partFindStub};
                        controller = proxyquire('../server/wechat/manjusri', stubs).jiansi;

                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('正确显示', function () {
                        controller = proxyquire('../server/wechat/manjusri', stubs).jiansi;

                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/jiansi', {
                                    title: '建寺',
                                    parts: partslist
                                });
                            });
                    });
                });

                describe('日行一善', function () {
                    var virtuesList, virtueListStub;
                    var times, countStub;
                    var part, findOneStub;

                    beforeEach(function () {
                        virtuesList = [{}, {}];
                        virtueListStub = createPromiseStub([30], [virtuesList]);
                        stubs['../modules/virtues'] = {listLastVirtues: virtueListStub};

                        times = 10;
                        countStub = createPromiseStub([{state: 'payed'}], [times]);
                        stubs['./models/virtue'] = {count: countStub};

                        part = new Object();
                        findOneStub = createPromiseStub([{type: 'daily', onSale: true}], [part]);
                        stubs['./models/part'] = {findOne: findOneStub};
                    });

                    it('未能列出最近的捐助交易', function () {
                        virtueListStub = createPromiseStub([30], null, err);
                        stubs['../modules/virtues'] = {listLastVirtues: virtueListStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).dailyVirtue;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('未能列出捐助交易总数', function () {
                        countStub = createPromiseStub([{state: 'payed'}], null, err);
                        stubs['./models/virtue'] = {count: countStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).dailyVirtue;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('访问日行一善的相关信息失败', function () {
                        findOneStub = createPromiseStub([{type: 'daily', onSale: true}], null, err);
                        stubs['./models/part'] = {findOne: findOneStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).dailyVirtue;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('未能获得日行一善的相关信息', function () {
                        findOneStub = createPromiseStub([{type: 'daily', onSale: true}], [null]);
                        stubs['./models/part'] = {findOne: findOneStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).dailyVirtue;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, '日行一善相关信息未建立');
                            });
                    });

                    it('正确显示', function () {
                        controller = proxyquire('../server/wechat/manjusri', stubs).dailyVirtue;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/dailyVirtue', {
                                    virtues: virtuesList,
                                    times: 10,
                                    part: part,
                                    title: '建寺-日行一善'
                                });
                            });
                    });
                });

                describe('随喜', function () {
                    var part, findOneStub;

                    beforeEach(function () {
                        part = new Object();
                        findOneStub = createPromiseStub([{type: 'suixi', onSale: true}], [part]);
                        stubs['./models/part'] = {findOne: findOneStub};
                    });

                    it('访问随喜的相关信息失败', function () {
                        findOneStub = createPromiseStub([{type: 'suixi', onSale: true}], null, err);
                        stubs['./models/part'] = {findOne: findOneStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).suixi;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('未能获得随喜的相关信息', function () {
                        findOneStub = createPromiseStub([{type: 'suixi', onSale: true}], [null]);
                        stubs['./models/part'] = {findOne: findOneStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).suixi;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, '随喜相关信息未建立');
                            });
                    });

                    it('正确显示', function () {
                        controller = proxyquire('../server/wechat/manjusri', stubs).suixi;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/suixi', {
                                    part: part,
                                    title: '建寺-随喜所有建庙功德'
                                });
                            });
                    });
                });

                describe('认捐法物', function () {
                    var partId, part, partFindByIdStub;

                    beforeEach(function () {
                        partId = 12345;
                        part = {name: 'foo'}

                        reqStub.params.partId = partId;
                        partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['./models/part'] = {findById: partFindByIdStub};
                    });

                    it('访问法物的相关信息失败', function () {
                        var partId = 12345;
                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], null, err);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(500, null, err);
                            });
                    });

                    it('指定法物不存在', function () {
                        var partId = 12345;
                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], [null]);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                checkResponseStatusCodeAndMessage(404, 'part ' + partId.toString() + ' is not found');
                            });
                    });

                    it('正确显示', function () {
                        var partId = 12345;
                        var part = {name: 'foo'}

                        reqStub.params.partId = partId;
                        var partFindByIdStub = createPromiseStub([partId], [part]);
                        stubs['./models/part'] = {findById: partFindByIdStub};

                        controller = proxyquire('../server/wechat/manjusri', stubs).trans;
                        return controller(reqStub, resStub)
                            .then(function () {
                                expect(resRenderSpy).calledWith('wechat/trans', {
                                    title: '建寺-' + part.name,
                                    part: part
                                });
                            });
                    });
                });
            });
        });

        describe('服务端业务逻辑', function () {
            describe('打印祈福卡', function () {
                it('产生word文档', function () {
                    var docx = require('../modules/templeteddocx');
                    docx.instance('../data/praycardtemplate.docx', '../data/upload/prays')
                        .generate('output.docx', {
                            prays: [
                                {context: '这是我的第一张祈福卡'},
                                {context: '这是我的第二张祈福卡'},
                                {context: '这是我的第三张祈福卡'},
                                {context: '这是我的第四张祈福卡'},
                                {context: '这是我的第五张祈福卡'},
                            ]
                        });
                });
            });

            describe('欢迎图文信息', function () {
                it('可以产生这样的欢迎图文信息', function () {
                    var welcomeMsg = [
                        {
                            title: '静音文殊禅林',
                            description: '描述静音文殊禅林',
                            picurl: 'http://jingyintemple.top/images/banner.jpg',
                            url: 'http://jingyintemple.top/jingyin/manjusri/index'
                        },
                        {
                            title: '欢迎您关注静音文殊禅林-建寺',
                            description: '描述-建寺',
                            picurl: 'http://jingyintemple.top/images/jiansi.jpg',
                            url: 'http://jingyintemple.top/jingyin/manjusri/jiansi'
                        },
                        {
                            title: '欢迎您关注静音文殊禅林-每日一善',
                            description: '描述-每日一善',
                            picurl: 'http://jingyintemple.top/images/jiansi.jpg',
                            url: 'http://jingyintemple.top/jingyin/manjusri/jiansi'
                        },
                        {
                            title: '欢迎您关注静音文殊禅林-随喜功德',
                            description: '描述-随喜功德',
                            picurl: 'http://jingyintemple.top/images/jiansi.jpg',
                            url: 'http://jingyintemple.top/jingyin/manjusri/jiansi'
                        }
                    ];
                    var welcome = require('../server/modules/welcome');
                    welcome(null, function (err, msg) {
                        expect(err).to.be.null;
                        expect(msg).eql(welcomeMsg);
                    });
                });
            });
        });
    });

//TODO:在首页为用户建立一个反馈意见和建议的渠道

//TODO:日行一善和随喜页面中的功德说明的文字应可以在后台系统中发布，每周/月定时替换
})
;


