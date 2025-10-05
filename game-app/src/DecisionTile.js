// objects/DecisionTile/DecisionTile.js
import { GameObject } from "./GameObject.js";
import { Vector2 } from "./Vector2.js";
import { events } from "./Events.js";

export class DecisionTile extends GameObject {
  constructor(x, y, decision, weekData) {
    super({
      position: new Vector2(x, y)
    });
    
    this.decision = decision;
    this.weekData = weekData;
    this.hasBeenActivated = false;
    
    // Animation properties
    this.animationTime = 0;
    this.scale = 1;
    this.opacity = 0;
    this.bounceOffset = 0;
    this.pulseScale = 1;
    this.spawnTime = Date.now();
    
    // Floating properties for dynamic movement
    this.floatSpeed = 0.02 + Math.random() * 0.01;
    this.floatAmplitude = 2 + Math.random() * 1;
    this.floatOffset = Math.random() * Math.PI * 2;
    
    // Button dimensions
    this.buttonWidth = 20;
    this.buttonHeight = 5;
    
    // Hover effect
    this.isHovered = false;
    this.hoverScale = 1;
  }

  ready() {
    events.on("HERO_POSITION", this, pos => {
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      
      // Check if hero is near the button (within collision range)
      const distance = Math.sqrt(
        Math.pow(roundedHeroX - this.position.x, 2) + 
        Math.pow(roundedHeroY - this.position.y, 2)
      );
      
      this.isHovered = distance < 20;
      
      if (roundedHeroX === this.position.x && 
          roundedHeroY === this.position.y && 
          !this.hasBeenActivated) {
        this.onCollideWithHero();
      }
    });
  }
  
  stepEntry(delta, root) {
    this.animationTime += delta * 0.001;
    
    // Fade in animation
    if (this.opacity < 1) {
      this.opacity += delta * 0.002;
      this.opacity = Math.min(this.opacity, 1);
    }
    
    // Scale in animation
    if (this.scale < 1) {
      this.scale += delta * 0.003;
      this.scale = Math.min(this.scale, 1);
    }
    
    // Continuous bounce animation
    this.bounceOffset = Math.sin(this.animationTime * 3) * 3;
    
    // Pulse animation
    this.pulseScale = 1 + Math.sin(this.animationTime * 2) * 0.05;
    
    // Hover effect
    if (this.isHovered) {
      this.hoverScale = Math.min(this.hoverScale + delta * 0.005, 1.15);
    } else {
      this.hoverScale = Math.max(this.hoverScale - delta * 0.005, 1);
    }
    
    super.stepEntry(delta, root);
  }

  onCollideWithHero() {
    this.hasBeenActivated = true;
    
    events.emit("DECISION_MADE", {
      decision: this.decision,
      week: this.weekData
    });
  }

  draw(ctx, x, y) {
    // Calculate floating position
    const floatY = Math.sin(this.animationTime * this.floatSpeed * Math.PI * 2 + this.floatOffset) * this.floatAmplitude;
    
    const drawX = this.position.x + x;
    const drawY = this.position.y + y + this.bounceOffset + floatY;
    
    ctx.save();
    
    // Apply opacity
    ctx.globalAlpha = this.opacity;
    
    // Move to button position
    ctx.translate(drawX, drawY);
    
    // Apply scale and pulse
    const totalScale = this.scale * this.pulseScale * this.hoverScale;
    ctx.scale(totalScale, totalScale);
    
    // Button colors
    const isYes = this.decision === "YES";
    const mainColor = isYes ? "#4CAF50" : "#f44336";
    const lightColor = isYes ? "#66BB6A" : "#ef5350";
    const darkColor = isYes ? "#388E3C" : "#c62828";
    
    // Draw button shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.roundRect(-this.buttonWidth/2 + 2, -this.buttonHeight/2 + 2, 
                  this.buttonWidth, this.buttonHeight, 8);
    ctx.fill();
    
    // Draw button gradient background
    const gradient = ctx.createLinearGradient(0, -this.buttonHeight/2, 0, this.buttonHeight/2);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(1, mainColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-this.buttonWidth/2, -this.buttonHeight/2, 
                  this.buttonWidth, this.buttonHeight, 8);
    ctx.fill();
    
    // Draw button border
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add inner highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-this.buttonWidth/2 + 2, -this.buttonHeight/2 + 2, 
                  this.buttonWidth - 4, this.buttonHeight - 4, 6);
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(this.decision, 0, 0);
    
    // Draw icon
    ctx.shadowColor = "transparent";
    ctx.font = "16px Arial";
    ctx.fillText(isYes ? "✓" : "✗", 0, -this.buttonHeight/2 - 12);
    
    // Draw sparkle effect on hover
    if (this.isHovered) {
      const sparkleTime = this.animationTime * 5;
      for (let i = 0; i < 3; i++) {
        const angle = (sparkleTime + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const sparkleX = Math.cos(angle) * (this.buttonWidth/2 + 8);
        const sparkleY = Math.sin(angle) * (this.buttonHeight/2 + 8);
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }
}