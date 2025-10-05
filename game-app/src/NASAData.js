// NASAData.js
export class NASAData {
  constructor() {
    this.currentWeekIndex = 0;
    this.cropHealth = 100;
    this.money = 100000; // Starting money
    
    // Simulated weekly data based on NASA POWER parameters
    this.weeklyData = [
      { week: 1, date: "Jan 7", moisture: 0.75, cost: 12000 },
      { week: 2, date: "Jan 14", moisture: 0.68, cost: 15000 },
      { week: 3, date: "Jan 21", moisture: 0.55, cost: 18000 },
      { week: 4, date: "Jan 28", moisture: 0.45, cost: 22000 },
      { week: 5, date: "Feb 4", moisture: 0.72, cost: 13000 },
      { week: 6, date: "Feb 11", moisture: 0.62, cost: 16000 },
      { week: 7, date: "Feb 18", moisture: 0.50, cost: 20000 },
      { week: 8, date: "Feb 25", moisture: 0.38, cost: 25000 },
      { week: 9, date: "Mar 4", moisture: 0.70, cost: 14000 },
      { week: 10, date: "Mar 11", moisture: 0.58, cost: 17000 },
      { week: 11, date: "Mar 18", moisture: 0.48, cost: 21000 },
      { week: 12, date: "Mar 25", moisture: 0.65, cost: 15000 },
      { week: 13, date: "Apr 1", moisture: 0.60, cost: 16500 },
      { week: 14, date: "Apr 8", moisture: 0.52, cost: 19000 },
      { week: 15, date: "Apr 15", moisture: 0.67, cost: 15500 },
      { week: 16, date: "Apr 22", moisture: 0.63, cost: 15000 }
    ];
  }
  
  getCurrentWeek() {
    return this.weeklyData[this.currentWeekIndex];
  }
  
  irrigate() {
    const currentWeek = this.getCurrentWeek();
    
    // Check if player has enough money
    if (this.money < currentWeek.cost) {
      return { success: false, message: "Not enough money" };
    }
    
    // Deduct cost
    this.money -= currentWeek.cost;
    
    // Improve crop health
    this.cropHealth = Math.min(100, this.cropHealth + 10);
    
    return { success: true, healthGain: 10 };
  }
  
  skipIrrigation() {
    const currentWeek = this.getCurrentWeek();
    
    // Check moisture level
    // If moisture is between 63% and 67%, no penalty
    if (currentWeek.moisture >= 0.63 && currentWeek.moisture <= 0.67) {
      // Adequate moisture, no health loss
      return { healthLoss: 0, adequate: true };
    }
    
    // If moisture is below 65%, apply penalty
    if (currentWeek.moisture < 0.65) {
      this.cropHealth = Math.max(0, this.cropHealth - 15);
      return { healthLoss: 15, adequate: false };
    }
    
    // If moisture is above 67%, it's good
    return { healthLoss: 0, adequate: true };
  }
  
  advanceWeek() {
    this.currentWeekIndex++;
    
    // Check if game is complete
    if (this.currentWeekIndex >= this.weeklyData.length) {
      return { gameOver: true, won: true };
    }
    
    return { gameOver: false };
  }
  
  checkGameOver() {
    // Check if crops died
    if (this.cropHealth <= 0) {
      return { gameOver: true, reason: 'crop_death' };
    }
    
    // Check if player is bankrupt
    const remainingWeeks = this.weeklyData.slice(this.currentWeekIndex);
    const minCost = Math.min(...remainingWeeks.map(w => w.cost));
    
    if (this.money < minCost && this.currentWeekIndex < this.weeklyData.length - 1) {
      return { gameOver: true, reason: 'bankruptcy' };
    }
    
    return { gameOver: false };
  }
  
  reset() {
    this.currentWeekIndex = 0;
    this.cropHealth = 100;
    this.money = 100000;
  }
}