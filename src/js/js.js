import html2canvas from "html2canvas"

var template = require('template_js')
var urlencode = require('urlencode');

// template.js 配置开始和闭合标签,默认的 <% %> 打包会报错
template.config({sTag: '{{', eTag: '}}'});


// 全局变量 BEGIN
// 当前所在的关卡
window._curLevel = 1
// 最大关卡
window._maxLevel = 7
// 剩余抽奖次数,后台控制,如果到达终点直接返回抽奖结果
window._drawNum = 0
// 可以游戏的次数
window._canPlayGameNum = 0
// 已解锁的关卡数量(全部解锁,通关解锁 +1)
window._unlockNum = 1
// 是否已经填写领奖信息
window._haveFilledIn = false
// 当前获得的奖品
window._prizeId = 0
window._curPrize = ""
window._maxScore = 0
window.userInfo = {
    counts: 3,
    userId: 0,
    enOpenid: "",
    qyUser: 0,
    HeadImg: "",
}
// 允许下雪,默认 true
window._allowSnow = JSON.parse(localStorage.getItem("PIGPIG_allowSnow")) === null
    ? true
    : JSON.parse(localStorage.getItem("PIGPIG_allowSnow"))
// console.error(
//     JSON.parse(localStorage.getItem("PIGPIG_allowSnow")) === null
// )
window.$loading = function (text = "加载中") {
    let toast = $(document).dialog({
        type: 'toast',
        infoIcon: '../resource/image/icon/loading.gif',
        infoText: text,
    })
    return {
        update: function () {
            toast.update({
                infoIcon: '../resource/image/icon/success.png',
                infoText: '加载成功',
                autoClose: 2000,
            })
        },
        close: function () {
            toast.close()
            // $(".dialog") && $(".dialog").remove()
        }
    }
}
window.$warn = function (text = "警告", duration = 1500) {
    // TODO 换成红色
    let toast = $(document).dialog({
        type: 'toast',
        infoIcon: '../resource/image/icon/warn-f-white.png',
        infoText: text,
        autoClose: duration,
    })
}
window.$success = function (text = "成功", duration = 1500) {
    let toast = $(document).dialog({
        type: 'toast',
        infoIcon: '../resource/image/icon/success.png',
        infoText: text,
        autoClose: duration,
    })
}
window.log = function (message) {
    if (arguments.length > 1) {
        console.log(...arguments)
        return
    }

    if (typeof message === "string") {
        console.log("%c " + message + " %c",
            "background:#fff; padding: 1px; color: #1b54f2", "background:transparent")
    } else if (typeof message === "number") {
        console.log("%c " + message + " %c",
            "background:#41b883 ; padding: 1px; border-radius: 3px ;  color: #fff", "background:transparent")
    } else if (Array.isArray(message)) {
        console.table(message)
    }
    else {
        // console.log(time, ...arguments)
        console.log(message)
    }
}

// 圣诞节DLC - 下雪
import snow from "./snow.js"

window._snow = snow

// 全局变量 END
// 显示 游戏结果 页面
window.showGameResult = async function (result, score) {

    let gameResult = $(".game-result")
    let defeatPercentage = "0%"
    let highestScore = 0
    // 减少可游戏次数
    _canPlayGameNum--

    // 停止下雪
    window._snow.stop()

    // 不管输赢,都发送游戏结果
    let loading = $loading("正在发送游戏结果")
    // 如果返回错误是否还要显示结果页???
    await api.sendGameResult(result, score, window._curLevel).then((res) => {
        // 真实接口必然要转数据格式
        loading.close()

        window._prizeId = parseInt(res.prizeid)
        window._maxScore = res.maxScore
        window._curPrize = res.prizename
        window._canPlayGameNum = res.CanPlayGameNum

        defeatPercentage = res.defeatsPercen
        highestScore = res.maxScore

    }).catch((error) => {
        loading.close()
        console.error(error)
    })

    if (result === "win") {
        console.log("_drawNum++ 要执行")
        // 可抽奖次数 +1,如果页面没抽,实际后台已经发放了奖品
        _drawNum = 1
        // 如果当前通过的关卡等于已解锁的数量,就解锁下一关. 这是本地的,开始游戏还是需要发送验证
        // 两个的类型竟然会不一样...
        if (_curLevel === _unlockNum) {
            _unlockNum++
            console.log("成功解锁一个新关卡: " + _unlockNum)
        }
        // 最高只能到第 _maxLevel 关,不能继续下一关了
        $(".draw-result .game-next").show()
        if (_curLevel >= _maxLevel) {
            $(".draw-result .game-next").hide()
        }
        $(".game-result.game-win").show()

    } else {
        _drawNum = 0
        // 显示游戏失败
        $(".game-result.game-lose").show()
    }

    // 是否显示抽奖
    if (_drawNum < 1) {
        $(".luck-draw").hide()
        $(".go-select").show()
    } else {
        $(".luck-draw").show()
        $(".go-select").hide()
    }


    // 创建游戏结果的文本模版,当前分数,排名等
    let tpl = document.getElementById("game-result-text-wrapper").innerHTML
    let data = {
        score: pigLevelScene.score,
        defeatPercentage,
        highestScore,
        drawNum: window._drawNum,
    }
    let html = template(tpl, data)
    gameResult.find(".text-wrapper").html(html)

    gameResult.find(".score").text(score)

    // 预加载微信头像
    let imgUrl = userInfo.HeadImg
        ? userInfo.HeadImg
        : "../resource/image/avatar.png"
    preloadSingleImage(imgUrl)
}

