export class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  init() {
  }

  preload() {
  }

  create() {
    this.createButton('Tiếp tục', 100, 100, () => this.startGame());
    this.createButton('Chơi mới', 100, 200, () => this.newGame());
    this.createButton('Cài đặt', 100, 300, () => this.openSettings());
    this.createButton('Trợ giúp', 100, 400, () => this.openHelp());
  }

  createButton(text, x, y, callback) {
    const button = this.add.text(x, y, text, { fontSize: '32px', fill: '#fff' })
      .setInteractive()
      .on('pointerdown', callback);
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
