export default class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(config, gameConfig) {
        super(config.scene, config.x, config.y, "pigpig")

        this.scene = config.scene
        this.scene.add.existing(this)// 没这个就无法显示在scene
        this.scene.physics.world.enable(this)

        // this.setCollideWorldBounds(true) // 世界碰撞

        this.direction = "up"    // 初始方向,可能要在起点写配置
        this.nextDirection = "jump" // 点击,下一个方向

        this.setScale(0.8)
        this.directionX = 1 // 向右
        this.directionY = 1 // 向下
        // 后面关卡速度增加
        this.speed = 400 + this.scene.curLevel * 20
        this.tempSpeed = 0 // 临时,用来停止移动时保存当前速度
        this.jumpSpeed = 550
        this.alive = true
        this.isJumping = false
        this.dieAnimPlaying = false

        // 创建人物动画
        this.creatAnims()
        // 添加控制按键
        this.creatControls()

    }

    update(time, delta) {
        // Player alive
        if (this.alive) {

            // 控制移动
            if (this.direction === "right") {
                this.directionX = 1
                this.angle = 90
                this.anims.play("up", true)
                this.body.velocity.x = this.directionX * this.speed  // 自动移动
                this.body.velocity.y = 0

            } else if (this.direction === "left") {
                this.directionX = -1
                this.angle = 270
                this.anims.play("up", true)
                this.body.velocity.x = this.directionX * this.speed  // 自动移动
                this.body.velocity.y = 0

            } else if (this.direction === "up") {
                this.directionY = -1
                this.angle = 0
                this.anims.play("up", true)
                this.body.velocity.y = this.directionY * this.speed  // 自动移动
                this.body.velocity.x = 0
                this.body.angleA = 40
            } else if (this.direction === "down") {
                this.directionY = 1
                this.angle = 180
                this.anims.play("up", true)
                this.body.velocity.y = this.directionY * this.speed  // 自动移动
                this.body.velocity.x = 0
            }

        }
        // !this.alive
        else {
            this.die()
        }
    }

    creatAnims() {

        // player 动画
        this.scene.anims.create({
            key: "up",
            frames: this.scene.anims.generateFrameNumbers("pigpig", {start: 0, end: 6}),
            frameRate: 15,
            repeat: -1
        })
    }

    stopMove() {
        this.tempSpeed = this.speed
        this.speed = 0
    }

    resumeMove() {
        if (this.speed !== 0) {
            return
        } else {
            this.speed = this.tempSpeed
        }
    }

    // player 死亡,屏蔽移动
    async die() {

        // 暂停世界
        this.scene.scene.pause();

        // 关闭声音
        this.scene.sound.stopAll();
        !this.scene.mute && this.scene.challengeFailureMusic.play()


        //  没有判定,会重复执行动画

        if (!this.dieAnimPlaying) {
            this.dieAnimPlaying = true

            this.speed = 0
            // this.anims.play("die_anim")

            // 停止镜头跟随
            // this.scene.cameras.main.stopFollow()
            // 死亡动画 闪烁3下 结束游戏
            this.setTint(0xff0000)  // 变红
            await this.sleep(200)

            this.clearTint()
            await this.sleep(200)

            this.setTint(0xff0000)// 变红
            await this.sleep(200)

            this.clearTint()
            await this.sleep(200)

            this.setTint(0xff0000)// 变红
            // this.scene.cameras.main.fadeOut(400, 204, 185, 188);  // 镜头淡出

            await this.sleep(200)

            this.clearTint()
            await this.sleep(200)


            this.scene.gameOver("lose")

        }

    }

    sleep(duration) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, duration);
        });
    }

    // 先和箭头经过,改变 nextDirection,在点击屏幕后再把方向变成 nextDirection
    overlapWithArrow(player, arrow) {

        if (arrow.alreadyOver) return   // 已经经过了这个箭头就不再设置方向,防止把下一动作置为 jump
        arrow.alreadyOver = true
        this.scene.overCornerCount++  // 已经过的转角 +1
        this.speed += 10        // 每过一个路口,速度加 10
        log("现在速度: " + this.speed)
        if (arrow.properties && arrow.properties.direction) {
            // 如果拐角方向和现在运动的方向是一样的,那么就是跳跃
            if (arrow.properties.direction === this.direction) {
                this.nextDirection = "jump"
            } else {
                this.nextDirection = arrow.properties.direction // 设置player的下一个方向
            }
        }
    }

    // 跳过死亡空间
    overlapWithDeadZoneHandler(player, deadZone) {
        // 正在跳跃则不受伤
        if (this.isJumping) {
            return
        } else {
            this.die()
        }
    }

    isInWeixin() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    // 创建移动控制
    creatControls() {
        // 键盘控制,仅用于非微信的测试
        if (!this.isInWeixin()) {
            this.scene.input.keyboard.on("keydown_SPACE", (event) => {
                this.moveControl()
            })
            this.scene.input.keyboard.on("keydown_A", (event) => {
                this.turnLeft()
            })
            this.scene.input.keyboard.on("keydown_E", (event) => {
                this.turnRight()
            })
            this.scene.input.keyboard.on("keydown_COMMA", (event) => {
                this.turnUp()
            })
            this.scene.input.keyboard.on("keydown_O", (event) => {
                this.turnDown()
            })
        }


        //  触摸控制,屏幕按下直接开始移动
        this.scene.input.on('pointerdown', (pointer) => {
            this.moveControl()

        })
    }

    // 用于移动控制,点击和空格时触发
    moveControl() {

        log("应该旋转的转角数: " + this.scene.nextRotateCornerCount + "经过的转角数: " + this.scene.overCornerCount)

        // 当前的方向还没有改变,可以判断 Player 是左上还是右上
        // 应该旋转的转角数 === 经过的转角数
        if (this.scene.nextRotateCornerCount === this.scene.overCornerCount) {

            // 先让 下一个应该旋转的转角数 增加,如果是跳跃没有发生旋转,则把他减回去
            this.scene.nextRotateCornerCount += this.scene.rotateSpacing

            // 随机旋转角度
            let rotate = 0

            // 左 => 上,向右旋转
            if (this.direction === "left" && this.nextDirection === "up") {
                rotate = this.randomRotation()
                // 右 => 上,向左旋转
            } else if (this.direction === "right" && this.nextDirection === "up") {
                rotate = this.randomRotation() * -1
                // 上 => 左,向左旋转
            } else if (this.direction === "up" && this.nextDirection === "left") {
                rotate = this.randomRotation() * -1
            }   // 上 => 右,向右旋转
            else if (this.direction === "up" && this.nextDirection === "left") {
                rotate = this.randomRotation()
            }// 跳跃,不旋转
            // else if (this.nextDirection === "jump") {
            else {
                this.scene.nextRotateCornerCount -= this.scene.rotateSpacing  // ???
                this.scene.nextRotateCornerCount += 1
            }
            // 如果有旋转条件才旋转
            rotate && this.smoothRotateCamera(rotate)
        } else {

        }
        // 控制方向,当前的方向还是旧方向,执行完 switch 就会把当前方向变成 nextDirection
        switch (this.nextDirection) {
            case "left":
                this.turnLeft()
                break
            case "right":
                this.turnRight()
                break
            case "up":
                this.turnUp()
                break
            case "down":
                this.turnDown()
                break
            default:
                this.jump()
        }
        this.nextDirection = "jump"
    }

    // 用于平滑旋转摄像头
    smoothRotateCamera(rotate) {
        let numOfExcute = 12    // 需要执行的次数
        let timeOfExcute = 200  // 执行的时间
        let eachAdd = (rotate - this.scene.cameras.main.rotation) / numOfExcute // 每次角度增加的值

        const timer = setInterval(() => {
            numOfExcute--;
            if (numOfExcute) {
                this.scene.cameras.main.rotation += eachAdd
            } else {
                clearInterval(timer);
            }
        }, timeOfExcute / numOfExcute);
    }

    // 取旋转角度随机数 [0.1,0.7]
    randomRotation() {
        var max = 7
        var min = 1
        parseInt(Math.random() * (max - min + 1) + min, 10);
        return Math.floor(Math.random() * (max - min + 1) + min) / 10;
    }

    // 人物移动相关
    jump() {

        // 不允许在跳跃过程中跳跃
        if (this.isJumping === true) return

        // 跳跃声音
        !this.scene.mute && this.scene.jumpMusic.play()

        // let timeline = this.scene.tweens.createTimeline()
        this.isJumping = true
        let _speed = this.speed // 切换跳跃速度
        this.speed = this.jumpSpeed

        // 曲线救国法,把大小设置比原来小,缩小在跳跃时的判定距离,onComplete 再还原,
        //  新方法: 跳跃过程中不判定死亡,落地再判定
        // this.setSize(48,48)

        // 跳跃动画 BEGIN
        // 自动播放,无法创建后用 .play() 重复使用
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'ease-out',
            duration: 350,
            onComplete: (tween, targets) => {
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    ease: 'ease',
                    duration: 350,
                    onComplete: (tween, targets) => {
                        this.setScale(0.8)
                        this.isJumping = false
                        this.speed = _speed
                    }
                    // yoyo: true
                })
            }
            // yoyo: true
        })
        // 时间线动画,可以用 play() 重复使用
        // let timeline = this.scene.tweens.timeline({
        //     targets: this,
        //     ease: 'Power1',
        //     totalDuration: 800,
        //     tweens: [
        //         {
        //             scaleX: 0.8,
        //             scaleY:  0.8,
        //         },
        //         {
        //             // originWidth:16,
        //             // displayWidth:200,
        //             scaleX: 1.2,
        //             scaleY: 1.2,
        //         },
        //         {
        //             scaleX:  0.8,
        //             scaleY:  0.8,
        //         },
        //     ],
        //     onComplete: (tween) => {
        //         this.setScale(0.8)
        //         this.isJumping = false
        //         this.speed = _speed
        //     },
        // });
        // 跳跃动画   END
    }

    turnRight() {
        if (this.isJumping) return
        if (this.direction === "left") return   // 不允许反向
        this.direction = "right"
    }

    turnLeft() {
        if (this.isJumping) return
        if (this.direction === "right") return
        this.direction = "left"
    }

    turnUp() {
        if (this.isJumping) return
        if (this.direction === "down") return
        this.direction = "up"
    }

    turnDown() {
        if (this.isJumping) return
        if (this.direction === "up") return
        this.direction = "down"
    }
}