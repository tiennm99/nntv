import Phaser from 'phaser';
import { getText } from '../localization';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add game title
        const title = this.add.text(width / 2, height / 4, getText('gameTitle'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);

        // Add ninja icon
        const ninjaCircle = this.add.circle(width / 2, height / 2 - 50, 30, 0x000000);

        // Add start button
        const startButton = this.add.rectangle(width / 2, height / 2 + 20, 200, 50, 0x444444);
        const startText = this.add.text(width / 2, height / 2 + 20, getText('startGame'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        startText.setOrigin(0.5, 0.5);

        // Add level select button
        const levelButton = this.add.rectangle(width / 2, height / 2 + 80, 200, 50, 0x444444);
        const levelText = this.add.text(width / 2, height / 2 + 80, getText('levelSelect'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        levelText.setOrigin(0.5, 0.5);

        // Add guide button
        const guideButton = this.add.rectangle(width / 2, height / 2 + 140, 200, 50, 0x444444);
        const guideText = this.add.text(width / 2, height / 2 + 140, getText('guide'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        guideText.setOrigin(0.5, 0.5);

        // Add settings button
        const settingsButton = this.add.rectangle(width / 2, height / 2 + 200, 200, 50, 0x444444);
        const settingsText = this.add.text(width / 2, height / 2 + 200, getText('settings'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        settingsText.setOrigin(0.5, 0.5);

        // Make buttons interactive
        startButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => startButton.fillColor = 0x666666)
            .on('pointerout', () => startButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('Game', { level: 1, lives: 3 });
            });

        levelButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => levelButton.fillColor = 0x666666)
            .on('pointerout', () => levelButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('LevelSelect');
            });

        guideButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => guideButton.fillColor = 0x666666)
            .on('pointerout', () => guideButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('Guide');
            });

        settingsButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => settingsButton.fillColor = 0x666666)
            .on('pointerout', () => settingsButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('Settings');
            });

        // Add game description
        const description = this.add.text(width / 2, height * 0.8,
            getText('gameDescription'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'center'
        });
        description.setOrigin(0.5, 0.5);

        // Add instructions
        const instructions = this.add.text(width / 2, height * 0.9,
            getText('instructions'), {
            font: '16px Arial',
            fill: '#aaaaaa',
            align: 'center'
        });
        instructions.setOrigin(0.5, 0.5);
    }
}
