import Phaser from 'phaser';
import { getText, setLanguage, getLanguage } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';

export class Settings extends Phaser.Scene {
    constructor() {
        super('Settings');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        const title = this.add.text(width / 2, height / 4, getText('settings'), {
            font: FONTS.title,
            fill: COLORS.textTitle,
            align: 'center',
        });
        title.setOrigin(0.5, 0.5);

        this.add.text(width / 2, height / 2 - 50, getText('languageSettings'), {
            font: FONTS.body,
            fill: COLORS.textSecondary,
        }).setOrigin(0.5, 0.5);

        const currentLanguage = getLanguage();

        const enBtn = createButton(this, width / 2 - 120, height / 2 + 10, getText('english'), () => {
            this.changeLanguage('en');
        }, 200, 46);
        if (currentLanguage === 'en') enBtn.bg.fillColor = COLORS.btnHover;

        const viBtn = createButton(this, width / 2 + 120, height / 2 + 10, getText('vietnamese'), () => {
            this.changeLanguage('vi');
        }, 200, 46);
        if (currentLanguage === 'vi') viBtn.bg.fillColor = COLORS.btnHover;

        createButton(this, width / 2, height / 2 + 100, getText('back'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    changeLanguage(language) {
        if (getLanguage() !== language) {
            setLanguage(language);
            this.scene.restart();
        }
    }
}
