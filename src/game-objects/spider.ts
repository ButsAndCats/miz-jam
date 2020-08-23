import * as Phaser from 'phaser';
import { SPIDER } from 'constants';
import { GameScene } from 'src/scenes/game';

export class Spider extends Phaser.Physics.Arcade.Sprite {
  direction: 0 | 1 | 2 | 3;
  constructor(
    scene: GameScene,
    x: number,
    y: number,
    texture: string
  ) {
    super(scene, x, y, texture, SPIDER - 1);
    this.direction = 2;
    this.setOrigin(0.5, 0.5);

    scene.physics.add.collider(this, scene.groundLayer, (spider: Phaser.Physics.Arcade.Sprite, tile: Phaser.Tilemaps.Tile) => {
      this.direction = Phaser.Math.Wrap(this.direction + 1, 0, 4)  as 0 | 1 | 2 | 3 ;
      spider.setAngle(spider.angle + 90);
      const directions = [
        () => spider.setVelocity(0, -100),
        () => spider.setVelocity(100, 0),
        () => spider.setVelocity(0, 100),
        () => spider.setVelocity(-100, 0),
      ]
      directions[this.direction]()
    })
    
    scene.physics.add.overlap(this, scene.player, (spider: Phaser.Physics.Arcade.Sprite, tile: Phaser.Tilemaps.Tile) => {
      if (scene.isDead || scene.relocating) return;
      scene.killPlayer()
    })
  }
}