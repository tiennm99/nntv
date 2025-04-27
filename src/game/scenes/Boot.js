import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load any assets needed for the preloader scene
        // For this game, we don't need any fancy preloader assets
    }

    create() {
        this.scene.start('Preloader');
    }
}
