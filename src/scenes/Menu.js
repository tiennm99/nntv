export class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.addButtons();
  }

  addButtons() {
    const CONTINUE_BUTTON_X = 400; // Center horizontally
    const CONTINUE_BUTTON_Y = 250;
    const NEW_GAME_BUTTON_X = 400; // Center horizontally
    const NEW_GAME_BUTTON_Y = CONTINUE_BUTTON_Y + 80;
    const SETTINGS_BUTTON_X = 400; // Center horizontally
    const SETTINGS_BUTTON_Y = NEW_GAME_BUTTON_Y + 80;
    const HELP_BUTTON_X = 400; // Center horizontally
    const HELP_BUTTON_Y = SETTINGS_BUTTON_Y + 80;

    this.createButton('Tiếp tục', CONTINUE_BUTTON_X, CONTINUE_BUTTON_Y, () => this.startGame());
    this.createButton('Chơi mới', NEW_GAME_BUTTON_X, NEW_GAME_BUTTON_Y, () => this.newGame());
    this.createButton('Cài đặt', SETTINGS_BUTTON_X, SETTINGS_BUTTON_Y, () => this.openSettings());
    this.createButton('Trợ giúp', HELP_BUTTON_X, HELP_BUTTON_Y, () => this.openHelp());
  }

  createButton(text, x, y, callback) {
    const button = this.add.rectangle(x, y, 200, 50, 0xffffff).setInteractive()
      .on('pointerdown', callback)
      .on('pointerover', () => button.fillColor = 0xff3333)
      .on('pointerout', () => button.fillColor = 0xffffff);

    const textObject = this.add.text(x, y, text, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
    return button;
  }

  startGame() {
    console.log('Tiếp tục trò chơi');
  }

  newGame() {
    this.scene.start('Game');
  }

  openSettings() {
    console.log('Mở cài đặt');
  }

  openHelp() {
    console.log('Mở trợ giúp');
  }
}
