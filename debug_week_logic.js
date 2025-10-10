// Debug script to understand the week calculation issue
function debugWeekLogic() {
  console.log("=== DEBUG Week Calculation Logic ===");
  
  // Test a specific cycle scenario - let's say a cycle from Aug 26 to Sep 25
  // For example: August 26, 2024 to September 25, 2024
  const cycleStart = new Date(2024, 7, 26); // August 26, 2024 (month 7 = August)
  const cycleEnd = new Date(2024, 8, 25);   // September 25, 2024 (month 8 = September)
  
  console.log(`Cycle: ${cycleStart.toISOString().split('T')[0]} to ${cycleEnd.toISOString().split('T')[0]}`);
  
  const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Total days in cycle: ${totalDays}`);
  
  // Calculate day 02 position (September 2)
  const day02Date = new Date(2024, 8, 2); // September 2, 2024
  const day02Position = Math.floor((day02Date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Day 02 (Sep 2) position in cycle: ${day02Position}`);
  
  // Calculate week 1 end (max of day 02 position or 7)
  const week1End = Math.max(day02Position, 7);
  console.log(`Week 1 end: ${week1End} days from start`);
  
  // Calculate remaining days
  const remainingDays = totalDays - week1End;
  const remainingWeeksDays = Math.floor(remainingDays / 4); // 4 weeks remaining
  const extraDays = remainingDays % 4;
  console.log(`Remaining days: ${remainingDays}`);
  console.log(`Base days per remaining week: ${remainingWeeksDays}`);
  console.log(`Extra days to distribute: ${extraDays}`);
  
  // Calculate week ranges
  console.log("\nWeek Ranges:");
  
  // Week 1
  const week1Start = new Date(cycleStart);
  const week1EndFull = new Date(cycleStart);
  week1EndFull.setDate(cycleStart.getDate() + week1End - 1);
  console.log(`Week 1: ${week1Start.toISOString().split('T')[0]} to ${week1EndFull.toISOString().split('T')[0]} (days 1 to ${week1End})`);
  
  // Weeks 2-5
  let daysFromStart = week1End;
  let dayCounter = 0;
  
  for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
    const weekExtraDay = weekIndex - 1 <= extraDays ? 1 : 0;
    const weekDays = remainingWeeksDays + weekExtraDay;
    
    const weekStart = new Date(cycleStart);
    weekStart.setDate(cycleStart.getDate() + daysFromStart);
    
    const weekEnd = new Date(cycleStart);
    weekEnd.setDate(cycleStart.getDate() + daysFromStart + weekDays - 1);
    
    console.log(`Week ${weekIndex}: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]} (days ${daysFromStart + 1} to ${daysFromStart + weekDays}, ${weekDays} days)`);
    
    daysFromStart += weekDays;
    dayCounter += weekDays;
  }
  
  console.log("\nDate to Week Mapping:");
  
  // Test specific days: day 3 and day 9
  const day3 = new Date(2024, 8, 3); // September 3
  const day9 = new Date(2024, 8, 9); // September 9
  
  // Calculate their positions in the cycle
  const day3Position = Math.floor((day3.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const day9Position = Math.floor((day9.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  console.log(`Day 3 (Sep 3) position: ${day3Position}`);
  console.log(`Day 9 (Sep 9) position: ${day9Position}`);
  
  // Determine which week they fall into
  let day3Week, day9Week;
  
  if (day3Position <= week1End) {
    day3Week = 1;
  } else {
    const daysAfterWeek1 = day3Position - week1End;
    let dayCounter = 0;
    
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      const weekExtraDay = weekIndex - 1 <= extraDays ? 1 : 0;
      const weekDays = remainingWeeksDays + weekExtraDay;
      
      if (daysAfterWeek1 <= dayCounter + weekDays) {
        day3Week = weekIndex;
        break;
      }
      dayCounter += weekDays;
    }
  }
  
  if (day9Position <= week1End) {
    day9Week = 1;
  } else {
    const daysAfterWeek1 = day9Position - week1End;
    let dayCounter = 0;
    
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      const weekExtraDay = weekIndex - 1 <= extraDays ? 1 : 0;
      const weekDays = remainingWeeksDays + weekExtraDay;
      
      if (daysAfterWeek1 <= dayCounter + weekDays) {
        day9Week = weekIndex;
        break;
      }
      dayCounter += weekDays;
    }
  }
  
  console.log(`Day 3 (Sep 3) should be in week: ${day3Week}`);
  console.log(`Day 9 (Sep 9) should be in week: ${day9Week}`);
  
  // Let's also test what should happen according to your expected logic
  console.log("\nExpected Logic:");
  console.log("Week 1: Aug 26 to Sep 2");
  console.log("Week 2: Sep 3 to Sep 9");
  console.log("Week 3: Sep 10 to Sep 16");
  console.log("...");
  
  // Test if our algorithm matches this expectation
  const expectedDay3Week = day3Position >= 8 && day3Position <= 14 ? 2 : "Not in expected range";
  const expectedDay9Week = day9Position >= 8 && day9Position <= 14 ? 2 : "Not in expected range";
  
  console.log(`Expected day 3 (Sep 3) in week: ${expectedDay3Week}`);
  console.log(`Expected day 9 (Sep 9) in week: ${expectedDay9Week}`);
}

debugWeekLogic();