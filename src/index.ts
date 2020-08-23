import * as Phaser from 'phaser';
import Scenes from 'scenes';

const config: Phaser.Types.Core.GameConfig = {
  title: 'Miz jam',
  type: Phaser.AUTO,
  zoom: 2,
  scale: {
    parent: 'game',
    width: 800,
    height: 600,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      // timeScale: 4,
      gravity: {
        y: 0
      },
      // debug: true
    }
  },
  // callbacks: {
  //   postBoot: function (game) {
  //     game.scene.dump();
  //   }
  // },
  scene: Scenes,
  parent: 'game',
  backgroundColor: 0x4B2A3C,
};

export const game = new Phaser.Game(config);

