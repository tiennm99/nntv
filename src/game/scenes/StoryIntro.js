import Phaser from 'phaser';
import { getText } from '../localization';

export class StoryIntro extends Phaser.Scene {
    constructor() {
        super('StoryIntro');
        this.scrollSpeed = 1.5; // Pixels per frame - increased for smoother scrolling
        this.isScrollComplete = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a dark background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0, 0);

        // Add title at the top
        const title = this.add.text(width / 2, 100, getText('storyTitle'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);

        // Create a container for the scrolling text
        this.storyContainer = this.add.container(0, 0);

        // Add the story text
        const storyText = this.add.text(width / 2, 0, getText('storyText'), {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        });
        storyText.setOrigin(0.5, 0);

        // Add the text to the container
        this.storyContainer.add(storyText);

        // Position the text to start at the bottom of the screen (but visible)
        // This ensures it starts scrolling immediately
        this.storyContainer.y = height - 50;

        // Calculate the total height of the text
        this.totalTextHeight = storyText.height;

        // Add skip button
        const skipButton = this.add.rectangle(width - 100, height - 50, 150, 40, 0x444444);
        const skipText = this.add.text(width - 100, height - 50, getText('skip'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        skipText.setOrigin(0.5, 0.5);

        // Make skip button interactive
        skipButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => skipButton.fillColor = 0x666666)
            .on('pointerout', () => skipButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.startGame();
            });

        // Set a timer to start the game after the text has scrolled completely
        // Calculate how long it should take based on text height and scroll speed
        const scrollTime = (this.totalTextHeight + height) / this.scrollSpeed;
        this.time.delayedCall(scrollTime * 16.67, () => { // Convert frames to ms (60fps = 16.67ms per frame)
            if (!this.isScrollComplete) {
                this.isScrollComplete = true;
                this.startGame();
            }
        });
    }

    update() {
        // Scroll the text container upward
        if (!this.isScrollComplete) {
            this.storyContainer.y -= this.scrollSpeed;

            // Check if the text has scrolled completely off the screen
            if (this.storyContainer.y < -this.totalTextHeight) {
                this.isScrollComplete = true;
                this.startGame();
            }
        }
    }

    startGame() {
        // Only start the game once
        if (!this.hasStartedGame) {
            this.hasStartedGame = true;
            this.scene.start('Game', { level: 1, lives: 3 });
        }
    }
}
