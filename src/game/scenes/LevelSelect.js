import Phaser from 'phaser';
import { getText } from '../localization';

export class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
        this.totalLevels = 12;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add title
        const title = this.add.text(width / 2, 50, getText('levelSelectTitle'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);

        // Create level buttons
        const buttonSize = 70;
        const padding = 20;
        const buttonsPerRow = 4;
        const startX = width / 2 - ((buttonsPerRow - 1) * (buttonSize + padding)) / 2;
        const startY = 150;

        for (let i = 0; i < this.totalLevels; i++) {
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;

            const x = startX + col * (buttonSize + padding);
            const y = startY + row * (buttonSize + padding);

            // Create button
            const levelButton = this.add.rectangle(x, y, buttonSize, buttonSize, 0x444444);
            const levelText = this.add.text(x, y, `${i + 1}`, {
                font: '24px Arial',
                fill: '#ffffff'
            });
            levelText.setOrigin(0.5, 0.5);

            // Make button interactive
            levelButton.setInteractive({ useHandCursor: true })
                .on('pointerover', () => levelButton.fillColor = 0x666666)
                .on('pointerout', () => levelButton.fillColor = 0x444444)
                .on('pointerdown', () => {
                    this.scene.start('Game', { level: i + 1, lives: 3 });
                });
        }

        // Add back button
        const backButton = this.add.rectangle(width / 2, height - 70, 200, 50, 0x444444);
        const backText = this.add.text(width / 2, height - 70, getText('back'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        backText.setOrigin(0.5, 0.5);

        // Make back button interactive
        backButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.fillColor = 0x666666)
            .on('pointerout', () => backButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
    }
}
