import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';

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

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        const isEnd = this.isLastLevel;
        const titleText = isEnd ? getText('theEnd') : getText('gameOver');
        const descText = isEnd ? getText('ninjaFailed') : getText('caughtInLight');

        this.add.text(width / 2, height / 3, titleText, {
            font: 'bold 48px Arial',
            fill: isEnd ? COLORS.textAccent : COLORS.textDanger,
            align: 'center',
            wordWrap: { width: width * 0.8 },
        }).setOrigin(0.5, 0.5);

        this.add.text(width / 2, height / 2, descText, {
            font: FONTS.body,
            fill: COLORS.textSecondary,
            align: 'center',
            wordWrap: { width: width * 0.7 },
        }).setOrigin(0.5, 0.5);

        createButton(this, width / 2, height * 0.7, getText('tryAgain'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (this.isLastLevel) {
                    this.scene.start('MainMenu');
                } else {
                    this.scene.start('Game', { level: this.finalLevel, lives: 3 });
                }
            });
        });

        createButton(this, width / 2, height * 0.8, getText('mainMenu'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
