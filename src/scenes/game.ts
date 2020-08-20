import * as Phaser from 'phaser';
import { SIDE_UP, SIDE_RIGHT, SIDE_DOWN, SIDE_LEFT, TOP_LEFT, TOP, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, LEFT, BOTTOM, RIGHT, START_DOOR, DOWN_SPIKE, UP_SPIKE, LEFT_SPIKE, RIGHT_SPIKE, COLOURS, RED_KEY, BLANK, RED_DOOR_LOCKED, RED_DOOR_ENTRANCE, RED_DOOR_EXIT, YELLOW_KEY, YELLOW_DOOR_LOCKED, YELLOW_DOOR_ENTRANCE, YELLOW_DOOR_EXIT, BLUE_DOOR_EXIT, GREEN_DOOR_EXIT, BLUE_KEY, GREEN_DOOR_LOCKED, GREEN_DOOR_ENTRANCE, BLUE_DOOR_LOCKED, BLUE_DOOR_ENTRANCE, GREEN_KEY, DEAD, ALIVE, RUN_END } from '../constants';
 

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
  isDead: boolean;
  actionsLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  items: any[];
  relocating: boolean;
  checkpoint: Phaser.Tilemaps.Tile;
  level: number;
  constructor() {
    super(sceneConfig);
  }
  
  public init({ level }: {
    level: number;
  }) {
    this.level = level;
  }
  
  public preload() {
    this.isDead = false;
    /**    
     * Use these to control the speed and gravity of the player    
     */     
    this.config = {
      gravity: 1200,
      speed: 120,
      gravityDirection: 1,
      jumpForce: 255,
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
    
    
    /**    
     * We will use this value to define whether or not the use is moving between 2 doors.    
     */     
    this.relocating = false;
    
    /**    
     * Any items that the player picks up will be stored in this array    
     */     
    this.items = [];
  }
  
  public create() {
    const { SPACE, E } = Phaser.Input.Keyboard.KeyCodes;
    // Define the arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();
    // Define E key
    const eKey = this.input.keyboard.addKey(E);
    // Define spacebar key
    const spaceKey = this.input.keyboard.addKey(SPACE);
    
    /**    
     * Create the map and the platform layer    
     */     
    this.map = this.make.tilemap({ key: `map${this.level}` });
    this.tiles = this.map.addTilesetImage('tiles');
    this.bgLayer = this.map.createStaticLayer('Background', this.tiles)
    this.groundLayer = this.map.createStaticLayer('Ground', this.tiles)
    this.spikesLayer = this.map.createStaticLayer('Spikes', this.tiles)
    this.actionsLayer = this.map.createDynamicLayer('Actions', this.tiles)
    
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
    const startTile = this.actionsLayer.findByIndex(START_DOOR);  
    const redDoorExitTile = this.actionsLayer.findByIndex(RED_DOOR_EXIT);
    const blueDoorExitTile = this.actionsLayer.findByIndex(BLUE_DOOR_EXIT);
    const yellowDoorExitTile = this.actionsLayer.findByIndex(YELLOW_DOOR_EXIT);
    
    this.checkpoint = startTile;
    
    this.player = this.physics.add.sprite(startTile.pixelX + 8, startTile.pixelY + 5, 'tiles', ALIVE);
    this.player.setOrigin(0.5, 0.5)
    this.player.body.gravity.set(0, this.config.gravity);
    
    /**    
     * Create walking animations    
     */     
    this.anims.create({
      key: 'running',
      frames: this.anims.generateFrameNumbers('tiles', { start: ALIVE, end: RUN_END }),
      frameRate: 10,
      repeat: -1,
    })
    
    /**    
     * Collide the player with the colidable tiles in the tilemap    
     */     
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundLayer, (player: GameScene['player'], tile: Phaser.Tilemaps.Tile) => {
      if (this.isDead || this.relocating) {
        return
      }
      if (!this.rotating) {
        this.checkRotation(tile, player);
      }
      if (!this.canFlipGravity) {
        this.canFlipGravity = true;
      }
    })
    
    this.physics.add.overlap(this.player, this.spikesLayer, (player: GameScene['player'], tile: Phaser.Tilemaps.Tile) => {
      if (this.isDead || this.relocating) {
        return false
      }
      this.isDead = true
      console.log("DEAD")
      player.setFrame(DEAD)
      // revive this player
      this.revive()
    }, (player, tile) => {
      if (tile.index === 1 || this.isDead || this.relocating) {
        return false
      }
      if (tile.index === UP_SPIKE) {
        if (player.y > tile.pixelY - 4 && player.x >= tile.pixelX - 5) {
          return true
        }
      }
      if (tile.index === DOWN_SPIKE) {
        if (player.y < tile.pixelY + 15 && player.x >= tile.pixelX - 5) {
          return true
        }
      }
      if (tile.index === LEFT_SPIKE) {
        if (player.x >= tile.pixelX + 5) {
          return true
        }
      }
      if (tile.index === RIGHT_SPIKE) {
        if (player.x <= tile.pixelX + 14) {
          return true
        }
      }
      return false
    })
    
    
    /**    
     * Fired when the player overlaps with the action tiles: doors and keys etc    
     */     
    this.physics.add.overlap(this.player, this.actionsLayer, (_player, tile) => {
      const actions = {
        [RED_KEY]: (tile: Phaser.Tilemaps.Tile) => {
          this.pickupItem(RED_KEY, tile)
        },
        [YELLOW_KEY]: (tile: Phaser.Tilemaps.Tile) => {
          this.pickupItem(YELLOW_KEY, tile)
        },
        [BLUE_KEY]: (tile: Phaser.Tilemaps.Tile) => {
          this.pickupItem(BLUE_KEY, tile)
        },
        [GREEN_KEY]: (tile: Phaser.Tilemaps.Tile) => {
          this.pickupItem(GREEN_KEY, tile)
        },
        [RED_DOOR_LOCKED]: (tile: Phaser.Tilemaps.Tile) => {
          if (this.items.includes(RED_KEY)) {
            this.actionsLayer.putTileAt(RED_DOOR_ENTRANCE, tile.x, tile.y)
          }
        },
        [RED_DOOR_ENTRANCE]: (tile: Phaser.Tilemaps.Tile) => {
          this.relocate(redDoorExitTile);
        },
        [RED_DOOR_EXIT]: (tile: Phaser.Tilemaps.Tile) => {
          // Find the tile here because it may not exist at the start of the game
          const redDoorEntranceTile = this.actionsLayer.findByIndex(RED_DOOR_ENTRANCE);
          this.relocate(redDoorEntranceTile);
        },
        [YELLOW_DOOR_LOCKED]: (tile: Phaser.Tilemaps.Tile) => {
          if (this.items.includes(YELLOW_KEY)) {
            this.actionsLayer.putTileAt(YELLOW_DOOR_ENTRANCE, tile.x, tile.y)
          }
        },
        [YELLOW_DOOR_ENTRANCE]: (tile: Phaser.Tilemaps.Tile) => {
          this.relocate(yellowDoorExitTile);
        },
        [YELLOW_DOOR_EXIT]: (tile: Phaser.Tilemaps.Tile) => {
          // Find the tile here because it may not exist at the start of the game
          const yellowDoorEntranceTile = this.actionsLayer.findByIndex(YELLOW_DOOR_ENTRANCE);
          this.relocate(yellowDoorEntranceTile);
        },
        [GREEN_DOOR_LOCKED]: (tile: Phaser.Tilemaps.Tile) => {
          if (this.items.includes(GREEN_KEY)) {
            this.actionsLayer.putTileAt(GREEN_DOOR_ENTRANCE, tile.x, tile.y)
          }
        },
        [GREEN_DOOR_ENTRANCE]: (tile: Phaser.Tilemaps.Tile) => {
          this.events.emit('completed');
        },
        [BLUE_DOOR_LOCKED]: (tile: Phaser.Tilemaps.Tile) => {
          if (this.items.includes(BLUE_KEY)) {
            this.actionsLayer.putTileAt(BLUE_DOOR_ENTRANCE, tile.x, tile.y)
          }
        },
        [BLUE_DOOR_ENTRANCE]: (tile: Phaser.Tilemaps.Tile) => {
          this.relocate(blueDoorExitTile);
        },
        [BLUE_DOOR_EXIT]: (tile: Phaser.Tilemaps.Tile) => {
          // Find the tile here because it may not exist at the start of the game
          const blueDoorEntranceTile = this.actionsLayer.findByIndex(BLUE_DOOR_ENTRANCE);
          console.log(BLUE_DOOR_ENTRANCE)
          console.log(blueDoorEntranceTile)
          this.relocate(blueDoorEntranceTile);
        }
      }
      actions[tile.index](tile)
      
    }, (_player, { index }: Phaser.Tilemaps.Tile) => {
      if (this.isDead || this.relocating) {
        return false
      }
      if (!eKey.isDown) {
        return false
      }
      // A list of the interactible tiles
      const actions = [RED_KEY, YELLOW_KEY, BLUE_KEY, GREEN_KEY, RED_DOOR_LOCKED, RED_DOOR_ENTRANCE, RED_DOOR_EXIT, YELLOW_DOOR_LOCKED, YELLOW_DOOR_ENTRANCE, YELLOW_DOOR_EXIT, BLUE_DOOR_LOCKED, BLUE_DOOR_ENTRANCE, BLUE_DOOR_EXIT, GREEN_DOOR_LOCKED, GREEN_DOOR_ENTRANCE, GREEN_DOOR_EXIT];
      return actions.includes(index)
    })
    /**    
     * When the space key is pressed, if gravity can be flipped:
     * Flip it and invert the players gravity and disable gravity flipping until there is a collision with the ground.    
     */     
    spaceKey.on("down", () => this.flip());
    
    /**    
     * set the camera to not go out of the bounds but follow the player, keeping them in the center.    
     */     
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
  }
  
  public update() {   
    if (this.isDead || this.relocating) {
      return
    }
    if (this.cursors.up.isDown) {
      this.jump();
    }
    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.anims.play('running', true)
      if (!this.isFlipped) {
        this.moveCounterClockwise();
      } else {
        this.moveClockwise();
      }
      
    } else if (this.cursors.right.isDown && !this.cursors.left.isDown) {
      this.player.anims.play('running', true)
      if (this.isFlipped) {
        this.moveCounterClockwise();
      } else {
        this.moveClockwise();
      }
    } else {
      this.stopMoving()
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
    this.player.anims.stop();
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
        console.log(index)
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
    if (this.isDead) {
      return
    }
    if (this.canFlipGravity) {
      this.canFlipGravity = false;
      if (this.direction === 0 || this.direction === 2) {
        this.player.body.gravity.y *= -1;
        this.player.body.gravity.x = 0
      } else {
        this.player.body.gravity.x *= -1;
        this.player.body.gravity.y = 0
      }
      this.player.setFlipY(!this.isFlipped)
      const directions: Array<0 | 1 | 2 | 3> = [2, 3, 0, 1]
      this.direction = directions[this.direction]
      this.isFlipped = !this.isFlipped
    }
  }
  
  private relocate(tile: Phaser.Tilemaps.Tile, callback?: (tile: Phaser.Tilemaps.Tile) => void, callback2?: (tile: Phaser.Tilemaps.Tile) => void) {
    this.relocating = true;
    this.tweens.add({
      targets: [this.player],
      alpha: {
        from: 1,
        to: 0
      },
      duration: 100,
      onComplete: () => {
        if (callback && typeof callback === 'function') {
          callback(tile)
        }
        this.resetFlippage();
        this.tweens.add({
          targets: [this.player],
          x: tile.pixelX + 8,
          y: tile.pixelY,
          onComplete: () => {
            this.tweens.add({
              targets: [this.player],
              alpha: {
                from: 0,
                to: 1,
              },
              onComplete: () => {
                this.relocating = false;
                this.checkpoint = tile;
                if (callback2 && typeof callback2 === 'function') {
                  callback2(tile)
                }
              }
            });
          }
        })
      }
    })
  }
  
  private pickupItem(item: number, tile: Phaser.Tilemaps.Tile) {
    this.actionsLayer.putTileAt(BLANK, tile.x, tile.y);
    this.events.emit('pickup', item)
    this.items.push(item)
    this.checkpoint = tile;
  }
  
  private revive() {
    this.add.tween({
      targets: [this.player],
      duration: 1000,
      onComplete: () => {
        this.relocate(
          this.checkpoint,
          (tile: Phaser.Tilemaps.Tile) => {
            this.player.setFrame(ALIVE);
          },
          (tile: Phaser.Tilemaps.Tile) => {
            this.isDead = false;
          }
        )
      }
    })  
  }
  
  private resetFlippage() {
    this.direction = 0;
    this.setGravity();
    this.isFlipped = false;
    this.player.setFlipX(false);
    this.player.setFlipY(false);
    this.player.setAngle(0);
  }
}

type Config = {
  gravity: number;
  speed: number;
  gravityDirection: number;
  jumpForce: number;
}