// 主样式,toast 样式,iconfont
import "./css/style.less"
import "../src/lib/dialog.css"
import "../resource/iconfont/iconfont.css"

// 游戏场景
import preloadScene from "./scene/preloadScene"
import pigLevelScene from "./scene/pigLevelScene"

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    // type: Phaser.AUTO,
    type: Phaser.WEBGL,
    // pixelArt: true,
    roundPixels: true,
    parent: 'phaser-app',
    title: 'Phaser3 Mario',
    width: window.innerWidth,
    height: window.innerHeight,
    zoom: 1,
    resolution: window.devicePixelRatio,
    autoResize: true,
    transparent: true,
    // width: 3840,
    // height: 624,
    fps: 60,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            // debug: true // 调试开启 arcade sprite 会有边框提示
        }
    },

    scene: [
        preloadScene,
        pigLevelScene,
    ]
};

var game = new Phaser.Game(config);

// 引入操作dom的js

import "./js/js.js"