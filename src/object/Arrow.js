export default class Arrow extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {

        let direct = 0
        switch (config.properties.direction) {
            case "left":
                direct = 0
                break
            case "up":
                direct = 1
                break
            case "down":
                direct = 2
                break
            case "right":
                direct = 3
                break
            default:
                console.error("箭头必须设置 direction 属性")
        }
        let level = config.scene.curLevel
        super(config.scene, config.x, config.y, "arrowSpritesheet", direct + 4 * (level - 1));


        config.scene.physics.world.enable(this);
        this.scene = config.scene;

        this.scene.add.existing(this);  // 没这个就无法显示在scene
        this.scene.physics.world.enable(this);

        this.properties = config.properties

        this.alive = true
        this.body.allowGravity = false
    }

    update() {

    }

}
