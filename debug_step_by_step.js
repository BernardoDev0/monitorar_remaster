// Debug script to trace step by step week calculation
function debugStepByStep() {
  console.log("=== Step-by-step Week Calculation Debug ===");
  
  // Example cycle: Aug 26 to Sep 25 (31 days)
  const cycleStart = new Date(2024, 7, 26); // August 26, 2024
  const totalDays = 31;
  const week1End = 8; // Based on day 02 position or minimum 7
  console.log(`Total days in cycle: ${totalDays}`);
  console.log(`Week 1 ends after ${week1End} days`);
  
  const remainingDays = totalDays - week1End; // 31 - 8 = 23
  const remainingWeeksDays = Math.floor(remainingDays / 4); // 23 / 4 = 5 (rounded down)
  const extraDays = remainingDays % 4; // 23 % 4 = 3
  
  console.log(`Remaining days for weeks 2-5: ${remainingDays}`);
  console.log(`Base days per remaining week: ${remainingWeeksDays}`);
  console.log(`Extra days to distribute: ${extraDays}`);
  
  console.log("\nDistribution of extra days:");
  for (let i = 2; i <= 5; i++) {
    const weekExtraDay = i - 1 <= extraDays ? 1 : 0; 
    const weekDays = remainingWeeksDays + weekExtraDay;
    console.log(`  Week ${i}: base ${remainingWeeksDays} + ${weekExtraDay} extra = ${weekDays} days`);
  }
  
  console.log("\nCalculating actual week ranges:");
  let daysFromStart = week1End; // Start from day after week 1
  let dayCounter = 0;
  
  for (let i = 2; i <= 5; i++) {
    const weekExtraDay = i - 1 <= extraDays ? 1 : 0;
    const weekDays = remainingWeeksDays + weekExtraDay;
    
    console.log(`\nProcessing Week ${i}:`);
    console.log(`  Before processing: daysFromStart=${daysFromStart}, dayCounter=${dayCounter}`);
    
    if (i < 3) { // week 2, only accumulate for weeks before week 3
      dayCounter += weekDays;
      console.log(`  Week ${i} < 3, accumulating: dayCounter=${dayCounter} (adding ${weekDays})`);
    } else if (i === 3) { // week 3, this is where we calculate its start
      console.log(`  Week ${i} === 3, setting daysFromStart = week1End + dayCounter = ${week1End} + ${dayCounter} = ${week1End + dayCounter}`);
      daysFromStart += dayCounter;
      
      const weekStartDate = new Date(cycleStart);
      weekStartDate.setDate(cycleStart.getDate() + daysFromStart);
      
      const weekEndDate = new Date(cycleStart);
      weekEndDate.setDate(cycleStart.getDate() + daysFromStart + weekDays - 1);
      
      console.log(`  Week ${i} starts at day position: ${daysFromStart + 1} (from start: ${daysFromStart})`);
      console.log(`  Week ${i} has ${weekDays} days`);
      console.log(`  Week ${i} date range: ${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}`);
      
      console.log(`  Week ${i} includes day positions: ${daysFromStart + 1} to ${daysFromStart + weekDays}`);
    }
  }
  
  console.log("\nFor day position 15 (Sep 9):");
  console.log("- Day 9 position: 15");
  console.log("- Week 1 covers: 1 to 8");
  console.log("- After week 1: starting from position 9");
  console.log("- Week 2: 9 to 14 (6 days) - positions 9-14");
  console.log("- Week 3: 15 to 20 (6 days) - positions 15-20");
  console.log("- So day position 15 (Sep 9) falls in Week 3!");
  console.log("\nBUT it should fall in Week 2 if following: Sep 3-9");
}

debugStepByStep();