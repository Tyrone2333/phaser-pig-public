export default class Preload extends Phaser.Scene {
    constructor() {
        super({
            key: 'Preload'
        })
    }

    preload() {
        // 带 object 的 pig 关卡,无需全部加载
        // for (let i = 1 i <= window._maxLevel i++) {
        //     this.load.tilemapTiledJSON(`level${i}pigTilemap`, `../resource/maps/level${i}-pigTilemap.json`)
        // }
        // 那只猪
        this.load.spritesheet("pigpig", '../resource/image/pigpig.png', {frameWidth: 120, frameHeight: 187})

        // pig 地图 背景资源
        this.load.image("pigtilemap_tileset", "../resource/image/pigtilemap_tileset.png")

        // 地图的 tileset,这里用于箭头
        this.load.spritesheet('arrowSpritesheet', '../resource/image/arrow.png', {frameWidth: 180, frameHeight: 180})

        // 福字
        this.load.spritesheet('fu', '../resource/image/fu.png', {frameWidth: 70, frameHeight: 70})

        // 声音文件
        this.load.audio('bgMusic', '../resource/audio/bgMusic.mp3')
        this.load.audio('coinMusic', '../resource/audio/coinSound.mp3')
        // 这个跳跃的声音戴耳机听会有些刺耳
        this.load.audio('jumpMusic', '../resource/audio/jumpMusic.mp3')
        this.load.audio('challengeFailureMusic', '../resource/audio/challengeFailureMusic.mp3')

        // set callback for loading progress updates
        this.load.on('progress', this.onProgress, this)
        // this.load.on('fileprogress', this.onFileProgress, this)
        this.load.on('complete', function () {
            console.log("preloadScene 预加载完成")
        })
    }

    create() {
        let _this = this

        // 创建动画
        this.createAnims()

        // 等资源都加载完了再显示新手引导
        $(".guide").css("visibility", "visible")

        // 把当前的 scene 挂载到 window
        window.preloadScene = this
        console.log("已把当前的 preloadScene 挂载到 window")
    }

    createAnims() {
        // 硬币旋转
        this.anims.create({
            key: "fu_anim",
            frames: this.anims.generateFrameNumbers("fu", {start: 0, end: 0}),
            frameRate: 1,
            repeat: -1
        })
        // 箭头动画
        this.anims.create({
            key: "arrowLeft_anim",
            frames: this.anims.generateFrameNumbers("mapSpritesheet", {start: 0, end: 0}),
            frameRate: 1,
            repeat: -1
        })
    }

    onProgress(value) {
        console.log("preloadScene 加载进度: " + value)
    }

    onFileProgress(file) {
        // debugger
        console.log('正在加载: ' + file.src)
    }
}
