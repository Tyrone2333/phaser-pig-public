let baseUrl = process.env.BASE_URL

function _ajax(data, type) {
    let apiUrl = baseUrl
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: apiUrl,
            data: data,
            type: type,
            dataType: 'JSON',
            success: function (res) {
                try {
                    res = JSON.parse(res)
                } catch (e) {
                    res = {}
                }
                if (res.errcode == 0) {
                    resolve(res.data);
                } else {
                    // 101 是不能再增加游戏次数,
                    if(res.errcode == 101){

                    }else {
                        $warn(res.errMsg || "服务器返回了不正确的数据: " + JSON.stringify(res))
                    }
                    reject(res);
                }
            },
            error: function (err) {
                $warn("服务器发生错误,请稍后再试")

                reject(err);
            }
        });
    });
}

export const _get = (data) => {
    return _ajax(data, 'GET');

}
export const _post = (data) => {
    return _ajax(data, 'POST');

}

