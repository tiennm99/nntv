import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';

export class StoryIntro extends Phaser.Scene {
    constructor() {
        super('StoryIntro');
        this.scrollSpeed = 1.5;
        this.isScrollComplete = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.isScrollComplete = false;
        this.hasStartedGame = false;

        this.add.rectangle(0, 0, width, height, COLORS.bgDark).setOrigin(0, 0);

        this.add.text(width / 2, 100, getText('storyTitle'), {
            font: FONTS.title,
            fill: COLORS.textAccent,
            align: 'center',
        }).setOrigin(0.5, 0.5);

        this.storyContainer = this.add.container(0, 0);
        const storyText = this.add.text(width / 2, 0, getText('storyText'), {
            font: FONTS.body,
            fill: COLORS.textPrimary,
            align: 'center',
            wordWrap: { width: width * 0.8 },
        }).setOrigin(0.5, 0);
        this.storyContainer.add(storyText);
        this.storyContainer.y = height - 50;
        this.totalTextHeight = storyText.height;

        // Skip button
        createButton(this, width - 100, height - 50, getText('skip'), () => {
            this.startGame();
        }, 150, 40);

        const scrollTime = (this.totalTextHeight + height) / this.scrollSpeed;
        this.time.delayedCall(scrollTime * 16.67, () => {
            if (!this.isScrollComplete) {
                this.isScrollComplete = true;
                this.startGame();
            }
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    update() {
        if (!this.isScrollComplete) {
            this.storyContainer.y -= this.scrollSpeed;
            if (this.storyContainer.y < -this.totalTextHeight) {
                this.isScrollComplete = true;
                this.startGame();
            }
        }
    }

    startGame() {
        if (!this.hasStartedGame) {
            this.hasStartedGame = true;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('LevelIntro', { level: 1, lives: 3 });
            });
        }
    }
}
