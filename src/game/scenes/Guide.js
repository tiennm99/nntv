import Phaser from 'phaser';
import { getText } from '../localization';
import { COLORS, FONTS, createButton } from '../theme';

export class Guide extends Phaser.Scene {
    constructor() {
        super('Guide');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark);

        // Scrollable guide area
        const guideAreaY = 20;
        const guideAreaHeight = height - 120;

        const guideContainer = this.add.container(0, 0);

        let y = guideAreaY;
        const spacing = 20;

        const title = this.add.text(width / 2, y + 30, getText('guideTitle'), {
            font: FONTS.title,
            fill: COLORS.textTitle,
            align: 'center',
        }).setOrigin(0.5, 0.5);
        guideContainer.add(title);
        y += 60;

        // Helper to add a section
        const addSection = (titleKey, contentKey) => {
            const sTitle = this.add.text(width / 2, y, getText(titleKey), {
                font: FONTS.heading,
                fill: COLORS.textAccent,
                align: 'center',
            }).setOrigin(0.5, 0.5);
            guideContainer.add(sTitle);
            y += 40;

            const sContent = this.add.text(width / 2, y, getText(contentKey), {
                font: FONTS.small,
                fill: COLORS.textSecondary,
                align: 'left',
                wordWrap: { width: width - 100 },
            }).setOrigin(0.5, 0);
            guideContainer.add(sContent);
            y += sContent.height + spacing;
        };

        addSection('levelObjectives', 'levelObjectivesContent');
        addSection('movementControls', 'movementControlsContent');
        addSection('enemyTypes', 'enemyTypesContent');

        // Mask for scroll area
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, guideAreaY, width, guideAreaHeight);
        guideContainer.setMask(maskShape.createGeometryMask());

        // Scroll with mouse wheel and keyboard
        const maxScrollUp = guideAreaY - (y - guideAreaHeight);
        this.input.on('wheel', (_p, _go, _dx, deltaY) => {
            guideContainer.y = Phaser.Math.Clamp(
                guideContainer.y - deltaY * 0.5, maxScrollUp, guideAreaY
            );
        });
        this.input.keyboard.on('keydown-UP', () => {
            guideContainer.y = Phaser.Math.Clamp(guideContainer.y + 30, maxScrollUp, guideAreaY);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
            guideContainer.y = Phaser.Math.Clamp(guideContainer.y - 30, maxScrollUp, guideAreaY);
        });

        createButton(this, width / 2, height - 50, getText('back'), () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
