import * as Phaser from 'phaser';
import * as Store from 'store';
import { COLOURS, ZERO, CURSOR } from 'constants';

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
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.selected = highestLevel;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.map = this.make.tilemap({ key: `title` });
    this.tiles = this.map.addTilesetImage('tiles');
    this.bgLayer = this.map.createStaticLayer('Background', this.tiles)
    this.numberLayer = this.map.createStaticLayer('Numbers', this.tiles)
    this.actionsLayer = this.map.createDynamicLayer('Actions', this.tiles)
    const startTile = this.numberLayer.findByIndex(ZERO + this.selected);
    this.cursor = this.add.sprite(startTile.pixelX, startTile.pixelY, 'tiles', CURSOR).setOrigin(0, 0);
    
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.cursor);
    this.cameras.main.setZoom(2);
    // this.level0Button = new Button(this, 100, 100, ' 1', fontStyle, {
    //   pointerup: () => this.startGame(0),
    // });
    // this.level1Button = new Button(this, 150, 100, ' 2', fontStyle, {
    //   pointerup: () => this.startGame(1),
    // });
    // 
    // this.add.existing(this.level0Button);
    // this.add.existing(this.level1Button);
    // 
    enterKey.on("down", () => {
      this.startGame(this.selected)
    });
  }
  
  private startGame(level: number) {
    this.scene.launch('Game', { level }).launch('HUD', { level }).stop();
  }
}
