// Test script to verify the fixed week calculation logic
function testFixedWeekLogic() {
  console.log("=== Testing Fixed Week Calculation Logic ===");
  
  // Simulate the new week calculation logic
  const cycleStart = new Date(2024, 7, 26); // August 26, 2024
  const cycleEnd = new Date(2024, 8, 25);   // September 25, 2024
  const totalDays = 31;
  const week1End = 8; // Based on day 02 position (Sept 2 is day 8 from start) or minimum 7
  
  console.log(`Cycle: ${cycleStart.toISOString().split('T')[0]} to ${cycleEnd.toISOString().split('T')[0]}`);
  console.log(`Total days: ${totalDays}, Week 1 ends at day: ${week1End}`);
  
  // New algorithm calculation
  const remainingDays = totalDays - week1End; // 23 days
  const fullWeeks = Math.floor(remainingDays / 7); // 23 / 7 = 3
  let remainingAfterFullWeeks = remainingDays % 7; // 23 % 7 = 2
  
  console.log(`Full weeks of 7 days: ${fullWeeks}`);
  console.log(`Remaining days after full weeks: ${remainingAfterFullWeeks}`);
  
  // Calculate week ranges
  console.log("\nWeek Ranges with Fixed Logic:");
  
  // Week 1 (unchanged)
  const week1Start = new Date(cycleStart);
  const week1EndFull = new Date(cycleStart);
  week1EndFull.setDate(cycleStart.getDate() + week1End - 1);
  console.log(`Week 1: ${week1Start.toISOString().split('T')[0]} to ${week1EndFull.toISOString().split('T')[0]} (days 1 to ${week1End})`);
  
  // Weeks 2-5
  let dayOffset = week1End;
  let remainingAfterFullWeeksForCalc = remainingAfterFullWeeks; // Keep original value for calculation
  
  for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
    let daysThisWeek;
    if (weekIndex - 1 <= fullWeeks) {
      // Atribuir 7 dias para as semanas completas (weeks 2, 3, 4 since weekIndex-1 <= 3)
      daysThisWeek = 7;
    } else {
      // For the remaining week(s), distribute remaining days
      const remainingWeeks = 5 - weekIndex + 1; // how many weeks left including this one
      daysThisWeek = Math.ceil(remainingAfterFullWeeksForCalc / remainingWeeks);
      remainingAfterFullWeeksForCalc -= daysThisWeek;
    }
    
    const weekStart = new Date(cycleStart);
    weekStart.setDate(cycleStart.getDate() + dayOffset);
    
    const weekEnd = new Date(cycleStart);
    weekEnd.setDate(cycleStart.getDate() + dayOffset + daysThisWeek - 1);
    
    console.log(`Week ${weekIndex}: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]} (days ${dayOffset + 1} to ${dayOffset + daysThisWeek}, ${daysThisWeek} days)`);
    
    dayOffset += daysThisWeek;
  }
  
  console.log("\nTesting specific dates:");
  
  // Test day 3 (Sep 3) and day 9 (Sep 9)
  const day3 = new Date(2024, 8, 3); // September 3
  const day9 = new Date(2024, 8, 9); // September 9
  
  const day3Position = Math.floor((day3.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const day9Position = Math.floor((day9.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  console.log(`Day 3 (Sep 3) position: ${day3Position}`);
  console.log(`Day 9 (Sep 9) position: ${day9Position}`);
  
  // Determine week using the new algorithm
  function findWeekForDay(daysElapsed) {
    if (daysElapsed <= week1End) {
      return 1;
    }
    
    const remainingDays = totalDays - week1End;
    const fullWeeks = Math.floor(remainingDays / 7);
    let remainingAfterFullWeeks = remainingDays % 7;
    
    const daysAfterWeek1 = daysElapsed - week1End;
    let dayCounter = 0;
    
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      let weekDays;
      if (weekIndex - 1 <= fullWeeks) {
        weekDays = 7;
      } else {
        const remainingWeeks = 5 - weekIndex + 1;
        weekDays = Math.ceil(remainingAfterFullWeeks / remainingWeeks);
        remainingAfterFullWeeks -= weekDays;
      }
      
      if (daysAfterWeek1 <= dayCounter + weekDays) {
        return weekIndex;
      }
      dayCounter += weekDays;
    }
    
    return 5;
  }
  
  const day3Week = findWeekForDay(day3Position);
  const day9Week = findWeekForDay(day9Position);
  
  console.log(`Day 3 (Sep 3) falls in week: ${day3Week}`);
  console.log(`Day 9 (Sep 9) falls in week: ${day9Week}`);
  
  console.log("\nExpected vs Actual:");
  console.log("Expected: Day 3 (Sep 3) should be in Week 2");
  console.log("Expected: Day 9 (Sep 9) should be in Week 2");
  console.log(`Actual: Day 3 in Week ${day3Week}, Day 9 in Week ${day9Week}`);
  console.log(`Fix successful: ${day3Week === 2 && day9Week === 2 ? 'YES' : 'NO'}`);
}

testFixedWeekLogic();