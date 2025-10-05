// objects/Dashboard/NASADataDashboard.js

import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {events} from "../../Events.js";

export class NASADataDashboard extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });

    this.isExpanded = false;
    this.currentDataView = null;
    
    // Simulated NASA data (in production, fetch from APIs)
    this.nasaData = {
      ndvi: {
        value: 0.65,
        status: "Healthy",
        color: "#4CAF50",
        description: "Vegetation health index",
        recommendation: "Crops are healthy. Maintain current care."
      },
      soilMoisture: {
        value: 45,
        status: "Optimal",
        color: "#2196F3",
        description: "Soil water content (%)",
        recommendation: "Moisture levels adequate. No irrigation needed."
      },
      temperature: {
        value: 24,
        status: "Ideal",
        color: "#FF9800",
        description: "Air temperature (°C)",
        recommendation: "Temperature within optimal range for growth."
      },
      precipitation: {
        value: 12,
        status: "Moderate",
        color: "#03A9F4",
        description: "Rainfall (mm/week)",
        recommendation: "Adequate rainfall. Monitor for next week."
      },
      evapotranspiration: {
        value: 3.2,
        status: "Normal",
        color: "#9C27B0",
        description: "ET rate (mm/day)",
        recommendation: "Water loss is within normal range."
      }
    };

    // Listen for data updates
    events.on("NDVI_UPDATE", this, (data) => {
      this.nasaData.ndvi.value = data.value.toFixed(2);
      this.updateNDVIStatus(data.value);
    });
  }

  updateNDVIStatus(value) {
    if (value > 0.6) {
      this.nasaData.ndvi.status = "Healthy";
      this.nasaData.ndvi.color = "#4CAF50";
      this.nasaData.ndvi.recommendation = "Excellent vegetation health!";
    } else if (value > 0.4) {
      this.nasaData.ndvi.status = "Moderate";
      this.nasaData.ndvi.color = "#FFC107";
      this.nasaData.ndvi.recommendation = "Consider fertilizing or watering.";
    } else {
      this.nasaData.ndvi.status = "Stressed";
      this.nasaData.ndvi.color = "#F44336";
      this.nasaData.ndvi.recommendation = "Urgent: Crops need attention!";
    }
  }

  draw(ctx, x, y) {
    // Draw compact button panel on the right side
    this.drawButtonPanel(ctx);

    // Draw expanded data view if active
    if (this.currentDataView) {
      this.drawDataPanel(ctx, this.currentDataView);
    }

    // Draw mini status indicators
    this.drawMiniStatusBar(ctx);
  }

  drawButtonPanel(ctx) {
    const panelX = 240;
    const panelY = 10;
    const buttonWidth = 70;
    const buttonHeight = 20;
    const spacing = 5;

    const buttons = [
      { key: 'ndvi', label: 'NDVI', color: '#4CAF50' },
      { key: 'soilMoisture', label: 'Soil', color: '#2196F3' },
      { key: 'temperature', label: 'Temp', color: '#FF9800' },
      { key: 'precipitation', label: 'Rain', color: '#03A9F4' },
      { key: 'evapotranspiration', label: 'ET', color: '#9C27B0' }
    ];

    buttons.forEach((btn, index) => {
      const btnY = panelY + (index * (buttonHeight + spacing));
      const data = this.nasaData[btn.key];
      
      // Button background
      ctx.fillStyle = this.currentDataView === btn.key ? btn.color : 'rgba(0,0,0,0.6)';
      ctx.fillRect(panelX, btnY, buttonWidth, buttonHeight);
      
      // Button border
      ctx.strokeStyle = btn.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, btnY, buttonWidth, buttonHeight);
      
      // Button text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(btn.label, panelX + 5, btnY + 14);
      
      // Value indicator
      ctx.fillStyle = data.color;
      ctx.fillRect(panelX + buttonWidth - 15, btnY + 5, 10, 10);
    });

    // Add "Farm Guard" header
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(panelX, panelY - 25, buttonWidth, 20);
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛰️ NASA', panelX + buttonWidth/2, panelY - 10);
  }

  drawDataPanel(ctx, dataKey) {
    const data = this.nasaData[dataKey];
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 220;
    const panelHeight = 120;

    // Panel background
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border with data color
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Title
    ctx.fillStyle = data.color;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(data.description.toUpperCase(), panelX + 10, panelY + 20);

    // Main value
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    let displayValue = dataKey === 'ndvi' ? data.value : 
                      dataKey === 'temperature' ? `${data.value}°C` :
                      dataKey === 'evapotranspiration' ? `${data.value}mm` :
                      `${data.value}${dataKey === 'soilMoisture' ? '%' : 'mm'}`;
    ctx.fillText(displayValue, panelX + 10, panelY + 55);

    // Status
    ctx.fillStyle = data.color;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`Status: ${data.status}`, panelX + 10, panelY + 75);

    // Recommendation
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '10px Arial';
    this.wrapText(ctx, data.recommendation, panelX + 10, panelY + 92, panelWidth - 20, 12);

    // Close button
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(panelX + panelWidth - 25, panelY + 5, 20, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('×', panelX + panelWidth - 15, panelY + 19);
    ctx.textAlign = 'left';
  }

  drawMiniStatusBar(ctx) {
    const barX = 10;
    const barY = 165;
    const barWidth = 100;
    const barHeight = 10;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // NDVI health bar
    const healthPercent = this.nasaData.ndvi.value * 100;
    ctx.fillStyle = this.nasaData.ndvi.color;
    ctx.fillRect(barX, barY, (barWidth * healthPercent / 100), barHeight);

    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px Arial';
    ctx.fillText('Farm Health', barX, barY - 2);
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let yPos = y;

    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, yPos);
        line = word + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, x, yPos);
  }

  handleClick(mouseX, mouseY) {
    // Check button panel clicks
    const panelX = 240;
    const panelY = 10;
    const buttonWidth = 70;
    const buttonHeight = 20;
    const spacing = 5;

    const buttons = ['ndvi', 'soilMoisture', 'temperature', 'precipitation', 'evapotranspiration'];

    buttons.forEach((key, index) => {
      const btnY = panelY + (index * (buttonHeight + spacing));
      
      if (mouseX >= panelX && mouseX <= panelX + buttonWidth &&
          mouseY >= btnY && mouseY <= btnY + buttonHeight) {
        this.currentDataView = this.currentDataView === key ? null : key;
        console.log(`Viewing NASA data: ${key}`);
      }
    });

    // Check close button if panel is open
    if (this.currentDataView) {
      const closeBtnX = 10 + 220 - 25;
      const closeBtnY = 10 + 5;
      
      if (mouseX >= closeBtnX && mouseX <= closeBtnX + 20 &&
          mouseY >= closeBtnY && mouseY <= closeBtnY + 20) {
        this.currentDataView = null;
      }
    }
  }
}