// 显示 抽奖 页面
function showLuckDraw(prizeId) {

    let drawResult = $(".draw-result")
    let drawResultHasGift = $(".draw-result.has-gift")
    let drawResultNoGift = $(".draw-result.no-gift")

    if (prizeId > 0) {
        let prizeName = {
            "48": "ticket",
            "49": "sock",
            "50": "coffee-cup",
            "51": "tea-set",
            "52": "scarf",
            "53": "pot",
        }
        drawResultHasGift.show()
        // drawResult.find(".sprites").attr("class", "sprites sprite-has-gift")
        drawResultHasGift.find(".gift-img")[0].src = `http://lilanz.oss-cn-fujian-a.aliyuncs.com/2018games/image/prize/${prizeName[_prizeId]}.png`
        // $(".draw-result.has-gift").find(".sprite-has-gift").remove()
        drawResultHasGift.find(".text-wrapper").html(`<p>恭喜获得: ${_curPrize}</p>`)
    } else {
        drawResultNoGift.find(".text-wrapper").html(`<p>${_curPrize}</p>`)
        drawResultNoGift.show()
    }

    // 显示完奖品及时把 _curPrize 清空
    _curPrize = ""
    // 剩余了抽奖次数显示再抽一次
    if (_drawNum > 0) {
        drawResult.find(".luck-draw").show()
    } else {
        drawResult.find(".luck-draw").hide()
    }

}

// 显示 倒计时 页面
window.showCountingdownPage = function (success) {
    try {
        // 倒计时相关页面设置
        $(".countdown-wrapper").css("display", "flex")

        let second = 3
        let countdownDom = $(".countdown")
        countdownDom.text(second)
        countdownDom.css("display", "block")
        countdownDom.siblings().css("display", "none")

        let timer = setInterval(() => {
            second--
            if (second) {
                countdownDom.text(second)
            } else {
                clearInterval(timer)
                $(".countdown-wrapper").css("display", "none")
                success()
            }
        }, 1000)
    } catch (e) {
        $warn(e)
    }
}

// 显示 选关 页面
function showPageSelect() {
    let tpl = document.getElementById("page-select-container").innerHTML
    let html = template(tpl, {
        canPlayGameNum: _canPlayGameNum,
        unlockNum: _unlockNum,
        maxScore: _maxScore,
    })

    let page = $(".page-select")
    page.find(".container").html(html)
    page.find(".max-score").text(html)

    page.show()

    // 恢复上次的选关(可能有多个微信号,一个比较高)
    let savedLevel = localStorage.getItem("PIGPIG_curLevel") || 1
    _curLevel = savedLevel > _unlockNum ? _unlockNum : parseInt(savedLevel)

    $(".page-select .level-wrapper").children().eq(_curLevel - 1).addClass("selected")

    localStorage.setItem("PIGPIG_curLevel", _curLevel)

    // 预加载当前关卡图片
    preloadSingleImage("../resource/image/level" + _curLevel + "-bg.jpg")
}

// 显示我的奖品页
function showPageMyPrize() {
    // 不用做,要跳到另一个地方
    window.location.href = "../../myprize/myprize.aspx"
}

