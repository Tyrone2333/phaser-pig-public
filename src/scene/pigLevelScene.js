import PlayerSprite from "../object/Player";
import Coin from "../object/Coin";
import Arrow from "../object/Arrow";

export default class pigLevelScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'pigLevelScene'
        })
        // 控制相机是跟随玩家还是用按键控制,把需要的模式放在最前面
        this.cameraMode = "follow" || "keyControl" || null

        this.level = {
            width: 1600,
            height: 2560,
        }
    }

    init(restartConfig) {
        if (JSON.stringify(restartConfig) === "{}") {
            // 默认配置
            this.gameConfig = {
                scene: {
                    score: 0,
                    level: ~~window._curLevel || 1, // 在选关页选择的关卡
                    mute: false, // 是否静音
                },
                player: {
                    life: 3 // 并没有用,只有一命
                }
            }
        } else {
            this.gameConfig = restartConfig
        }
        // 当前的关卡
        this.curLevel = this.gameConfig.scene.level
        log("游戏初始化完成")
    }

    preload() {
        // 加载地图
        this.load.tilemapTiledJSON(`level${this.curLevel}pigTilemap`, `../resource/maps/level${this.curLevel}-pigTilemap.json`)
        // 圣诞DLC背景音乐
        if (this.curLevel === 7) {
            this.load.audio('ChristmasBgMusic', '../resource/audio/ChristmasBgMusic.mp3');
        }
    }

    create() {
        log("create")
        // 启动和重启要设置的一些游戏参数
        this.score = this.gameConfig.scene.score
        // 重置得分
        $(".score").text(this.score)

        // 已经过的转角数量
        this.overCornerCount = 0
        // 下一个应该旋转 camera 的转角数
        this.nextRotateCornerCount = 7
        // 每隔多少个转角旋转,忽略跳跃
        this.rotateSpacing = 3

        // 是否游戏结束
        this.gameover = false

        // 音乐相关
        this.createMusic()

        // 创建 layer
        this.createLayer()

        //  生成各种组(动态 sprite )
        this.createGroupFromObjects()

        // 创建监听(鼠标移动)
        // this.createListener()

        // 调试内容
        this.showDebug = true
        // this.createDebugDraw()   //

        // 暂时没用到
        // this.createGUIMonit()

        // 第一个拐角    x: 1200, y: 800,
        // new player
        this.player = new PlayerSprite({
            scene: this,
            // x: 600, y: 800,
            // x: 0, y: 0,
            x: this.startPoint.x, y: this.startPoint.y,  // 出生点,在 createLayer() 中
        }, this.gameConfig.player)
        // 立即停止移动,让游戏先加载出来,防止卡顿
        // 在点击新手指导,或者重启游戏的倒计时之后需调用 resumeMove() 来恢复移动
        this.player.stopMove()

        // 左上角的文本
        // this.scoreText = this.add.text(0, 0, "score : 0").setScrollFactor(0)
        // this.debugText = {
        //     pointPosition: this.add.text(0, 50, "指针:").setScrollFactor(0),
        //     // playerLife: this.add.text(120, 0, "生命:").setScrollFactor(0)
        // }

        // 创建碰撞
        this.createCollision()
        // 镜头控制,跟随 or 自由移动
        this.setCameraControl()

        // 把当前的 scene 挂载到 window
        window.pigLevelScene = this

        // 临时测试,直接死亡
        // this.gameOver("win")

    }

    update(time, delta) {
        // 玩过一次,再启动场景就会直接执行update,而不是等 create 完,很奇怪,不加判断的话 player.scene 会报 undefined
        this.player && this.player.update(time, delta)
        // this.updateText()
    }

    // 创建 layer
    createLayer() {
        this.map = this.add.tilemap(`level${this.curLevel}pigTilemap`)
        let pigtilemap_tileset = this.map.addTilesetImage('pigtilemap_tileset')

        // createDynamicLayer || createStaticLayer
        this.graphicLayer = this.map.createDynamicLayer('graphicLayer', pigtilemap_tileset, 0, 0)

        //当一个相机剔除这个图层中的图块时 phaser 会复用他,这里设置剔除检查填充的额外 tiles 数量。
        this.graphicLayer.setCullPadding(3, 3)

    }

    //  生成各种组(动态 sprite )
    createGroupFromObjects() {

        // 放会动的 sprite 组
        this.coinsGroup = this.add.group(null)
        this.coinsGroup.runChildUpdate = true
        this.arrowGroup = this.add.group(null)
        // this.arrowGroup.runChildUpdate = true


        // 出生点和结束点都只有一个,但他们都是在对象层中,所以创建出来还是一个数组
        // 设置出生点位置 BEGIN
        let startPointObjects = this.createFromObjectsWithProp(this.sys.scene, 'startPoint', "startPoint", {key: 'startPoint'})
        this.startPoint = {
            x: startPointObjects[0].x,
            y: startPointObjects[0].y,
        }
        startPointObjects[0].alpha = 0
        let endPointObjects = this.createFromObjectsWithProp(this.sys.scene, 'endPoint', "endPoint", {key: 'link'})
        this.endPointGroup = this.physics.add.staticGroup()
        this.transparentObjectsAddToGroup(endPointObjects, this.endPointGroup)
        // 出生点和结束点 END

        // 死亡空间
        let deadZoneObjects = this.createFromObjectsWithProp(this.sys.scene, "deadZone", "deadZone")
        this.deadZoneGroup = this.physics.add.staticGroup()
        this.transparentObjectsAddToGroup(deadZoneObjects, this.deadZoneGroup)

        // 地上的金币(福字)
        this.map.getObjectLayer('coins').objects.forEach((obj) => {
            let coin = new Coin({
                scene: this,
                x: obj.x + 35,
                y: obj.y + 35,
                // rotation:obj.rotation
            })
            this.coinsGroup.add(coin)
        })
        // 转角箭头,现在第二关还是用 arrowLayer
        this.map.getObjectLayer('arrow').objects.forEach((obj) => {
            let properties = {}
            if (obj.properties && obj.properties.length > 0) {
                for (let i in obj.properties) {
                    properties[obj.properties[i].name] = obj.properties[i].value
                }
            }
            let arrow = new Arrow({
                scene: this,
                x: obj.x + 90,
                y: obj.y + 90,
                properties,
            })
            this.arrowGroup.add(arrow)
        })

    }

    // 创建碰撞
    createCollision() {
        // this.graphicLayer.setCollision([79])
        //
        // this.physics.add.collider(this.player, this.graphicLayer, (player, tile) => {
        //     // log("player 在撞墙")
        // })

        this.physics.add.overlap(this.player, this.warningAreaGroup, (player, warningArea) => {
            log("player 要屎了")
            // player.die()
            player.overlapWithDeadZoneHandler(player, warningArea)  // 还在跳跃的时候不让他死
        })
        this.physics.add.overlap(this.player, this.deadZoneGroup, (player, deadZone) => {
            player.overlapWithDeadZoneHandler(player, deadZone)
        })
        this.physics.add.overlap(this.player, this.coinsGroup, (player, coin) => {
            // 后面的关卡得分更多
            this.score += (5 + this.curLevel * 5)
            $(".score").text(this.score)
            coin.destroy()
            !this.mute && this.coinMusic.play()
        })

        this.physics.add.overlap(this.player, this.endPointGroup, (player, endPoint) => {
            console.log("到达本关终点")
            // 通过了不进入下一关,一次只能一关
            // this.restartGame(endPoint, ~~this.curLevel + 1)

            if (this.gameover) return

            this.gameover = true
            this.gameOver("win")

        })
        this.physics.add.overlap(this.player, this.arrowGroup, (player, arrow) => {
            player.overlapWithArrow(player, arrow)
        })

    }

    // 为 createGroupFromObjects() 服务,createFromObjectsWithProp 已经计算了偏移
    transparentObjectsAddToGroup(objs, group) {
        objs.forEach((val, idx) => {
            val.alpha = 0   // 设置为透明
            group.add(val)
        })
    }

    createDebugDraw() {
        this.debugGraphics = this.add.graphics()
        // new Phaser.GameObjects.Graphics(this,{x:0, y:600}) //   无法使用???
        // this.debugGraphics.y = 600

        this.drawDebug()
        this.input.keyboard.on('keydown_U', (event) => {
            this.showDebug = !this.showDebug
            this.drawDebug()
        })
    }

    // 为 graphicLayer 绘制颜色
    drawDebug() {
        this.debugGraphics.clear()
        if (this.showDebug) {
            setTimeout(() => {
                this.graphicLayer.renderDebug(this.debugGraphics, {
                    tileColor: null, // Non-colliding tiles
                    collidingTileColor: new Phaser.Display.Color(254, 209, 16, 100), // Colliding tiles
                    // faceColor:  new Phaser.Display.Color(0, 0, 255, 50), // Colliding face edges
                })
            }, 1)
        }
        this.events.emit('drawDebugEvent', 1, 2)
    }

    //  一些 HUD 文本
    // updateText() {
    //     this.scoreText.setText("score :" + this.score)
    //
    //     this.debugText.pointPosition.setText("指针:" + ~~this.mousePosition.x + "," + ~~this.mousePosition.y)
    // }


    // 创建监听事件
    createListener() {
        this.mousePosition = {x: 0, y: 0,}
        //刷新 鼠标 的位置
        this.input.on('pointermove', (mouse) => {
            this.mousePosition.x = mouse.x + this.cameras.main.scrollX
            this.mousePosition.y = mouse.y + this.cameras.main.scrollY
        })

    }

    setCameraControl() {
        // camera 相关

        // 镜头背景色
        // this.cameras.main.setBackgroundColor(0xcccccc)

        // this.cameras.main.rotation = .7

        this.cameras.main.setZoom(0.4)
        // this.cameras.main.setAngle(40)


        this.cameras.main.setSize(window.innerWidth, window.innerHeight)
        // 设置边界
        // this.cameras.main.setBounds(0, 0, this.level.width, this.level.height)

        // 100 是摄像机垂直偏移,因为 startFollow 时如果跳跃就会让镜头也跟着晃动,
        // 设置为100使 player 偏向底部,同时摄像头有上边界,所以画面看起来不会移动

        this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0)

    }

    /**
     *  重启游戏(重启当前scene) 在到达本关终点时会重启当前 scene
     * @param endPoint  终点 sprite
     * @param startLevel    需要重启的关卡
     */
    restartGame(endPoint, startLevel) {
        // 暂停世界,防止移动
        this.scene.stop();
        this.sound.stopAll();
        // 判断是否正在倒计时,防止重复执行
        if (this.inCountingdown) return
        this.inCountingdown = true
        // 判断是否最后一关 (现在这一段不会执行,因为一次一关到终点直接显示游戏结果)
        if (endPoint && endPoint.properties && endPoint.properties.length > 0) {
            for (let i in endPoint.properties) {
                // 已经是最后一关,有设置 win 标识
                if (endPoint.properties[i].name === "win" && endPoint.properties[i].value === true) {
                    this.inCountingdown = false // 不关闭 gameOver 来执行 restartGame 就会被 return
                    this.gameOver("win")
                    console.log("已经是最后一关,有设置 win 标识")
                    return
                }
            }
        }
        // 重启需要使用的参数,场景 player 等
        let restartConfig = {
            scene: {
                // 暂时不用续关的方案,游戏结束必须重新选关
                // score: startLevel ? 0 : this.score,
                score: 0,
                // 有给的关卡就重启给定关卡,否则当前关卡 +1
                level: startLevel ? startLevel : window._curLevel,
                // level: 1, // 测试,一直在第一关
                mute: this.mute
            },
            player: {
                life: this.player.life
            }
        }
        log("restartConfig,", restartConfig)
        let _this = this
        window.pigLevelScene = null
        _this.player = null

        _this.scene.start('pigLevelScene', restartConfig)

        // 显示倒计时页面
        showCountingdownPage(function () {
            // 倒计时结束的回调
            window.pigLevelScene.player.resumeMove()
            _this.inCountingdown = false
        })
    }

    /**
     * @param condition 取值: lose || win
     */
    gameOver(condition) {

        this.scene.pause();

        this.sound.stopAll();   // 关闭声音

        console.log("游戏结束: " + this.score)

        // 临时修改!!!
        // 显示游戏结果的页面,dom
        showGameResult(condition, this.score)
    }

    // 一个 three.js 的插件,用于监控并实时修改数据
    createGUIMonit() {
        let gui;
        gui = new dat.GUI();
        let p1 = gui.addFolder('Pointer');
        p1.add(this.input + ~~this.mousePosition.x, 'x').listen();
        p1.add(this.input, 'y').listen();
        p1.open();
    }

    createMusic() {
        this.mute = this.gameConfig.scene.mute   // 是否静音
        this.coinMusic = this.sound.add("coinMusic")
        this.bgMusic = this.sound.add("bgMusic")
        this.jumpMusic = this.sound.add("jumpMusic")
        this.challengeFailureMusic = this.sound.add("challengeFailureMusic")

        // 判断圣诞DLC关卡,替换背景音乐
        if (this.curLevel === 7) {
            this.ChristmasBgMusic = this.sound.add("ChristmasBgMusic")
            this.bgMusic = this.ChristmasBgMusic
        }

        let musicSwitchDom = $("#music-switch")
        let _this = this
        // 根据游戏参数设定音乐按钮的样式
        if (this.mute) {
            musicSwitchDom.attr("class", "icon iconfont icon-audio-mute")
        } else {
            musicSwitchDom.attr("class", "icon iconfont icon-audiohigh")
        }

        // 如果有重启游戏场景,就需要先解绑点击事件
        musicSwitchDom.unbind('click').removeAttr('event').on("click", function () {
            if (musicSwitchDom.attr('class') === "icon iconfont icon-audiohigh") {
                _this.sound.pauseAll()   // 关闭声音
                _this.mute = true
                musicSwitchDom.attr("class", "icon iconfont icon-audio-mute")
            } else {
                // _this.sound.resumeAll()  // 如果重启场景前静音了,音乐就不会恢复
                _this.bgMusic.play({
                    loop: true
                })
                _this.mute = false
                musicSwitchDom.attr("class", "icon iconfont icon-audiohigh")
            }
        })

        !this.mute && this.bgMusic.play({
            loop: true
        })

    }

    // 去重,用以计算 tilelayer 中的 layer 数
    arrayDeweighting(arr) {
        let set = new Set(arr);
        return Array.from(set);
    }

    // 代替 this.map.createFromObjects
    createFromObjectsWithProp(scene, name, id, spriteConfig, customClass) {
        if (spriteConfig === undefined) spriteConfig = {}

        let objectLayer = scene.map.getObjectLayer(name);
        if (!objectLayer) {
            console.warn('Cannot create from object. Invalid objectgroup name given: ' + name);
            return;
        }

        let objects = objectLayer.objects;
        let sprites = [];

        for (let i = 0; i < objects.length; i++) {
            let found = false;
            let obj = objects[i];
            if (obj.gid !== undefined && typeof id === 'number' && obj.gid === id ||
                obj.id !== undefined && typeof id === 'number' && obj.id === id ||
                obj.name !== undefined && typeof id === 'string' && obj.name === id) {
                found = true;
            }
            if (found) {

                // 会直接把 properties 数组加到 config,变成 0:[] 的形式
                // let config = Object.assign(spriteConfig, obj.properties);

                let config = spriteConfig
                config.x = obj.x;
                config.y = obj.y;

                let sprite
                if (customClass !== undefined) {
                    sprite = new customClass(config)
                } else {
                    sprite = scene.make.sprite(config)
                }

                // 把 obj 的自定义属性添加到 sprite 上 TODO 浅拷贝
                sprite.properties = obj.properties

                sprite.name = obj.name;

                if (obj.width) {
                    sprite.displayWidth = obj.width;
                }
                if (obj.height) {
                    sprite.displayHeight = obj.height;
                }

                // Origin is (0, 1) in Tiled, so find the offset that matches the Sprite's origin.
                let offset = {
                    x: sprite.originX * sprite.displayWidth,
                    y: (sprite.originY - 1) * sprite.displayHeight
                };

                // obj 含有旋转,这两个函数不存在,先注释
                // If the object is rotated, then the origin offset also needs to be rotated.
                // if (obj.rotation) {
                //     let angle = DegToRad(obj.rotation);
                //     Rotate(offset, angle);
                //     sprite.rotation = angle;
                // }

                if (obj.flippedHorizontal !== undefined || obj.flippedVertical !== undefined) {
                    sprite.setFlip(obj.flippedHorizontal, obj.flippedVertical);
                }

                if (!obj.visible) {
                    sprite.visible = false;
                }

                sprite.setOrigin(0)
                sprite.width = sprite.width * sprite._scaleX
                sprite.height = sprite.height * sprite._scaleY

                sprites.push(sprite);
            }
        }

        return sprites;
    }

}