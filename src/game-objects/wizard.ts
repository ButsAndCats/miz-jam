import * as Phaser from 'phaser';
import { WIZARD } from 'constants';
import { Spell } from './spell';
import { GameScene } from 'src/scenes/game';

export class Wizard extends Phaser.GameObjects.Sprite {
  shootingTimer: Phaser.Time.TimerEvent;
  constructor(
    scene: GameScene,
    x: number,
    y: number,
    texture: string
  ) {
    super(scene, x, y, texture, WIZARD - 1);
    this.setOrigin(0, 0);
    this.shootingTimer = scene.time.addEvent({ delay: 1000, callback: () => {
      if (scene.isDead || scene.relocating) return
      const spell = new Spell(scene, x, y, texture);
      scene.add.existing(spell);
      scene.physics.add.existing(spell);
      scene.physics.moveToObject(spell, scene.player)
      spell.body.setSize(2, 2, true)
      // spell.setVelocityX(-100);
    }, callbackScope: this, loop: true });
  }
}