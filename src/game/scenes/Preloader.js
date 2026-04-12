import Phaser from 'phaser';
import { COLORS } from '../theme';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        const progressBox = this.add.graphics();
        progressBox.fillStyle(COLORS.bgPanel, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        const progressBar = this.add.graphics();

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: COLORS.textPrimary,
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(COLORS.btnBorder, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.scene.start('MainMenu');
    }
}
