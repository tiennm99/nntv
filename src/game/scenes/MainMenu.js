import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add game title
        const title = this.add.text(width / 2, height / 4, 'NIGHT NINJA: TWILIGHT VOYAGE', {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);
        
        // Add ninja icon
        const ninjaCircle = this.add.circle(width / 2, height / 2 - 50, 30, 0x000000);
        
        // Add start button
        const startButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 50, 0x444444);
        const startText = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        startText.setOrigin(0.5, 0.5);
        
        // Add level select button
        const levelButton = this.add.rectangle(width / 2, height / 2 + 120, 200, 50, 0x444444);
        const levelText = this.add.text(width / 2, height / 2 + 120, 'LEVEL SELECT', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        levelText.setOrigin(0.5, 0.5);
        
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
            
        // Add game description
        const description = this.add.text(width / 2, height * 0.8, 
            'Guide the ninja through the shadows.\nAvoid light at all costs.\nRescue the princess... if you can.', {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'center'
        });
        description.setOrigin(0.5, 0.5);
        
        // Add instructions
        const instructions = this.add.text(width / 2, height * 0.9, 
            'Use arrow keys, WASD, or tap to move.', {
            font: '16px Arial',
            fill: '#aaaaaa',
            align: 'center'
        });
        instructions.setOrigin(0.5, 0.5);
    }
}
