// helpers/NDVISimulator.js

import {events} from "../Events.js";
import {Vector2} from "../Vector2.js";
import {GameObject} from "../GameObject.js";

export class NDVISimulator extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });
    
    this.updateInterval = 5000; // Update every 5 seconds
    this.timer = 0;
    this.baseNDVI = 0.5; // Mid-range starting value
    
    // Simulate different conditions
    this.conditions = {
      optimal: 0.7,    // Healthy crops
      good: 0.55,      // Normal growth
      stressed: 0.35,  // Drought/nutrient deficiency
      poor: 0.2        // Severe stress
    };
    
    this.currentCondition = "good";
  }

  step(delta) {
    this.timer += delta;
    
    if (this.timer >= this.updateInterval) {
      this.timer = 0;
      this.broadcastNDVI();
    }
  }

  broadcastNDVI() {
    // Simulate NDVI values for different areas of the map
    // In a real implementation, this would fetch from NASA's API
    
    const ndviValue = this.conditions[this.currentCondition];
    
    // Add some randomness to simulate real-world variation
    const variation = (Math.random() - 0.5) * 0.1;
    const finalNDVI = Math.max(0, Math.min(1, ndviValue + variation));
    
    // Broadcast to all crops in the field
    events.emit("NDVI_UPDATE", {
      value: finalNDVI,
      position: new Vector2(0, 0), // In real version, this would be specific coordinates
      timestamp: Date.now(),
      condition: this.currentCondition
    });
    
    console.log(`NDVI Update: ${finalNDVI.toFixed(2)} (${this.currentCondition})`);
  }

  setCondition(condition) {
    if (this.conditions[condition]) {
      this.currentCondition = condition;
      console.log(`Weather condition changed to: ${condition}`);
    }
  }

  // Simulate fetching real NASA NDVI data
  async fetchNASANDVI(lat, lon) {
    // Example: This would connect to NASA's MODIS or Landsat data
    // For now, we'll simulate it
    
    // Real API would be something like:
    // const response = await fetch(`https://modis.ornl.gov/data/...`);
    
    return {
      ndvi: Math.random() * 0.5 + 0.3, // 0.3-0.8 range
      date: new Date().toISOString(),
      lat: lat,
      lon: lon
    };
  }
}