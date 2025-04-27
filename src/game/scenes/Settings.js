import Phaser from 'phaser';
import { getText, setLanguage, getLanguage } from '../localization';

export class Settings extends Phaser.Scene {
    constructor() {
        super('Settings');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add settings title
        const title = this.add.text(width / 2, height / 4, getText('settings'), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        title.setOrigin(0.5, 0.5);

        // Add language settings label
        const languageLabel = this.add.text(width / 2, height / 2 - 50, getText('languageSettings'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        languageLabel.setOrigin(0.5, 0.5);

        // Add language options
        const currentLanguage = getLanguage();

        // English button
        const englishButton = this.add.rectangle(width / 2 - 80, height / 2, 150, 50,
            currentLanguage === 'en' ? 0x666666 : 0x444444);
        const englishText = this.add.text(width / 2 - 80, height / 2, getText('english'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        englishText.setOrigin(0.5, 0.5);

        // Vietnamese button
        const vietnameseButton = this.add.rectangle(width / 2 + 80, height / 2, 150, 50,
            currentLanguage === 'vi' ? 0x666666 : 0x444444);
        const vietnameseText = this.add.text(width / 2 + 80, height / 2, getText('vietnamese'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        vietnameseText.setOrigin(0.5, 0.5);

        // Back button
        const backButton = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x444444);
        const backText = this.add.text(width / 2, height / 2 + 100, getText('back'), {
            font: '24px Arial',
            fill: '#ffffff'
        });
        backText.setOrigin(0.5, 0.5);

        // Make buttons interactive
        englishButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (currentLanguage !== 'en') englishButton.fillColor = 0x555555;
            })
            .on('pointerout', () => {
                if (currentLanguage !== 'en') englishButton.fillColor = 0x444444;
            })
            .on('pointerdown', () => {
                this.changeLanguage('en');
            });

        vietnameseButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (currentLanguage !== 'vi') vietnameseButton.fillColor = 0x555555;
            })
            .on('pointerout', () => {
                if (currentLanguage !== 'vi') vietnameseButton.fillColor = 0x444444;
            })
            .on('pointerdown', () => {
                this.changeLanguage('vi');
            });

        backButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.fillColor = 0x666666)
            .on('pointerout', () => backButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });

        // Store UI elements that need to be updated when language changes
        this.uiElements = {
            title,
            languageLabel,
            englishText,
            vietnameseText,
            backText,
            englishButton,
            vietnameseButton
        };
    }

    changeLanguage(language) {
        // Only update if the language actually changed
        if (getLanguage() !== language) {
            setLanguage(language);
            this.updateUIText();

            // Update button colors
            this.uiElements.englishButton.fillColor = language === 'en' ? 0x666666 : 0x444444;
            this.uiElements.vietnameseButton.fillColor = language === 'vi' ? 0x666666 : 0x444444;
        }
    }

    updateUIText() {
        // Update all text elements with the new language
        this.uiElements.title.setText(getText('settings'));
        this.uiElements.languageLabel.setText(getText('languageSettings'));
        this.uiElements.englishText.setText(getText('english'));
        this.uiElements.vietnameseText.setText(getText('vietnamese'));
        this.uiElements.backText.setText(getText('back'));
    }
}
