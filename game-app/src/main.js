import './style.css'
import {resources} from "./Resource.js";
import {Sprite} from "./Sprite.js";
import {Vector2} from "./Vector2.js";
import {GameLoop} from "./GameLoop.js";
import {Input} from "./Input.js";
import {gridCells} from "./helpers/grid.js";
import {GameObject} from "./GameObject.js";
import {Hero} from "./objects/Hero/Hero.js";
import {Camera} from "./Camera.js";
import {Rod} from "./objects/Rod/Rod.js";
import {Inventory} from "./objects/Inventory/Inventory.js";
import { NASAData } from './NASAData.js';
import { DecisionTile } from './DecisionTile.js';
import { events } from './Events.js';
import { HUD } from "./HUD.js";

// Grabbing the canvas to draw to
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Establish the root scene
const mainScene = new GameObject({
  position: new Vector2(0,0)
})

const nasaData = new NASAData();
let yesTile = null;
let noTile = null;

const hud = new HUD(nasaData);

// Dynamic positioning for decision tiles
function getRandomTilePosition(avoidX, avoidY, minDistance = 3) {
  let x, y, attempts = 0;
  const maxAttempts = 50;
  
  do {
    // Random positions but within reasonable bounds
    x = gridCells(3 + Math.floor(Math.random() * 7));
    y = gridCells(4 + Math.floor(Math.random() * 5));
    
    const distance = Math.sqrt(
      Math.pow(x - avoidX, 2) + Math.pow(y - avoidY, 2)
    );
    
    if (distance >= gridCells(minDistance)) {
      return { x, y };
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  // Fallback positions
  return { x, y };
}

function spawnDecisionTiles() {
  if (yesTile) yesTile.destroy();
  if (noTile) noTile.destroy();

  const currentWeek = nasaData.getCurrentWeek();

  // Get random position for YES tile
  const yesPos = getRandomTilePosition(0, 0);
  yesTile = new DecisionTile(yesPos.x, yesPos.y, "YES", currentWeek);
  mainScene.addChild(yesTile);

  // Get random position for NO tile (avoiding YES tile)
  const noPos = getRandomTilePosition(yesPos.x, yesPos.y, 4);
  noTile = new DecisionTile(noPos.x, noPos.y, "NO", currentWeek);
  mainScene.addChild(noTile);
}

spawnDecisionTiles();

// Listen for decisions made by the player
events.on("DECISION_MADE", null, (data) => {
  if (data.decision === "YES") {
    const result = nasaData.irrigate();
    if (!result.success) {
      alert("❌ Not enough money to irrigate!");
      // Re-spawn tiles since decision wasn't completed
      spawnDecisionTiles();
      return;
    }
    alert(`✅ Farm Irrigated!\n💰 Cost: -₦${data.week.cost.toLocaleString()}\n🌱 Crop Health: +10%`);
  } else {
    const result = nasaData.skipIrrigation();
    const moisturePercent = (data.week.moisture * 100).toFixed(0);
    
    if (result.adequate) {
      alert(`✅ Irrigation Skipped\n💧 Soil moisture at ${moisturePercent}% is adequate\n🌱 No health penalty`);
    } else {
      alert(`⚠️ Warning: Irrigation Skipped\n💧 Soil moisture at ${moisturePercent}% is too low!\n🌱 Crop Health: -15%`);
    }
  }
  
  // Check game over
  const gameOverCheck = nasaData.checkGameOver();
  if (gameOverCheck.gameOver) {
    if (gameOverCheck.reason === 'crop_death') {
      alert(`💀 Game Over!\n\nYour crops have died due to poor management.\n\n🌱 Final Crop Health: ${nasaData.cropHealth}%\n💰 Remaining Money: ₦${nasaData.money.toLocaleString()}`);
    } else if (gameOverCheck.reason === 'bankruptcy') {
      alert(`💸 Game Over!\n\nYou've run out of money and cannot continue farming.\n\n🌱 Crop Health: ${nasaData.cropHealth}%\n💰 Money: ₦${nasaData.money.toLocaleString()}`);
    }
    return;
  }
  
  // Advance to next week
  const advance = nasaData.advanceWeek();
  if (advance.gameOver) {
    alert(`🎉 Congratulations! You Win!\n\n✅ Successfully managed your farm for 16 weeks!\n🌱 Final Crop Health: ${nasaData.cropHealth}%\n💰 Money Remaining: ₦${nasaData.money.toLocaleString()}`);
    return;
  }
  
  // Spawn new tiles for next week at different positions
  spawnDecisionTiles();
});

// Build up the scene by adding a sky, ground, and hero
const skySprite = new Sprite({
  resource: resources.images.sky,
  frameSize: new Vector2(320, 180)
})

const groundSprite = new Sprite({
  resource: resources.images.ground,
  frameSize: new Vector2(320, 180)
})
mainScene.addChild(groundSprite);

const hero = new Hero(gridCells(6), gridCells(5))
mainScene.addChild(hero);

const camera = new Camera()
mainScene.addChild(camera);

const rod = new Rod(gridCells(7), gridCells(6))
mainScene.addChild(rod);

const inventory = new Inventory();

// Add an Input class to the main scene
mainScene.input = new Input();

// Establish update and draw loops
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene);
  hud.stepEntry(delta); // Update HUD animations
};

const draw = () => {
  // Clear anything stale
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the sky
  skySprite.drawImage(ctx, 0, 0);

  // Save the current state (for camera offset)
  ctx.save();

  // Offset by camera position
  ctx.translate(camera.position.x, camera.position.y);

  // Draw objects in the mounted scene
  mainScene.draw(ctx, 0, 0);

  // Restore to original state
  ctx.restore();

  // Draw HUD on top (after camera transform, so it stays fixed)
  hud.draw(ctx);

  // Draw anything above the game world
  inventory.draw(ctx, 0, 0);
}

// Start the game!
const gameLoop = new GameLoop(update, draw);
gameLoop.start();