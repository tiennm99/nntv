export class Game extends Phaser.Scene {
  constructor() {
      super('Game');
      this.player = null;
      this.cursors = null;
      this.wasd = null;
      this.buttons = {};
  }

  create() {
      // Set white background
      this.cameras.main.setBackgroundColor('#ffffff');

      // Create player
      this.player = this.add.circle(400, 300, 20, 0x000000);

      // Enable physics on player
      this.physics.add.existing(this.player);

      // Set up keyboard controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D
      });

      // Create on-screen buttons
      this.createButtons();
  }

  createButtons() {
      const buttonSize = 50;
      const buttonColor = 0xaa00ff;

      // Create up button
      this.buttons.up = this.add.rectangle(700, 500 - buttonSize, buttonSize, buttonSize, buttonColor).setInteractive();
      this.buttons.up.on('pointerdown', () => this.movePlayer('up'));

      // Create down button
      this.buttons.down = this.add.rectangle(700, 500 + buttonSize, buttonSize, buttonSize, buttonColor).setInteractive();
      this.buttons.down.on('pointerdown', () => this.movePlayer('down'));

      // Create left button
      this.buttons.left = this.add.rectangle(700 - buttonSize, 500, buttonSize, buttonSize, buttonColor).setInteractive();
      this.buttons.left.on('pointerdown', () => this.movePlayer('left'));

      // Create right button
      this.buttons.right = this.add.rectangle(700 + buttonSize, 500, buttonSize, buttonSize, buttonColor).setInteractive();
      this.buttons.right.on('pointerdown', () => this.movePlayer('right'));
  }

  movePlayer(direction) {
      const speed = 200;
      const playerBody = this.player.body;

      switch (direction) {
          case 'up':
              playerBody.setVelocityY(-speed);
              break;
          case 'down':
              playerBody.setVelocityY(speed);
              break;
          case 'left':
              playerBody.setVelocityX(-speed);
              break;
          case 'right':
              playerBody.setVelocityX(speed);
              break;
      }
  }

  update() {
      const speed = 200;
      const playerBody = this.player.body;

      // Reset velocity
      playerBody.setVelocity(0);

      // Handle horizontal movement
      if (this.cursors.left.isDown || this.wasd.left.isDown) {
          playerBody.setVelocityX(-speed);
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
          playerBody.setVelocityX(speed);
      }

      // Handle vertical movement
      if (this.cursors.up.isDown || this.wasd.up.isDown) {
          playerBody.setVelocityY(-speed);
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
          playerBody.setVelocityY(speed);
      }
  }
}
