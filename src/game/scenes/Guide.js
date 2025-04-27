import Phaser from 'phaser';
import { getText } from '../localization';

export class Guide extends Phaser.Scene {
    constructor() {
        super('Guide');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add title
        const title = this.add.text(width / 2, 50, getText('guideTitle'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);

        // Add level objectives section
        const objectivesTitle = this.add.text(width / 2, 120, getText('levelObjectives'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        objectivesTitle.setOrigin(0.5, 0.5);

        const objectivesContent = this.add.text(width / 2, 180, getText('levelObjectivesContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        objectivesContent.setOrigin(0.5, 0);

        // Add movement controls section
        const controlsTitle = this.add.text(width / 2, 300, getText('movementControls'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        controlsTitle.setOrigin(0.5, 0.5);

        const controlsContent = this.add.text(width / 2, 360, getText('movementControlsContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        controlsContent.setOrigin(0.5, 0);

        // Add enemy types section
        const enemiesTitle = this.add.text(width / 2, 480, getText('enemyTypes'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        enemiesTitle.setOrigin(0.5, 0.5);

        const enemiesContent = this.add.text(width / 2, 540, getText('enemyTypesContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        enemiesContent.setOrigin(0.5, 0);

        // Add back button
        const backButton = this.add.rectangle(width / 2, height - 50, 200, 50, 0x444444);
        const backText = this.add.text(width / 2, height - 50, getText('back'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        backText.setOrigin(0.5, 0.5);

        // Make back button interactive
        backButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.fillColor = 0x666666)
            .on('pointerout', () => backButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
    }
}
