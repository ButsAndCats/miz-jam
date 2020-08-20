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
  level0Button: any;
  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.level0Button = new Button(this, 100, 100, ' level 1', fontStyle, {
      pointerup: () => this.startGame(0),
    });
    
    this.add.existing(this.level0Button);
  }
  
  private startGame(level: number) {
    this.scene.launch('Game', { level }).launch('HUD', { level }).stop();
  }
}
