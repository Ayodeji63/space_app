// HUD.js
export class HUD {
  constructor(nasaData) {
    this.nasaData = nasaData;
    this.animationTime = 0;
  }
  
  stepEntry(delta) {
    this.animationTime += delta * 0.001;
  }

  draw(ctx) {
    const week = this.nasaData.getCurrentWeek();
    
    ctx.save();
    
    // ========== TOP HEADER PANEL (Compact) ==========
    const headerWidth = 200;
    const headerHeight = 15;
    const headerX = (320 - headerWidth) / 2;
    const headerY = 5;
    
    // Header gradient background
    const pulse = Math.sin(this.animationTime * 2) * 0.05 + 0.95;
    const headerGradient = ctx.createLinearGradient(headerX, headerY, headerX, headerY + headerHeight);
    headerGradient.addColorStop(0, `rgba(20, 40, 80, ${0.80 * pulse})`);
    headerGradient.addColorStop(1, `rgba(10, 20, 50, ${0.90 * pulse})`);
    
    ctx.fillStyle = headerGradient;
    this.roundRect(ctx, headerX, headerY, headerWidth, headerHeight, 8);
    ctx.fill();
    
    // Header border with glow
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#4fc3f7";
    ctx.shadowBlur = 6;
    this.roundRect(ctx, headerX, headerY, headerWidth, headerHeight, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Header title
    ctx.fillStyle = "#4fc3f7";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(79, 195, 247, 0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText(`Week ${week.week} - ${week.date}`, headerX + headerWidth/2, headerY + 10);
    ctx.shadowBlur = 0;
    
    // ========== BOTTOM STATS PANEL (Single Line) ==========
    const statsWidth = 300;
    const statsHeight = 20;
    const statsX = (320 - statsWidth) / 2;
    const statsY = 180 - statsHeight - 1; // Position at bottom of canvas
    
    // Stats panel gradient
    const statsGradient = ctx.createLinearGradient(statsX, statsY, statsX, statsY + statsHeight);
    statsGradient.addColorStop(0, `rgba(15, 30, 60, ${0.85 * pulse})`);
    statsGradient.addColorStop(1, `rgba(8, 15, 35, ${0.92 * pulse})`);
    
    ctx.fillStyle = statsGradient;
    this.roundRect(ctx, statsX, statsY, statsWidth, statsHeight, 8);
    ctx.fill();
    
    // Stats panel border
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#4fc3f7";
    ctx.shadowBlur = 6;
    this.roundRect(ctx, statsX, statsY, statsWidth, statsHeight, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Stats content (ALL IN ONE LINE)
    const contentY = statsY + 15;
    
    ctx.font = "8px Arial";
    ctx.textAlign = "left";
    
    // Calculate spacing for 4 stats in one line
    const moisturePercent = (week.moisture * 100).toFixed(0);
    const moistureColor = this.getMoistureColor(week.moisture);
    const healthColor = this.getHealthColor(this.nasaData.cropHealth);
    const moneyColor = this.nasaData.money < week.cost ? "#ff5252" : "#66bb6a";
    
    // Draw all 4 stats horizontally
    this.drawCompactStat(ctx, statsX + 10, contentY, "💧", `${moisturePercent}%`, moistureColor);
    this.drawCompactStat(ctx, statsX + 75, contentY, "🌱", `${this.nasaData.cropHealth}%`, healthColor);
    this.drawCompactStat(ctx, statsX + 145, contentY, "💰", `₦${this.formatMoney(this.nasaData.money)}`, moneyColor);
    this.drawCompactStat(ctx, statsX + 220, contentY, "💦", `₦${this.formatMoney(week.cost)}`, "#ffa726");
    
    // Corner decorations (smaller)
    this.drawCornerDecoration(ctx, headerX + 4, headerY + 4, 5, Math.PI);
    this.drawCornerDecoration(ctx, headerX + headerWidth - 4, headerY + 4, 5, -Math.PI/2);
    
    this.drawCornerDecoration(ctx, statsX + 4, statsY + 4, 5, Math.PI);
    this.drawCornerDecoration(ctx, statsX + statsWidth - 4, statsY + 4, 5, -Math.PI/2);
    this.drawCornerDecoration(ctx, statsX + 4, statsY + statsHeight - 4, 5, Math.PI/2);
    this.drawCornerDecoration(ctx, statsX + statsWidth - 4, statsY + statsHeight - 4, 5, 0);
    
    ctx.restore();
  }
  
  drawCompactStat(ctx, x, y, icon, value, valueColor) {
    ctx.fillStyle = "#b0bec5";
    ctx.font = "11px Arial";
    ctx.fillText(icon, x, y);
    
    ctx.fillStyle = valueColor;
    ctx.font = "bold 11px Arial";
    ctx.fillText(value, x + 15, y);
  }
  
  formatMoney(amount) {
    if (amount >= 1000) {
      return Math.floor(amount / 1000) + "k";
    }
    return amount.toString();
  }
  
  getMoistureColor(moisture) {
    if (moisture >= 0.7) return "#4fc3f7";
    if (moisture >= 0.5) return "#66bb6a";
    if (moisture >= 0.3) return "#ffa726";
    return "#ff5252";
  }
  
  getHealthColor(health) {
    if (health >= 70) return "#66bb6a";
    if (health >= 40) return "#ffa726";
    return "#ff5252";
  }
  
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  drawCornerDecoration(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    ctx.restore();
  }
}