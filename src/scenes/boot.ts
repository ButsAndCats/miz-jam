import * as Phaser from 'phaser';
import { COLOURS } from '../constants';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot',
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public preload() {
    /**    
     * Create a progress bar graphics    
     */     
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(COLOURS.darkGray.number, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    /**    
     * Add text to the loader    
     */
    const { centerX, centerY } = this.cameras.main
    const loadingText = this.make.text({
      x: centerX,
      y: centerY,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: COLOURS.white.string
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLOURS.white.number, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    this.load.on('fileprogress', (file: File) => {
      loadingText.setText(file.src);
    });
    this.load.on('complete', () => {
      /**      
       * Destroy the loading bar graphics      
       */       
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      this.scene.start('Title');
    });
    
    /**    
     * Load the assets    
     */     
    this.load.tilemapTiledJSON('title', '../assets/title.json');
    this.load.tilemapTiledJSON('map0', '../assets/level0.json');
    this.load.tilemapTiledJSON('map1', '../assets/level1.json');
    this.load.tilemapTiledJSON('map2', '../assets/level2.json');
    this.load.spritesheet('tiles', '../assets/tiles.png', { 
      frameWidth: 16,
      frameHeight: 16,
    });
  }
}

type File = { 
  src: string
}