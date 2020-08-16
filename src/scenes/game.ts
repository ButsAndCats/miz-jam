import * as Phaser from 'phaser';
import { SIDE_UP, SIDE_RIGHT, SIDE_DOWN, SIDE_LEFT, TOP_LEFT, TOP, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, LEFT, BOTTOM, RIGHT } from '../constants';
 

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  map: Phaser.Tilemaps.Tilemap;
  tiles: Phaser.Tilemaps.Tileset;
  groundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  config: Config;
  player: Phaser.Physics.Arcade.Sprite;
  debugGraphic: Phaser.GameObjects.Graphics;
  canFlipGravity: boolean;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  rotating: boolean;
  direction: 0 | 1 | 2 | 3;
  isFlipped: boolean;
  bgLayer: Phaser.Tilemaps.StaticTilemapLayer;
  spikesLayer: Phaser.Tilemaps.StaticTilemapLayer;
  constructor() {
    super(sceneConfig);
  }

  public preload() {
    /**    
     * Use these to control the speed and gravity of the player    
     */     
    this.config = {
      gravity: 1200,
      speed: 100,
      gravityDirection: 1,
      jumpForce: 250,
    }
    
    /**    
     * This will be set to false whilst the character is falling so that they cannot flip gravity half
     * way through falling.    
     */     
    this.canFlipGravity = true;
    this.isFlipped = false;
    
    /**    
     * We will use these values to rotate the sprite around corners
     */     
    this.rotating = false;
    this.direction = SIDE_UP;
  }
  
  public create() {
    
    /**    
     * Create the map and the platform layer    
     */     
    this.map = this.make.tilemap({ key: 'map' });
    this.tiles = this.map.addTilesetImage('tiles');
    this.bgLayer = this.map.createStaticLayer('Background', this.tiles)
    this.groundLayer = this.map.createStaticLayer('Ground', this.tiles)
    this.spikesLayer = this.map.createStaticLayer('Spikes', this.tiles)
    this.actionsLayer = this.map.createStaticLayer('Actions', this.tiles)
    
    /**    
     * Set the ground layer to be have any tiles with index 1 or 0 not be colidable.
     * Tiles 1 and 0 are the background/ blank tiles.     
     */
    this.groundLayer.setCollisionByExclusion([0, 1]);
    
    /**    
     * The tiles will probably go all the way around the edge of the map to
     * prevent the player from going off canvas.
     * Just in case though make they player collide with the bounds.
     * Here we are just creating the bounds based on the tilemap size.
     * Later we will add a collision  
     */     
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;
    
    /**    
     * Create a new sprite and add it to the physics of the scene. 
     * We then set the vertical gravity of the sprite so that it falls.  
     */     
    this.player = this.physics.add.sprite(256, 128, 'tiles', 403);
    this.player.setOrigin(0.5, 0.5)
    this.player.body.gravity.set(0, this.config.gravity);
    
    /**    
     * Collide the player with the colidable tiles in the tilemap    
     */     
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundLayer, (player, layer) => {
      if (!this.rotating) {
        if (this.cursors.left.isDown && !this.cursors.right.isDown) {
          if (!this.isFlipped) {
            this.moveCounterClockwise();
          } else {
            this.moveClockwise();
          }
          
        } else {
          if (this.cursors.right.isDown && !this.cursors.left.isDown) {
            if (this.isFlipped) {
              this.moveCounterClockwise();
            } else {
              this.moveClockwise();
            }
          } else {
            this.stopMoving()
          }
        }
        this.checkRotation(layer, player);
      }
      if (!this.canFlipGravity) {
        this.canFlipGravity = true;
      }
    })
    
    // Define the arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();
    
    /**    
     * When the space key is pressed, if gravity can be flipped:
     * Flip it and invert the players gravity and disable gravity flipping until there is a collision with the ground.    
     */     
    const { SPACE } = Phaser.Input.Keyboard.KeyCodes;
    const spaceKey = this.input.keyboard.addKey(SPACE);
    spaceKey.on("down", () => this.flip());
    
    /**    
     * set the camera to not go out of the bounds but follow the player, keeping them in the center.    
     */     
    this.cameras.main.setBounds(0, 0, 1920, 1440);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
  }
  
  public update() {    
    if (this.cursors.up.isDown) {
      this.jump();
    }
  }
  
  private moveCounterClockwise() {
    this.player.setFlipX(!this.isFlipped);
    const directions = [
      () => {
        this.player.setVelocity(-this.config.speed, this.player.body.velocity.y)
      },
      () => {
        this.player.setVelocity(this.player.body.velocity.x, -this.config.speed)
      },
      () => {
        this.player.setVelocity(this.config.speed, this.player.body.velocity.y)
      },
      () => {
        this.player.setVelocity(-this.player.body.velocity.x, this.config.speed)
      },  
    ]
    directions[this.direction]();
  }
  
  private moveClockwise() {
    this.player.setFlipX(this.isFlipped);
    const directions = [
      () => {
        this.player.setVelocity(this.config.speed, this.player.body.velocity.y);
      },
      () => {
        this.player.setVelocity(this.player.body.velocity.x, this.config.speed);
      },
      () => {
        this.player.setVelocity(-this.config.speed, this.player.body.velocity.y);
      },
      () => {
        this.player.setVelocity(this.player.body.velocity.x, -this.config.speed);
      }
    ]
    directions[this.direction]();
  }
  
  private stopMoving() {
    const directions = [
      () => {
        this.player.setVelocity(0, this.player.body.velocity.y);
      },
      () => {
        this.player.setVelocity(this.player.body.velocity.x, 0);
      },
      () => {
        this.player.setVelocity(0, this.player.body.velocity.y);
      },
      () => {
        this.player.setVelocity(this.player.body.velocity.x, 0);
      }
    ]
    directions[this.direction]();
  }
  
  private jump() {
    const directions = [
      () => {
        if (this.player.body.blocked.down) {
          this.player.setVelocityY(-this.config.jumpForce);
        }
      },
      () => {
        if (this.player.body.blocked.left) {
          this.player.setVelocityX(this.config.jumpForce);
        }
      },
      () => {
        if (this.player.body.blocked.up) {
          this.player.setVelocityY(this.config.jumpForce);
        }
      },
      () => {
        if (this.player.body.blocked.right) {
          this.player.setVelocityX(-this.config.jumpForce);
        }
      }
    ]
    directions[this.direction]();
  }
  
  private checkRotation({ index, ...tile}, {x, y ...player}) {
    if (this.rotating) return;
    const directions = [
      () => {
        if (index === TOP_RIGHT && x >= tile.pixelX + 20 && player.body.velocity.x > 0) {
          this.handleRotation(1, x + 4, y + 8)
        }
        if (index === TOP_LEFT && x <= tile.pixelX && player.body.velocity.x < 0) {
          this.handleRotation(-1, x - 8, y + 8)
        }
        if (index === RIGHT) {
          this.handleRotation(1, x, y)
        }
        if (index === LEFT) {
          this.handleRotation(-1, x, y)
        }
      },
      () => {
        if (index === BOTTOM_RIGHT && y >= tile.pixelY + 20 && player.body.velocity.y > 0) {
          this.handleRotation(1, x - 8, y)
        }
        if (index === TOP_RIGHT && y <= tile.pixelY && player.body.velocity.y < 0) {
          this.handleRotation(-1, x - 8, y - 8)
        }
        if (index === BOTTOM) {
          this.handleRotation(1, x, y)
        }
        if (index === TOP) {
          this.handleRotation(-1, x, y)
        }
      },
      () => {
        if (index === BOTTOM_LEFT && x <= tile.pixelX && player.body.velocity.x < 0) {
          this.handleRotation(1, x - 8, y - 8)
        }
        if (index === BOTTOM_RIGHT && x >= tile.pixelX + 20 && player.body.velocity.x > 0) {
          this.handleRotation(-1, x, y - 8)
        }
        if (index === RIGHT) {
          this.handleRotation(-1, x, y)
        }
        if (index === LEFT) {
          this.handleRotation(1, x, y)
        }
      },
      () => {
        if (index === TOP_LEFT && y <= tile.pixelY && player.body.velocity.y < 0) {
          this.handleRotation(1, x + 8, y - 8);
        }
        if (index === BOTTOM_LEFT && y >= tile.pixelY + 20 && player.body.velocity.y > 0) {
          this.handleRotation(-1, x + 8, y);
        }
        if (index === BOTTOM && !this.rotating) {
          this.handleRotation(-1, x, y)
        }
        if (index === TOP && !this.rotating) {
          this.handleRotation(1, x, y)
        }
      }
    ]
    
    directions[this.direction]();
  }
  
  private handleRotation(delta: number, x: number, y: number) {
    this.player.body.setAllowGravity(false);
    this.player.setVelocity(0, 0);
    this.rotating = true;
    this.tweens.add({
      targets: [this.player],
      angle: this.player.angle + 90 * delta,
      x,
      y,
      duration: 200,
      onComplete: () => {
        this.rotating = false;
        this.player.body.setAllowGravity(true);
        this.direction = Phaser.Math.Wrap(this.direction + delta, 0, 4)  as 0 | 1 | 2 | 3 ;
        this.setGravity();
      }
    })
  }
  
  private setGravity() {
    const directions = [
      () => {
        this.player.setGravity(0, this.config.gravity);
      },
      () => {
        this.player.setGravity(-this.config.gravity, 0);
      },
      () => {
        this.player.setGravity(0, -this.config.gravity);
      },
      () => {
        this.player.setGravity(this.config.gravity, 0);
      }
    ]
    directions[this.direction]();
  }
  
  public flip() {
    if (this.canFlipGravity) {
      this.canFlipGravity = false;
      if (this.direction === 0 || this.direction === 2) {
        this.player.body.gravity.y *= -1;
        this.player.body.gravity.x = 0
      } else {
        this.player.body.gravity.x *= -1;
        this.player.body.gravity.y = 0
      }
      this.player.flipY = !this.isFlipped
      const directions: Array<0 | 1 | 2 | 3> = [2, 3, 0, 1]
      this.direction = directions[this.direction]
      this.isFlipped = !this.isFlipped
    }
  }
}

type Config = {
  gravity: number;
  speed: number;
  gravityDirection: number;
  jumpForce: number;
}