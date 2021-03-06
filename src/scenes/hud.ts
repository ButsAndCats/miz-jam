import * as Phaser from 'phaser';
import * as Store from 'store';
import { Button } from 'game-objects';
import { COLOURS, BLANK } from 'constants';

const fontStyle = {
  fill: COLOURS.maroon.string,
  fontFamily: 'kenny1bit',
  align: 'center',
}
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'HUD',
};

export class HUDScene extends Phaser.Scene {
  timeText: Phaser.GameObjects.Text;
  maxTime: number;
  timeTitle: Phaser.GameObjects.Text;
  items: Array<number>;
  map: Phaser.Tilemaps.Tilemap;
  tiles: Phaser.Tilemaps.Tileset;
  timedEvent: Phaser.Time.TimerEvent;
  timer: number;
  completedText: Phaser.GameObjects.Text;
  level: number;
  nextLevelButton: Button;
  thankyouText: GameObject | Group;
  constructor() {
    super(sceneConfig);  
  }
  
  public init({ level }: {
    level: number;
  }) {
    this.level = level;
    this.timer = 0;
  }
  
  /**
   * create
   */
  public create() {
    const { ENTER } = Phaser.Input.Keyboard.KeyCodes;
    const enterKey = this.input.keyboard.addKey(ENTER);
    
    this.items = []
    this.map = this.make.tilemap({ key: `map${this.level}` });
    this.tiles = this.map.addTilesetImage('tiles');
    const hudGraphics = this.add.graphics({
      fillStyle: {
        alpha: 0.9,
        color: COLOURS.white.number
      },
    }).setScrollFactor(0);
    const itemGraphics = this.add.graphics({
      fillStyle: {
        color: COLOURS.maroon.number
      }
    })
    const hudBg = new Phaser.Geom.Rectangle(650, 0, 150, 600)
    hudGraphics.fillRectShape(hudBg)
    this.timeTitle = this.add.text(670, 10, ' time', fontStyle)
    this.timeText = this.add.text(670, 50, '', fontStyle)

    this.completedText = this.add.text(400, 300, ' level completed!', {
      ...fontStyle,
      fill: COLOURS.green.string,
    }).setOrigin(0.5).setAlpha(0)
    this.thankyouText = this.add.text(400, 350, ' thank you for playing my game', {
      ...fontStyle,
      fill: COLOURS.green.string,
    }).setOrigin(0.5).setAlpha(0)
    this.nextLevelButton = new Button(this, 400, 350, ' next level - hit enter', {
      fill: COLOURS.white.string,
      fontFamily: 'kenny1bit',
      align: 'center',
    }, {
      pointerup: () => this.nextLevel(),
    }).setOrigin(0.5);
    const slot1 = new Phaser.Geom.Rectangle(670, 150, 50, 50)
    const slot2 = new Phaser.Geom.Rectangle(730, 150, 50, 50)
    const slot3 = new Phaser.Geom.Rectangle(670, 210, 50, 50)
    const slot4 = new Phaser.Geom.Rectangle(730, 210, 50, 50)
    const slot5 = new Phaser.Geom.Rectangle(670, 270, 50, 50)
    const slot6 = new Phaser.Geom.Rectangle(730, 270, 50, 50)
    itemGraphics.fillRectShape(slot1)
    itemGraphics.fillRectShape(slot2)
    itemGraphics.fillRectShape(slot3)
    itemGraphics.fillRectShape(slot4)
    itemGraphics.fillRectShape(slot5)
    itemGraphics.fillRectShape(slot6)
    const itemSprites = [
      this.add.sprite(695, 175, 'tiles', BLANK).setScale(2),
      this.add.sprite(755, 175, 'tiles', BLANK).setScale(2),
      this.add.sprite(695, 235, 'tiles', BLANK).setScale(2),
      this.add.sprite(755, 235, 'tiles', BLANK).setScale(2),
      this.add.sprite(695, 195, 'tiles', BLANK).setScale(2),
      this.add.sprite(755, 195, 'tiles', BLANK).setScale(2),
    ]
    
    this.scene.get('Game').events.on('pickup', (item: number) => {
      const index = this.items.length;
      this.items.push(item)
      itemSprites[index].setFrame(item - 1)
    });
    
    this.scene.get('Game').events.on('completed', () => {
      Store.set('highestLevel', this.level + 1)
      this.timedEvent.destroy();
      this.completedText.setAlpha(1);
      if (this.level === 9) {
        this.add.existing(this.thankyouText)
      } else {
        this.add.existing(this.nextLevelButton);
      }
      
      
    });
    
    this.timedEvent = this.time.addEvent({ delay: 1000, callback: () => {
      this.timer += 1;
      this.timeText.setText(` ${this.timer}`)
    }, callbackScope: this, loop: true });
    
    enterKey.on("down", () => this.nextLevel());
  }
  
  private nextLevel () {
    const level = this.level + 1;
    const gameScene = this.scene.get('Game')
    gameScene.events.removeListener('pickup');
    gameScene.events.removeListener('completed');
    gameScene.scene.restart({ level })
    this.scene.restart({ level })
  }
  
}
