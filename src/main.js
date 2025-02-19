import { Menu } from './scenes/Menu.js';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'nntv',
    description: 'Night Ninja: Twilight Voyage',
    parent: 'game-container',
    width: 800,
    height: 600,
    pixelArt: false,
    scene: [Menu, Game],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
}
new Phaser.Game(config);