// 显示主页
function showPageHome() {
    $(".page-home .remain-time-text").text(_canPlayGameNum)

    $(".page-home").show()
}

// 显示中奖名单页
function showPagePrizeList() {

    let list = []

    api.getPrizeList().then((res) => {
        // 真实接口必然要转数据格式
        list = res
        creatTpl(list)
    }).catch((error) => {
        creatTpl(list)
        console.error(error)
    })

    function creatTpl(list) {
        let html = ""
        for (let i = 0; i < list.length; i++) {
            let html1 = ""
            html1 += `<td>${urlencode.decode(list[i].nickname)}</td>`
            html1 += `<td>${list[i].tel}</td>`
            html1 += `<td>${list[i].prize}</td>`
            html += `<tr>${html1}</tr>`
        }

        $(".page-prize-list .page-prize-list-body").html(html)
        $(".page-prize-list").show()
    }

}

// 显示排行榜页 使用模版报错,这里只能手动拼接字符串
function showPageRank() {

    let list = []

    api.getRankList().then((res) => {
        // 真实接口必然要转数据格式
        list = res
        creatTpl(list)
    }).catch((error) => {
        creatTpl(list)
        console.error(error)
    })

    function creatTpl(list) {
        let html = ""
        for (let i = 0; i < list.length; i++) {
            let html1 = ""
            if (i === 0) {
                html1 += `<div class="sprites sprite-rank-one"></div>`
            } else if (i === 1) {
                html1 += `<div class="sprites sprite-rank-two"></div>`
            } else if (i === 2) {
                html1 += `<div class="sprites sprite-rank-three"></div>`
            } else {
                html1 += (i + 1)
            }
            html1 = `<td>${html1}</td>`
            html1 += `<td>${list[i].nickName}</td>`
            html1 += `<td>${list[i].maxScore}</td>`
            html += `<tr>${html1}</tr>`
        }

        let page = $(".page-rank")

        $(".page-rank-tbody").html(html)
        page.show()
    }
}

