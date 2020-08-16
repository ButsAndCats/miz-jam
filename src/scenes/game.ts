import * as Phaser from 'phaser';
import { colours } from '../constants';
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
  constructor() {
    super(sceneConfig);
  }

  public preload() {
    
    /**    
     * Use these to control the speed and gravity of the player    
     */     
    this.config = {
      playerGravity: 1200,
      playerSpeed: 200,
      gravityDirection: 1,
    }
    
    /**    
     * This will be set to false whilst the character is falling so that they cannot flip gravity half
     * way through falling.    
     */     
    this.canFlipGravity = true;
  }
  
  public create() {
    
    /**    
     * Create the map and the platform layer    
     */     
    this.map = this.make.tilemap({ key: 'map' });
    this.tiles = this.map.addTilesetImage('tiles');
    this.groundLayer = this.map.createStaticLayer('Ground', this.tiles)
    
    /**    
     * Set the ground layer to be have any tiles with index 1 or 0 not be colidable.
     * Tiles 1 and 0 are the background/ blank tiles.     
     */
    this.groundLayer.setCollisionByExclusion([0, 1]);
    
    /**    
     * The tiles will probably go all the way around the edge of the map to prevent the player from going off canvas.
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
    this.player = this.physics.add.sprite(200, 200, 'tiles', 403);
    this.player.body.gravity.set(0, this.config.playerGravity);
    
    /**    
     * Collide the player with the colidable tiles in the tilemap    
     */     
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundLayer);
    
    // Define the arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();
    
    /**    
     * When the space key is pressed, if gravity can be flipped:
     * Flip it and invert the players gravity and disable gravity flipping until there is a collision with the ground.    
     */     
    const { SPACE } = Phaser.Input.Keyboard.KeyCodes;
    const spaceKey = this.input.keyboard.addKey(SPACE);
    spaceKey.on("down", () => {
      console.log("down")
      if (this.canFlipGravity){
        this.player.body.gravity.y *= -1;
        this.canFlipGravity = false;
        this.player.flipY = this.player.body.gravity.y < 0
      }
    });
    
    /**    
     * set the camera to not go out of the bounds but follow the player, keeping them in the center.    
     */     
    this.cameras.main.setBounds(0, 0, 1920, 1440);
    this.cameras.main.startFollow(this.player);
  }
  
  public update() {    
    /**    
     * Move left or right when arrow keys are pressed    
     */     
    this.player.body.velocity.x = this.cursors.left.isDown ? (this.cursors.right.isDown ? 0 : -1 * this.config.playerSpeed) : (this.cursors.right.isDown ? this.config.playerSpeed : 0);
    // Flip the sprite along the X axis depending on it's horizontal movement.
    this.player.flipX = this.player.body.velocity.x == 0 ? this.player.flipX : (this.player.body.velocity.x > 0 ? false : true);
    
  }
}

type Config = {
  playerGravity: number;
  playerSpeed: number;
  gravityDirection: number;
}