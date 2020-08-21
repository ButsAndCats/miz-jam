import * as Phaser from 'phaser';
import { COLOURS } from 'constants';
import { Button } from 'game-objects';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Title',
};

const fontStyle = {
  fill: COLOURS.white.string,
  fontFamily: 'kenny1bit',
  align: 'center',
}

export class TitleScene extends Phaser.Scene {
  level0Button: Button;
  level1Button: Button;
  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.level0Button = new Button(this, 100, 100, ' 1', fontStyle, {
      pointerup: () => this.startGame(0),
    });
    this.level1Button = new Button(this, 150, 100, ' 2', fontStyle, {
      pointerup: () => this.startGame(1),
    });
    
    this.add.existing(this.level0Button);
    this.add.existing(this.level1Button);
  }
  
  private startGame(level: number) {
    this.scene.launch('Game', { level }).launch('HUD', { level }).stop();
  }
}