// 创建各种按钮的点击事件
function createClickEvent() {

    // 每个弹出的页面都放一个关闭按钮
    $(".btn-close").on("click", function (e) {
        e.stopPropagation()

        // 清除晒晒战绩里面的头像和图片
        if ($(".page-share")[0].style.display === "block") {
            // 清空 html2canvas 生成的 base64图片
            $(".page-share .out-box").empty()
            // 移除二维码
            $(".page-share .container").find(".avatar").remove()
        }

        $(this).parent().hide()

    })

    // 新手指引点击事件
    $(".guide").on("click", function () {
        window.pigLevelScene.player.resumeMove()


        $(this).remove()
    })
    // 主页
    let homePage = $(".page-home")
    homePage.find(".sprite-rank").on("click", function () {
        showPageRank()
    })
    homePage.find(".sprite-start-game").on("click", function () {
        console.log("要进入选关页")
        showPageSelect()
    })
    homePage.find(".sprite-rule").on("click", function () {
        $('.page-rule').show()
        // homePage.hide()
    })
    homePage.find(".sprite-prize").on("click", function () {
        showPageMyPrize()
    })
    homePage.find(".sprite-list").on("click", function () {
        showPagePrizeList()
        // homePage.hide()
    })
    // 主页 END

    // 游戏结果 页面
    let gameResult = $(".game-result")
    // 进下一关 按钮
    $(".game-next").on("click", function () {
        _curLevel++

        // 挑战下一关消耗次数
        let loading = $loading("正验证游戏次数")
        // 减少可游戏次数
        api.verifyNumberOfGame().then((res) => {
            window._canPlayGameNum = res

            loading.close()
            pigLevelScene.restartGame(undefined, _curLevel)
            $(".draw-result").hide()
            $(".bg-world").css("background-image", "url('../resource/image/level" + _curLevel + "-bg.jpg')")
            $('.page-game').show()
            $(".page-select").hide()

            $(".game-result").hide()
        }).catch((error) => {
            loading.close()
            console.error(error)
        })

    })
    // 再玩一次按钮(页面中已无再玩一次)
    $(".game-again").on("click", function () {
        let loading = $loading("正验证游戏次数")
        // 减少可游戏次数
        api.verifyNumberOfGame().then((res) => {
            window._canPlayGameNum = res

            loading.close()

            pigLevelScene.restartGame(undefined, _curLevel)
            $(".draw-result").hide()
        }).catch((error) => {
            loading.close()
            console.error(error)
        })

    })
    // 抽奖
    $(".luck-draw").on("click", function () {
        // 减少剩余抽奖次数
        if (_drawNum < 1) {
            alert("抽奖次数已耗尽")
            _drawNum = 0
        } else {
            _drawNum--
            // 显示摇一摇页面
            showShakeShake()
            // 隐藏游戏胜利页面
            $(this).parent().parent().hide()
        }
    })

    gameResult.find(".rank").on("click", function () {
        showPageRank()
    })
    gameResult.find(".share").on("click", function () {
        showPageShare()
    })
    gameResult.find(".go-select").on("click", function () {
        showPageSelect()
    })
    // 游戏结果 页面 END

    // 抽奖 页面
    let drawResult = $(".draw-result")
    drawResult.find(".rank").on("click", function () {
        showPageRank()

    })
    drawResult.find(".share").on("click", function () {
        showPageShare()
    })
    drawResult.find(".prize-detail").on("click", function () {
        showPageMyPrize()

    })
    drawResult.find(".go-select").on("click", function () {
        showPageSelect()
    })
    // 抽奖 页面 END

    // 游戏页面
    $(".page-game").on("click", ".go-home", function () {

        // TODO 把游戏页隐藏在chrome会卡顿
        showPageHome()
        $(".page-game").hide()
        // window.location.reload()

    })

    // 游戏页面 END

    // .page-select 选关页面
    // 选关页面的 `开始游戏` 按钮
    $(".page-select").on("click", ".btn-start", async function () {

        if (_canPlayGameNum < 1) {
            alert("今日次数已耗尽,明日再来吧")
            return
        }

        if ($(".guide").length < 1 && window.pigLevelScene) {
            // 冇得新手指导界面,重启游戏,倒计时结束会恢复速度
            pigLevelScene.restartGame(undefined)
        } else {
            // 有新手指导界面,开始游戏场景,点击新手指导会恢复速度
            preloadScene.scene.start('pigLevelScene')
        }

        let loading = $loading("正验证游戏次数")
        // 减少可游戏次数
        api.verifyNumberOfGame().then((res) => {
            window._canPlayGameNum = res

            loading.close()
            $(".bg-world").css("background-image", "url('../resource/image/level" + _curLevel + "-bg.jpg')")
            $('.page-game').show()
            $(".page-select").hide()

            $(".game-result").hide()
            $(".draw-result").hide()

            // 下雪
            _curLevel === 7 && _allowSnow && window._snow.start()
        }).catch((error) => {
            loading.close()
            console.error(error)
        })

    })

    // 选关页,点击选关
    $(".page-select .container").on("click", ".sprites", function () {
        if ($(this).hasClass("sprite-locked")) {
            alert("尚未解锁")
        } else {
            $(this).addClass("selected")
            $(this).siblings().removeClass("selected")
            // 选关,点击的元素 索引 + 1
            _curLevel = $(this).parent().children().index(this) + 1

            // 点到那关就加载对应关卡的背景图(只有玩过才有用,因为 .bg-world 隐藏的时候浏览器不会去加载图片)
            preloadSingleImage("../resource/image/level" + _curLevel + "-bg.jpg")

            localStorage.setItem("PIGPIG_curLevel", _curLevel)
            console.log("当前选择关卡: " + _curLevel)
        }
    })
    // .page-select 选关页面 END

    // 我的奖品页,保存领奖信息
    $(".page-my-prize").on("click", ".btn-save-prize-info", function () {
        _haveFilledIn = true
        showPageMyPrize()
    })


    // 分享页,装载截图图片的盒子
    $(".page-share").on("click", ".out-box", function (e) {
        e.stopPropagation()
        // 清空 html2canvas 生成的 base64图片
        $(this).removeClass("screenshot")
        $(this).empty()
    })
    // 分享页 END


    // 摇一摇页面,点击隐藏
    let isShake = false, isUse = false
    let clickCounts = 0
    let clearCounts = null
    $(".shake-shake").on("click", function () {
        if (clearCounts == null) {
            clearCounts = setTimeout(function () {
                clickCounts = 0
                clearCounts = null
            }, 1000)
        }
        clickCounts++
        if (clickCounts === 2) {
            clickCounts = 0
            let event = new CustomEvent("shake")
            window.dispatchEvent(event)
        }
    })

    $("#snow-switch").on("click", () => {
        if ($("#snow-switch").attr('class') === "icon iconfont icon-xue") {
            _allowSnow = false
            window._snow.stop()
            $("#snow-switch").attr("class", "icon iconfont icon-yin")
        } else {
            _allowSnow = true
            window._snow.start()
            $("#snow-switch").attr("class", "icon iconfont icon-xue")
        }
        localStorage.setItem("PIGPIG_allowSnow", _allowSnow)
    })
    // 摇一摇事件 触发
    window.addEventListener('shake', function () {
        window.ondevicemotion = null

        document.getElementById('shakeSound').play()
        document.querySelector('.rock-top').classList.add('rockup')
        document.querySelector('.rock-bottom').classList.add('rockdown')
        // isShake = true
        userInfo.counts--
        // isUse = true

        // 显示 loading 的???
        let isSuccess = false

        // 等摇一摇动画结束
        setTimeout(function () {

            console.log("摇一摇成功了")
            document.querySelector('.rock-top').classList.remove('rockup')
            document.querySelector('.rock-bottom').classList.remove('rockdown')
            // 显示抽奖结果页面,在游戏结束时就已经返回
            // alert(_curPrize)
            showLuckDraw(_prizeId)
            $(".shake-shake").hide()
        }, 1300)
    })
}

