import * as Phaser from 'phaser';
import * as Store from 'store';
import { COLOURS, ZERO, CURSOR, BLANK } from 'constants';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Title',
};

export class TitleScene extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Phaser.Tilemaps.Tilemap;
  tiles: Phaser.Tilemaps.Tileset;
  bgLayer: Phaser.Tilemaps.StaticTilemapLayer;
  spikesLayer: Phaser.Tilemaps.StaticTilemapLayer;
  actionsLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  cursor: Phaser.GameObjects.Sprite;
  selected: number;
  numberLayer: Phaser.Tilemaps.StaticTilemapLayer;
  constructor() {
    super(sceneConfig);
  }

  public create() {
    const { ENTER } = Phaser.Input.Keyboard.KeyCodes;
    const enterKey = this.input.keyboard.addKey(ENTER);
    const highestLevel = Store.get('highestLevel') || 0;
    this.selected = highestLevel;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.map = this.make.tilemap({ key: `title` });
    this.tiles = this.map.addTilesetImage('tiles');
    this.bgLayer = this.map.createStaticLayer('Background', this.tiles)
    this.numberLayer = this.map.createStaticLayer('Numbers', this.tiles)
    this.actionsLayer = this.map.createDynamicLayer('Actions', this.tiles)
    
    const levelTiles: Array<Phaser.Tilemaps.Tile> = []
    for (let i = 0; i < 10; i++) {
      const tile = this.numberLayer.findByIndex(ZERO + i) 
      if (i <= highestLevel) {
        this.actionsLayer.putTileAt(BLANK, tile.x, tile.y);
      }
      levelTiles.push(tile)
    }
    const startTile = levelTiles[this.selected];
    this.cursor = this.add.sprite(startTile.pixelX, startTile.pixelY, 'tiles', CURSOR).setOrigin(0, 0);
    
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.cursor);
    this.cameras.main.setZoom(2);

    this.cursors.left.on("down", () => {
      this.selected = this.selected === 0 ? highestLevel : this.selected - 1;
      this.cursor.setX(levelTiles[this.selected].pixelX)
    })
    this.cursors.right.on("down", () => {
      this.selected = this.selected === highestLevel ? 0 : this.selected + 1;
      this.cursor.setX(levelTiles[this.selected].pixelX)
    })

    enterKey.on("down", () => {
      this.startGame(this.selected)
    });
  }
  
  private startGame(level: number) {
    this.scene.launch('Game', { level }).launch('HUD', { level }).stop();
  }
}
