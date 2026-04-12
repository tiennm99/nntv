import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';
import { getProgress } from '../progress';

export class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
        this.totalLevels = 12;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progress = getProgress();

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        this.add.text(width / 2, 50, getText('levelSelectTitle'), {
            font: FONTS.title,
            fill: COLORS.textTitle,
            align: 'center',
        }).setOrigin(0.5, 0.5);

        // Level grid
        const buttonSize = 70;
        const padding = 20;
        const buttonsPerRow = 4;
        const startX = width / 2 - ((buttonsPerRow - 1) * (buttonSize + padding)) / 2;
        const startY = 140;

        for (let i = 0; i < this.totalLevels; i++) {
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            const x = startX + col * (buttonSize + padding);
            const y = startY + row * (buttonSize + padding);
            const levelNum = i + 1;
            const isUnlocked = levelNum <= progress.maxLevel;
            const isCompleted = progress.completedLevels.includes(levelNum);

            // Border (green for completed, purple for unlocked, dim for locked)
            const borderColor = isCompleted ? COLORS.gridGoal : isUnlocked ? COLORS.btnBorder : 0x333344;
            this.add.rectangle(x, y, buttonSize + 4, buttonSize + 4, borderColor);

            const bgColor = isUnlocked ? COLORS.btnDefault : 0x111122;
            const btn = this.add.rectangle(x, y, buttonSize, buttonSize, bgColor);

            const textColor = isUnlocked ? COLORS.textPrimary : '#555566';
            const label = this.add.text(x, y, `${levelNum}`, {
                font: FONTS.button,
                fill: textColor,
            }).setOrigin(0.5, 0.5);

            // Completed checkmark
            if (isCompleted) {
                this.add.text(x + 22, y - 22, '\u2713', {
                    font: '14px Arial',
                    fill: '#00c853',
                }).setOrigin(0.5, 0.5);
            }

            if (isUnlocked) {
                btn.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => btn.fillColor = COLORS.btnHover)
                    .on('pointerout', () => btn.fillColor = COLORS.btnDefault)
                    .on('pointerdown', () => {
                        this.cameras.main.fadeOut(300, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('LevelIntro', { level: levelNum, lives: 3 });
                        });
                    });
            }
        }

        createButton(this, width / 2, height - 70, getText('back'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