// 图片生成 base64
function getBase64Image(img) {

    let canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    let ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0, img.width, img.height)

    return canvas.toDataURL("image/png")
    // return dataURL.replace("data:image/pngbase64,", "")
}

// 显示分享页面,二维码转base64,html生成canvas,再转图片base64
function showPageShare() {

    $(".page-share").show()

    $(".page-share .out-box").removeClass("screenshot")
    let dom = $(".page-share .container")


    // 重做分享页之后不需要把文字变白了,4关要变黑...
    if (_curLevel === 4) {
        dom.addClass("black")
    } else {
        dom.removeClass("black")
    }
    // 占位
    $("#place-holder-div")[0].style.height = dom.height() + "px"

    var img = new Image();
    img.setAttribute("crossOrigin", 'anonymous')    // 设置 img 允许跨域
    img.src = userInfo.HeadImg
        ? userInfo.HeadImg
        : "../resource/image/avatar.png"

    // 用两个 img 是因为第一次生成了图片再关闭页面会把整个 dom 移除
    let img1 = document.createElement('img')
    $(".page-share .avatar-wrapper").append(img1)

    img.onload = function () {
        img1.classList.add("avatar")

        img1.src = getBase64Image(img)

        img1.onload = function () {
            console.log("已生成二维码并插入页面")
            let pageShareContainer = $(".page-share .container")
            let w = pageShareContainer.width()
            let h = pageShareContainer.height()//要将 canvas 的宽高设置成容器宽高的 2 倍
            let canvas = document.createElement("canvas")
            canvas.width = w * 2
            canvas.height = h * 2
            canvas.style.width = w + "px"
            canvas.style.height = h + "px"
            let context = canvas.getContext("2d")//然后将画布缩放，将图像放大两倍画到画布上
            context.scale(2, 2)
            html2canvas(pageShareContainer[0]).then(function (canvas) {
                let dataUrl = canvas.toDataURL()
                let newImg = document.createElement("img")
                newImg.src = dataUrl
                newImg.id = "img-share"
                // $(".page-share").append(newImg)
                $(".page-share .out-box").html(newImg)
                $(".page-share .out-box").addClass("screenshot")

                document.getElementById('screenshot-audio').play()
                // 占位 还原
                $("#place-holder-div")[0].style.height = 0 + "px"

                $(".page-share .out-box img").unbind('click').removeAttr('event').on("click", function (e) {
                    e.stopPropagation()
                    e.cancelBubble = true
                    log(".out-box img ")
                    return false
                })
            })
        }

        img1.onerror = function () {
            $warn("哎呀生成战绩图片失败了")
        }
    }

    img.onerror = function () {
        $warn("哎呀获取你的头像失败了")
        img.src = "../resource/image/avatar.png"
    }
    // 处理分享,以后可能要扫码了才会增加次数
    // shareHandler()

    // 点进来直接加次数
    api.addGameCounts(3).then((res) => {
        _canPlayGameNum += 3
        $success("已增加3次游戏机会")
        $(".remain-time-text").text(_canPlayGameNum)
        console.log("已增加游戏次数 ", res)
    }).catch((error) => {
        console.error(error)
    })
}

