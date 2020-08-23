import * as Phaser from 'phaser';
import { SPELL } from 'constants';
import { GameScene } from 'src/scenes/game';

export class Spell extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: GameScene,
    x: number,
    y: number,
    texture: string
  ) {
    super(scene, x, y, texture, SPELL);
    this.setOrigin(0, 0)
    const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y)
    // add 45 degrees to offset the sprite
    this.setRotation(angle - 3.92699)
    
    scene.physics.add.overlap(this, scene.player, (spell: Phaser.Physics.Arcade.Sprite, tile: Phaser.Tilemaps.Tile) => {
      if (scene.isDead || scene.relocating) return;
      scene.killPlayer()
    })
    
    scene.physics.add.collider(this, scene.groundLayer, (spell: Phaser.Physics.Arcade.Sprite, tile: Phaser.Tilemaps.Tile) => {
      spell.destroy();
    })
  }
  
}