export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, "fu");
        config.scene.physics.world.enable(this);
        this.scene = config.scene;

        this.scene.add.existing(this);  // 没这个就无法显示在scene
        this.scene.physics.world.enable(this);

        this.alive = true
        this.body.allowGravity = false
        this.anims.play("fu_anim", true)

        // 可以把金币翻转向自己,然而我不想去调地图啊 ಠ_ಠ
        // this.rotation = config.rotation
    }

    update() {

    }
}
