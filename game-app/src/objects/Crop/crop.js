// objects/Crop/Crop.js

import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {events} from "../../Events.js";

export class Crop extends GameObject {
  constructor(x, y, cropType = "wheat") {
    super({
      position: new Vector2(x, y)
    });

    this.cropType = cropType;
    this.growthStage = 0; // 0 = seed, 1-4 = growing stages, 5 = harvestable
    this.maxGrowthStage = 5;
    this.growthTimer = 0;
    this.growthInterval = 3000; // Base growth time in ms
    this.ndviValue = 0.3; // Starting NDVI value (0-1 scale)
    this.isHarvestable = false;

    // Define crop types with their sprite frames
    // Looking at your sprite sheet, each crop type has ~6 growth stages horizontally
    this.cropData = {
      wheat: {
        frames: [0, 1, 2, 3, 4, 5], // Growth stages for wheat
        row: 0, // Top row
        harvestYield: 3
      },
      corn: {
        frames: [0, 1, 2, 3, 4, 5], // Growth stages for corn
        row: 5, // Corn appears to be around row 5
        harvestYield: 2
      },
      tomato: {
        frames: [0, 1, 2, 3, 4, 5], // Growth stages for tomato
        row: 3, // Tomatoes appear around row 3
        harvestYield: 5
      },
      carrot: {
        frames: [0, 1, 2, 3, 4, 5], // Growth stages for carrot
        row: 2, // Carrots appear around row 2
        harvestYield: 4
      }
    };

    // Create the crop sprite
    this.sprite = new Sprite({
      resource: resources.images.crops,
      frameSize: new Vector2(32, 32), // Each crop tile is 32x32
      hFrames: 24, // 24 columns in your sprite sheet
      vFrames: 10,  // 10 rows in your sprite sheet
      frame: this.getCropFrame(),
      position: new Vector2(-8, -16)
    });
    this.addChild(this.sprite);
    
    console.log(`Created ${cropType} at stage ${this.growthStage}, frame: ${this.getCropFrame()}`);

    // Listen for NDVI updates
    events.on("NDVI_UPDATE", this, (data) => {
      this.updateNDVI(data);
    });
  }

  getCropFrame() {
    const data = this.cropData[this.cropType];
    const col = data.frames[this.growthStage]; // Which column (0-5 for growth stages)
    const row = data.row; // Which row for this crop type
    
    // Calculate frame index: row * number_of_columns + column
    const frameIndex = row * 24 + col;
    
    console.log(`${this.cropType} stage ${this.growthStage}: row=${row}, col=${col}, frame=${frameIndex}`);
    return frameIndex;
  }

  updateNDVI(data) {
    // Filter NDVI data for this crop's position
    const distance = Math.sqrt(
      Math.pow(data.position.x - this.position.x, 2) + 
      Math.pow(data.position.y - this.position.y, 2)
    );
    
    // Only update if NDVI data is nearby (within certain range)
    if (distance < 50) {
      this.ndviValue = data.value;
    }
  }

  step(delta, root) {
    // Don't grow if already fully grown
    if (this.growthStage >= this.maxGrowthStage) {
      this.isHarvestable = true;
      return;
    }

    // NDVI affects growth speed
    // Higher NDVI (0.6-0.9) = healthy vegetation = faster growth
    // Lower NDVI (0.2-0.4) = stressed vegetation = slower growth
    const ndviMultiplier = Math.max(0.5, Math.min(2.0, this.ndviValue * 2));
    
    this.growthTimer += delta * ndviMultiplier;

    // Advance growth stage
    if (this.growthTimer >= this.growthInterval) {
      this.growthTimer = 0;
      this.growthStage++;
      
      if (this.growthStage > this.maxGrowthStage) {
        this.growthStage = this.maxGrowthStage;
      }

      // Update sprite frame
      this.sprite.frame = this.getCropFrame();

      // Emit event for UI updates
      events.emit("CROP_GROWTH", {
        position: this.position,
        stage: this.growthStage,
        type: this.cropType,
        ndvi: this.ndviValue
      });
    }
  }

  ready() {
    // Detect when hero walks over to harvest
    events.on("HERO_POSITION", this, pos => {
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      
      if (this.isHarvestable && 
          roundedHeroX === this.position.x && 
          roundedHeroY === this.position.y) {
        this.onHarvest();
      }
    });
  }

  onHarvest() {
    const harvestAmount = this.cropData[this.cropType].harvestYield;
    
    // Emit harvest event
    events.emit("CROP_HARVESTED", {
      type: this.cropType,
      harvestAmount: harvestAmount,
      position: this.position,
      ndvi: this.ndviValue
    });

    // Remove crop from scene
    this.destroy();
  }
}