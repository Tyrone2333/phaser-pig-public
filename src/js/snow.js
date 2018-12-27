// 兼容 requestAnimationFrame,旧版用 setTimeout
(function compatibleRAF() {
    var lastTime = 0;
    var prefixes = 'webkit moz ms o'.split(' '); //各浏览器前缀

    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;

    var prefix;
//通过遍历各浏览器前缀，来得到requestAnimationFrame和cancelAnimationFrame在当前浏览器的实现形式
    for (var i = 0; i < prefixes.length; i++) {
        if (requestAnimationFrame && cancelAnimationFrame) {
            break;
        }
        prefix = prefixes[i];
        requestAnimationFrame = requestAnimationFrame || window[prefix + 'RequestAnimationFrame'];
        cancelAnimationFrame = cancelAnimationFrame || window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
    }

//如果当前浏览器不支持requestAnimationFrame和cancelAnimationFrame，则会退到setTimeout
    if (!requestAnimationFrame || !cancelAnimationFrame) {
        requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            //为了使setTimteout的尽可能的接近每秒60帧的效果
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        cancelAnimationFrame = function (id) {
            window.clearTimeout(id);
        };
    }

//得到兼容各浏览器的API
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
})()

// 圣诞节 - 下雪
const snow = {
    info: {
        top: 0,
        left: 0,
        zIndex: 500,
        number: 16
    },
    timer: 0,   // 开始动画的定时器
    timer2: 0,  // 关闭动画的定时器
    oldSnowArr: [],
    onStoping: false,
    stopped: true,
    start: function () {
        this.stopped = false
        this.onStoping = false
        console.log("开始下雪")

        //获取页面的大小
        var win_Width = window.innerWidth;
        var win_Height = window.innerHeight;

        var oldCanvas = document.getElementById("snow-canvas")
        var oCanvas
        if (oldCanvas) {
            oCanvas = oldCanvas
        } else {
            //创建场景
            oCanvas = document.createElement('canvas');
            oCanvas.id = "snow-canvas"
            oCanvas.style.position = 'fixed';
            oCanvas.style.pointerEvents = 'none';
            oCanvas.style.top = snow.info.top + 'px';
            oCanvas.style.left = snow.info.left + 'px';
            oCanvas.style.zIndex = snow.info.zIndex;
            oCanvas.width = win_Width;
            oCanvas.height = win_Height;
            document.body.appendChild(oCanvas);
        }

        // 创建雪,如果以前的雪数组没减完就在原来的基础上增加雪量
        var arrSnow = this.oldSnowArr;
        let shouldAddSnowNum = snow.info.number - this.oldSnowArr.length
        for (var i = 0; i < shouldAddSnowNum; i++) {
            arrSnow.push({
                x: Math.random() * win_Width,//雪的横坐标
                y: Math.random() * win_Height,//雪的纵坐标
                r: Math.random() * 4 + 1,//雪的半径
                n: Math.random() * 70
            });
        }
        var gd = oCanvas.getContext('2d');//用来绘制元素
        var speed = 0;

        let _this = this
        this.timer = window.requestAnimationFrame(function fn(time) {
            gd.clearRect(0, 0, win_Width, win_Height);
            gd.fillStyle = 'rgba(255, 255, 255, 0.6)';
            gd.shadowBlur = 5;
            gd.shadowColor = 'rgba(255, 255, 255, 0.9)';
            gd.beginPath();

            // 绘制雪 + 处理雪下落 ,由于在停止的时候雪数组会被一点点消减,i 就不能 < snow.info.number
            for (var i = 0; i < arrSnow.length; i++) {
                var _snowObj = arrSnow[i];

                // 绘制雪
                gd.moveTo(_snowObj.x, _snowObj.y);
                gd.arc(_snowObj.x, _snowObj.y, _snowObj.r, 0, Math.PI * 2, 0);
                // 绘制雪 END

                _snowObj.y += Math.cos(speed + _snowObj.n) + _snowObj.r / 2;
                _snowObj.x += Math.sin(speed) * 2;
                // 如果正在停止中
                if (_this.onStoping) {
                    // 减少雪花的直径,减到了负数就把这个雪花移除
                    _snowObj.r -= 0.06
                    if (_snowObj.r < 0) {
                        arrSnow.splice(i, 1)
                        break
                    }
                }
                if (_snowObj.x > win_Width + 5 || _snowObj.x < -5 || _snowObj.y > win_Height) {
                    arrSnow[i] = i % 3 > 0 ? {
                        x: Math.random() * win_Width,
                        y: -10,
                        r: _snowObj.r,
                        n: _snowObj.n
                    } : Math.sin(speed) > 0 ? {
                        x: -5,
                        y: Math.random() * win_Height,
                        r: _snowObj.r,
                        n: _snowObj.n
                    } : {x: win_Width + 5, y: Math.random() * win_Height, r: _snowObj.r, n: _snowObj.n};
                }
            }

            // 填色雪花
            gd.fill();
            speed += 0.01;

            // 保存每次的雪花数组
            _this.oldSnowArr = arrSnow

            // 当雪花数组都删完了就关闭动画
            if (arrSnow.length > 0) {
                _this.timer = requestAnimationFrame(fn);
            } else {
                _this.stopped = true
                _this.onStoping = false
                window.cancelAnimationFrame(_this.timer)
                window.cancelAnimationFrame(_this.timer2)
            }
        })

    },
    stop: function () {
        console.log("停止下雪")
        this.onStoping = true
        this.stopped = false
    }
}

export default snow