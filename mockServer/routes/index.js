var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('index', {title: 'Express'});
})

router.get('/pigApi', async function (req, res, next) {

    let {act, userId} = req.query

    // 获取用户信息
    if (act === "init") {

        // returnError (req, res, next)

        res.json({
            "errcode": 0,
            "data": {
                "ID": 4,
                "Wxid": 1451,
                "NickName": "%e6%9e%97%e6%96%87%e5%8d%b0",
                "CanPlayGameNum": 821,
                "Gameid": 13,
                "LastTime": "2018/12/27",
                "UnlockNum": 8,
                "MaxScore": 2600,
                "PrizeList": "",
                "OriginFrom": "",
                "HaveFilledIn": true,
                "HeadImg": "http://wx.qlogo.cn/mmopen/Q3auHgzwzM6DZxpGLB2bbaTq2kzMo0YGmpibjbp6Xuia4B3TtJb1vSp703BQOM4TyIWAjqjXTKGML98VaCibmRIIw/64"
            },
            "errMsg": ""
        })
    }

    // 排行榜列表
    else if (act === "getRankList") {

        res.json({"errcode":0,"data":[{"nickName":"林**","maxScore":2600},{"nickName":"《**","maxScore":120},{"nickName":"黑**","maxScore":120},{"nickName":"一**","maxScore":120},{"nickName":"雪**","maxScore":120},{"nickName":"小**","maxScore":120},{"nickName":"粒**","maxScore":120},{"nickName":"T**","maxScore":120},{"nickName":"伟**","maxScore":120},{"nickName":"糊**","maxScore":120},{"nickName":"a**","maxScore":120},{"nickName":"包**","maxScore":120},{"nickName":"普**","maxScore":120},{"nickName":"ミ**","maxScore":120},{"nickName":"终**","maxScore":120},{"nickName":"妙**","maxScore":120},{"nickName":"初**","maxScore":120},{"nickName":"小**","maxScore":120},{"nickName":"拉**","maxScore":120},{"nickName":"吴**","maxScore":120},{"nickName":"小**","maxScore":120},{"nickName":"傅**","maxScore":120},{"nickName":"m**","maxScore":120},{"nickName":"何**","maxScore":120},{"nickName":"一**","maxScore":120},{"nickName":"行**","maxScore":120},{"nickName":"&**","maxScore":120},{"nickName":"懒**","maxScore":120},{"nickName":"林**","maxScore":120},{"nickName":"易**","maxScore":120},{"nickName":"美**","maxScore":120},{"nickName":"枭**","maxScore":120},{"nickName":"强**","maxScore":120},{"nickName":"H**","maxScore":120},{"nickName":"小**","maxScore":120},{"nickName":"逸**","maxScore":120},{"nickName":"C**","maxScore":120},{"nickName":"Y**","maxScore":120},{"nickName":"Y**","maxScore":120},{"nickName":"I**","maxScore":120},{"nickName":"冬**","maxScore":120},{"nickName":"陈**","maxScore":120},{"nickName":"王**","maxScore":120},{"nickName":"刘**","maxScore":120},{"nickName":"然**","maxScore":120},{"nickName":"重**","maxScore":120},{"nickName":"鱼**","maxScore":120},{"nickName":"☆**","maxScore":120},{"nickName":"高**","maxScore":120},{"nickName":"向**","maxScore":120}],"errMsg":""})

    }

    // 中奖名单
    else if (act === "getPrizeList") {
        res.json({"errcode":0,"data":[{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"围巾"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"袜子"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"袜子"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"袜子"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"汤锅"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"汤锅"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"汤锅"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"汤锅"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"袜子"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"咖啡杯"},{"nickname":"%e6%9e%97**","tel":"137****4951","prize":"茶具"},{"nickname":"%e6%9d%8e**","tel":"152****5009","prize":"咖啡杯"}],"errMsg":""})
    }

    // (废弃) 获取我的奖品
    // else if (act === "getMyPrice") {
    //     res.json({
    //         errcode: 0,
    //         errMsg: "ok",
    //         userId,
    //         data: [{
    //             grade: "三等奖",
    //             prize: "入场券",
    //         }, {
    //             grade: "一等奖",
    //             prize: "LILANZ 陶瓷茶具套装",
    //         }, {
    //             grade: "二等奖",
    //             prize: "欧式陶瓷咖啡杯",
    //         }, {
    //             grade: "二等奖",
    //             prize: "汤锅",
    //         },
    //         ],
    //     })
    //
    // }

    // 点击开始游戏,验证游戏次数合法性,返回剩余次数 verifyNumberOfGame
    else if (act === "gotoGame") {

        res.send({
            errcode: 0,
            errMsg: "ok",
            data: 820
        })

    }

    // 提交游戏分数并获取奖品 sendGameResult
    else if (act === "getprize") {

        let {result} = req.query

        // 获胜
        if (result === "win") {
            let hasPrize = Math.random() > 0.5
            if (hasPrize){
                res.send({"errcode":0,"data":{"defeatsPercen":"0.63","maxScore":2600,"CanPlayGameNum":819,"prizeid":"48","prizename":"入场券"},"errMsg":"ok"})
            } else {
                res.send({"errcode":0,"data":{"defeatsPercen":"0.63","maxScore":2600,"CanPlayGameNum":819,"prizeid":"0","prizename":"运气还差一点"},"errMsg":"ok"})
            }
        } else {
            // 失败
            res.send({"errcode":0,"data":{"defeatsPercen":"0.63","maxScore":2600,"CanPlayGameNum":820,"prizeid":"0","prizename":"无奖品"},"errMsg":"ok"})
        }

    }

    // 分享后调用,增加游戏次数
    else if (act === "addGameCounts") {
        res.json({
            "errcode": 0,
            "data": "",
            "errMsg": ""
        })
    }
    else {
        res.send({
            errcode: 404,
            errMsg: "没有对应操作",
            data: {}
        })
    }

})

function returnError(req, res, next) {
    res.send({
        errcode: 404,
        errMsg: "服务器错误,请稍后再试",
        data: {}
    })
}

function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

module.exports = router;