// 分享朋友圈的 handler,只有在这里分享会增加次数
function shareHandler() {

    isInWeixin() && wxShare("http://example.com/",
        "闯关赢奖品,拼手速的时刻来啦",
        "http://example.com/image/pig.jpg",
        "你的好友已经完成关卡挑战了,你敢来一战高下吗",
        (shareTo) => {
            // 转发至朋友圈可增加5次机会,一天最多加5次
            api.addGameCounts(3).then((res) => {
                _canPlayGameNum += 3
                $success("已增加3次游戏机会")
                $(".remain-time-text").text(_canPlayGameNum)
                console.log("已增加游戏次数 ", res)
            }).catch((error) => {
                console.error(error)
            })
        }
    )
}

// 显示摇一摇页面
function showShakeShake() {

    // 创建奖品列表
    let list = [
        "ticket",
        "ticket,sock",
        "ticket,sock,coffee-cup",
        "ticket,scarf,tea-set",
        "ticket,scarf",
        "ticket,pot",
        "ticket,pot",
    ]
    let prizeName = {
        "ticket": "入场券",
        "sock": "袜子",
        "coffee-cup": "陶瓷咖啡杯",
        "tea-set": "茶具",
        "scarf": "围巾",
        "pot": "汤锅",
    }

    // 每关奖品的数组
    let html = ""
    let prizeArr = list[_curLevel - 1].split(",")
    prizeArr.forEach((item) => {
        let html1 = ""
        html1 += `<img src="http://lilanz.oss-cn-fujian-a.aliyuncs.com/2018games/image/prize/${item}.png" alt="${prizeName[item]}">`
        html1 += `<div class="text">${prizeName[item]}</div>`
        html += `<div class="prize-item">${html1}</div>`
    })

    $(".shake-shake .prize-list").html(html)

    $(".shake-shake").show()
    createShakeAShake()
}

// 创建摇一摇,监听摇一摇的事件在另外一个地方
function createShakeAShake() {
    const EMPTY_VALUE = 100
    const THREAD_HOLD = 13.8

    let minX = EMPTY_VALUE,
        minY = EMPTY_VALUE

    // 监听手机摇动(只有在摇一摇的页面能触发,一旦触发了就会被及时移除)
    window.ondevicemotion = function (event) {
        let gravity = event.accelerationIncludingGravity,
            x = gravity.x,
            y = gravity.y
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (Math.abs(x - minX) > THREAD_HOLD &&
            Math.abs(y - minY) > THREAD_HOLD) {
            let event = new CustomEvent("shake")
            window.dispatchEvent(event)
            minX = minY = EMPTY_VALUE
        }
    }
}

// 预加载单张图片
function preloadSingleImage(imgUrl) {
    let img = new Image();
    img.setAttribute("crossOrigin", 'anonymous')    // 设置 img 允许跨域
    img.src = imgUrl
    console.log("预加载单张图片: " + imgUrl)
}

import * as api from "../api/api"

window.onload = function () {

    // 初始化下雪图标
    if (_allowSnow) {
        $("#snow-switch").attr("class", "icon iconfont icon-xue")
    } else {
        $("#snow-switch").attr("class", "icon iconfont icon-yin")
    }

    // 创建各种按钮的点击事件
    createClickEvent()

    // 先让默认主页显示出来
    showPageHome()

    let loading = $loading("正载入用户")
    // 获取初始化需要的一些数据
    api.init().then((res) => {
        console.log("init: ", res)
        window.userInfo = res
        window._canPlayGameNum = res.CanPlayGameNum
        window._unlockNum = res.UnlockNum
        window._haveFilledIn = res.HaveFilledIn
        window._maxScore = res.MaxScore

        // 显示已经载入了用户数据的主页
        showPageHome()

        loading.close()

    }).catch((error) => {
        console.error(error)
        loading.close()
    })

    // 注入微信分享,直接分享就会增加次数,不必在战绩页面
    shareHandler()

}
