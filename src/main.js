import Phaser from 'phaser';
import { Boot } from './game/scenes/Boot';
import { Preloader } from './game/scenes/Preloader';
import { MainMenu } from './game/scenes/MainMenu';
import { LevelSelect } from './game/scenes/LevelSelect';
import { Game } from './game/scenes/Game';
import { GameOver } from './game/scenes/GameOver';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#333333',
  scene: [Boot, Preloader, MainMenu, LevelSelect, Game, GameOver],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
