import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dark background
        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        // Subtle starfield decoration
        for (let i = 0; i < 40; i++) {
            const sx = Phaser.Math.Between(0, width);
            const sy = Phaser.Math.Between(0, height);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.5);
            const size = Phaser.Math.Between(1, 2);
            this.add.circle(sx, sy, size, 0xffffff, alpha);
        }

        // Title
        const title = this.add.text(width / 2, height / 5, getText('gameTitle'), {
            font: FONTS.title,
            fill: COLORS.textTitle,
            align: 'center',
        });
        title.setOrigin(0.5, 0.5);

        // Ninja icon with glow
        this.add.circle(width / 2, height / 5 + 70, 24, COLORS.btnBorder, 0.3);
        this.add.circle(width / 2, height / 5 + 70, 18, COLORS.player);

        // Menu buttons
        const btnY = height / 2 + 20;
        const gap = 62;

        createButton(this, width / 2, btnY, getText('startGame'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('StoryIntro');
            });
        });

        createButton(this, width / 2, btnY + gap, getText('levelSelect'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('LevelSelect');
            });
        });

        createButton(this, width / 2, btnY + gap * 2, getText('guide'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Guide');
            });
        });

        createButton(this, width / 2, btnY + gap * 3, getText('settings'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Settings');
            });
        });

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
