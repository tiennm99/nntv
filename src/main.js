import Phaser from 'phaser';
import { Boot } from './game/scenes/Boot';
import { Preloader } from './game/scenes/Preloader';
import { MainMenu } from './game/scenes/MainMenu';
import { LevelSelect } from './game/scenes/LevelSelect';
import { Game } from './game/scenes/Game';
import { GameOver } from './game/scenes/GameOver';
import { Settings } from './game/scenes/Settings';
import { Guide } from './game/scenes/Guide';
import { StoryIntro } from './game/scenes/StoryIntro';
import { LevelIntro } from './game/scenes/LevelIntro';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'app',
  backgroundColor: '#0a0a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [Boot, Preloader, MainMenu, StoryIntro, LevelSelect, LevelIntro, Game, GameOver, Settings, Guide],
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
