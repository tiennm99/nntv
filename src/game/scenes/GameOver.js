import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.finalLevel = data.level || 1;
        this.isLastLevel = data.isLastLevel || false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Different message based on whether this is the final level or not
        let message = 'GAME OVER';
        let description = 'You were caught in the light!';
        
        if (this.isLastLevel) {
            message = 'THE END';
            description = 'Thật tiếc, kiếp này ninja không thể giải cứu công chúa rồi.';
        }
        
        // Add game over title
        const title = this.add.text(width / 2, height / 3, message, {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);
        
        // Add description
        const descText = this.add.text(width / 2, height / 2, description, {
            font: '24px Arial',
            fill: '#cccccc',
            align: 'center'
        });
        descText.setOrigin(0.5, 0.5);
        
        // Add restart button
        const restartButton = this.add.rectangle(width / 2, height * 0.7, 200, 50, 0x444444);
        const restartText = this.add.text(width / 2, height * 0.7, 'TRY AGAIN', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        restartText.setOrigin(0.5, 0.5);
        
        // Make button interactive
        restartButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartButton.fillColor = 0x666666)
            .on('pointerout', () => restartButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                if (this.isLastLevel) {
                    // If it was the last level, go back to main menu
                    this.scene.start('MainMenu');
                } else {
                    // Otherwise restart the current level
                    this.scene.start('Game', { level: this.finalLevel, lives: 3 });
                }
            });
            
        // Add main menu button
        const menuButton = this.add.rectangle(width / 2, height * 0.8, 200, 50, 0x444444);
        const menuText = this.add.text(width / 2, height * 0.8, 'MAIN MENU', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        menuText.setOrigin(0.5, 0.5);
        
        // Make button interactive
        menuButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => menuButton.fillColor = 0x666666)
            .on('pointerout', () => menuButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
    }
}
