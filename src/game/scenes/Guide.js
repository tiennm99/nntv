import Phaser from 'phaser';
import { getText } from '../localization';

export class Guide extends Phaser.Scene {
    constructor() {
        super('Guide');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Vùng hiển thị hướng dẫn (không bao gồm nút Back)
        const guideAreaY = 20;
        const guideAreaHeight = height - 120;

        // Tạo một container cho toàn bộ nội dung hướng dẫn
        const guideContainer = this.add.container(0, 0);

        // Tạo các text và thêm vào container
        let y = guideAreaY;
        const spacing = 20;

        // Title
        const title = this.add.text(width / 2, y + 30, getText('guideTitle'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);
        guideContainer.add(title);
        y += 60;

        // Level objectives
        const objectivesTitle = this.add.text(width / 2, y, getText('levelObjectives'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        objectivesTitle.setOrigin(0.5, 0.5);
        guideContainer.add(objectivesTitle);
        y += 40;

        const objectivesContent = this.add.text(width / 2, y, getText('levelObjectivesContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        objectivesContent.setOrigin(0.5, 0);
        guideContainer.add(objectivesContent);
        y += objectivesContent.height + spacing;

        // Movement controls
        const controlsTitle = this.add.text(width / 2, y, getText('movementControls'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        controlsTitle.setOrigin(0.5, 0.5);
        guideContainer.add(controlsTitle);
        y += 40;

        const controlsContent = this.add.text(width / 2, y, getText('movementControlsContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        controlsContent.setOrigin(0.5, 0);
        guideContainer.add(controlsContent);
        y += controlsContent.height + spacing;

        // Enemy types
        const enemiesTitle = this.add.text(width / 2, y, getText('enemyTypes'), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        enemiesTitle.setOrigin(0.5, 0.5);
        guideContainer.add(enemiesTitle);
        y += 40;

        const enemiesContent = this.add.text(width / 2, y, getText('enemyTypesContent'), {
            font: '18px Arial',
            fill: '#cccccc',
            align: 'left',
            wordWrap: { width: width - 100 }
        });
        enemiesContent.setOrigin(0.5, 0);
        guideContainer.add(enemiesContent);
        y += enemiesContent.height + spacing;

        // Vị trí ban đầu của container
        guideContainer.y = guideAreaY;

        // Thêm vùng che (mask) để chỉ hiển thị trong vùng hướng dẫn
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, guideAreaY, width, guideAreaHeight);
        const mask = maskShape.createGeometryMask();
        guideContainer.setMask(mask);

        // Logic cuộn: bằng con lăn chuột hoặc phím mũi tên
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            guideContainer.y -= deltaY * 0.5;
            // Giới hạn cuộn
            guideContainer.y = Phaser.Math.Clamp(
                guideContainer.y,
                guideAreaY - (y - guideAreaHeight), // tối đa cuộn lên
                guideAreaY // tối đa cuộn xuống
            );
        });

        this.input.keyboard.on('keydown-UP', () => {
            guideContainer.y = Phaser.Math.Clamp(guideContainer.y + 30, guideAreaY - (y - guideAreaHeight), guideAreaY);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
            guideContainer.y = Phaser.Math.Clamp(guideContainer.y - 30, guideAreaY - (y - guideAreaHeight), guideAreaY);
        });

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
