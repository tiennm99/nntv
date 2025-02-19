import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'nntv',
    description: 'Night Ninja: Twilight Voyage',
    parent: 'game-container',
    width: 1280,
    height: 720,
    pixelArt: false,
    scene: [
        Start
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}
new Phaser.Game(config);
            