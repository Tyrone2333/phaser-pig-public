import {_get, _post} from "../api/ajax"

console.log("当前所在环境: " + process.env.NODE_ENV)

// 用户信息
export function init() {
    let params = {
        act: "init",
    }
    return _get(params)
}

// 中奖名单
export function getPrizeList() {
    let params = {
        act: "getPrizeList",
    }
    return _get(params)
}

// 排行榜列表
export function getRankList() {
    let params = {
        act: "getRankList",
    }
    return _get(params)
}

// (废弃) 获取我的奖品
// export function getMyPrize() {
//
//     let params = {
//         act: "getMyPrize",
//     }
//     return _get(params)
// }

//  点击游戏开始按钮,验证游戏次数,返回已经减过了的剩余次数
// 用到的地方: 选关页开始游戏按钮,再玩一次,去下一关
export function verifyNumberOfGame(userId) {
    let params = {
        act: "gotoGame",
        userId,
    }
    return _get(params)
}

// 提交游戏分数并获取奖品
export function sendGameResult(result, score, curLevel) {
    let params = {
        act: "getprize",
        result,
        curScore: score,
        checkpoint : curLevel
    }
    return _get(params)
}

// 分享后调用,增加游戏次数
export function addGameCounts(counts) {
    let params = {
        act: "addGameCounts",
        counts
    }
    return _get(params)
}
