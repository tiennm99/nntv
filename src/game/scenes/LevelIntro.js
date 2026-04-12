import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';
import { LEVELS } from '../levels/Levels';

export class LevelIntro extends Phaser.Scene {
    constructor() {
        super('LevelIntro');
    }

    init(data) {
        this.level = data.level || 1;
        this.lives = data.lives || 3;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        const levelData = LEVELS[this.level - 1];
        const levelName = levelData ? levelData.name : `Level ${this.level}`;
        const storyKey = levelData ? levelData.storyKey : null;
        const storyText = storyKey ? getText(storyKey) : '';

        // Level number
        this.add.text(width / 2, height / 4, `${getText('level')}${this.level}`, {
            font: FONTS.small,
            fill: COLORS.textSecondary,
        }).setOrigin(0.5, 0.5);

        // Level name
        this.add.text(width / 2, height / 4 + 40, levelName, {
            font: FONTS.title,
            fill: COLORS.textTitle,
            align: 'center',
        }).setOrigin(0.5, 0.5);

        // Story text
        if (storyText) {
            this.add.text(width / 2, height / 2, storyText, {
                font: FONTS.body,
                fill: COLORS.textPrimary,
                align: 'center',
                wordWrap: { width: width * 0.7 },
                lineSpacing: 6,
            }).setOrigin(0.5, 0.5);
        }

        // Continue button
        createButton(this, width / 2, height * 0.78, getText('continue'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game', { level: this.level, lives: this.lives });
            });
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
