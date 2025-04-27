import Phaser from 'phaser';
import { initLanguage } from '../localization';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load any assets needed for the preloader scene
        // For this game, we don't need any fancy preloader assets

        // Initialize language settings
        initLanguage();
    }

    create() {
        this.scene.start('Preloader');
    }
}
