// Comprehensive test of the fixed week calculation logic
function comprehensiveTest() {
  console.log("=== Comprehensive Week Calculation Test ===");
  
  // Test different cycle lengths to make sure the fix works for all
  const testCycles = [
    { start: new Date(2024, 1, 26), end: new Date(2024, 2, 25), days: 28, desc: "February cycle (28 days)"}, // Feb cycle (Jan 26 to Feb 25)
    { start: new Date(2024, 6, 26), end: new Date(2024, 7, 25), days: 31, desc: "August cycle (31 days)"}, // Aug cycle (Jul 26 to Aug 25) 
    { start: new Date(2024, 3, 26), end: new Date(2024, 4, 25), days: 30, desc: "May cycle (30 days)"}, // May cycle (Apr 26 to May 25)
    { start: new Date(2024, 10, 26), end: new Date(2024, 11, 25), days: 30, desc: "December cycle (30 days)"} // Dec cycle (Nov 26 to Dec 25)
  ];
  
  for (const cycle of testCycles) {
    console.log(`\n${cycle.desc}: ${cycle.start.toISOString().split('T')[0]} to ${cycle.end.toISOString().split('T')[0]} (${cycle.days} days)`);
    
    // Calculate based on the fixed algorithm
    const week1End = 7; // Using 7 as default since day 02 logic would still apply but 7 is minimum
    
    const remainingDays = cycle.days - week1End;
    const fullWeeks = Math.floor(remainingDays / 7);
    let remainingAfterFullWeeks = remainingDays % 7;
    
    console.log(`  Week 1: days 1-${week1End}`);
    
    let dayOffset = week1End;
    let remainingAfterFullWeeksForCalc = remainingAfterFullWeeks;
    
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      let daysThisWeek;
      if (weekIndex - 1 <= fullWeeks) {
        // Atribuir 7 dias para as semanas completas
        daysThisWeek = 7;
      } else {
        // For the remaining week(s), distribute remaining days
        const remainingWeeks = 5 - weekIndex + 1; // how many weeks left including this one
        daysThisWeek = Math.ceil(remainingAfterFullWeeksForCalc / remainingWeeks);
        remainingAfterFullWeeksForCalc -= daysThisWeek;
      }
      
      // Make sure we don't exceed the total cycle days
      if (dayOffset + daysThisWeek > cycle.days) {
        daysThisWeek = cycle.days - dayOffset;
      }
      
      console.log(`  Week ${weekIndex}: days ${dayOffset + 1}-${dayOffset + daysThisWeek} (${daysThisWeek} days)`);
      
      dayOffset += daysThisWeek;
      
      // Stop if we've covered all days
      if (dayOffset >= cycle.days) {
        // Assign remaining weeks to empty or last day if needed
        for (let remainingWeek = weekIndex + 1; remainingWeek <= 5; remainingWeek++) {
          if (dayOffset < cycle.days) {
            const remainingDaysForWeek = cycle.days - dayOffset;
            console.log(`  Week ${remainingWeek}: days ${dayOffset + 1}-${cycle.days} (${remainingDaysForWeek} days)`);
            dayOffset = cycle.days;
          } else {
            console.log(`  Week ${remainingWeek}: days ${cycle.days}-${cycle.days} (0 days - assigned to last day)`);
          }
        }
        break;
      }
    }
  }
  
  console.log("\n=== Special Case: Testing Day 3 and Day 9 Placement ===");
  
  // Test the specific issue case again with actual day 2 position calculation
  console.log("Testing August 26 to September 25 cycle (31 days):");
  const augCycleStart = new Date(2024, 7, 26);
  const augCycleEnd = new Date(2024, 8, 25);
  
  // Calculate day 02 position (September 2)
  const day02Date = new Date(2024, 8, 2); // Sept 2
  const day02Position = Math.floor((day02Date.getTime() - augCycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const week1End = Math.max(day02Position, 7); // 8 in this case
  
  console.log(`  Day 02 (Sep 2) is at position ${day02Position} from cycle start`);
  console.log(`  Therefore, Week 1 ends at day ${week1End} (max of ${day02Position} or 7)`);
  
  // Calculate for day 3 (Sep 3) and day 9 (Sep 9)
  const day3Date = new Date(2024, 8, 3);
  const day9Date = new Date(2024, 8, 9);
  
  const day3Position = Math.floor((day3Date.getTime() - augCycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const day9Position = Math.floor((day9Date.getTime() - augCycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  console.log(`  Day 3 (Sep 3) is at position ${day3Position} from cycle start`);
  console.log(`  Day 9 (Sep 9) is at position ${day9Position} from cycle start`);
  
  // Apply the week finding algorithm
  function findWeekForPosition(pos) {
    if (pos <= week1End) return 1;
    
    const remainingDays = 31 - week1End; // 23 days
    const fullWeeks = Math.floor(remainingDays / 7); // 3 weeks of 7 days each
    let remainingAfterFullWeeks = remainingDays % 7; // 2 remaining days
    
    const daysAfterWeek1 = pos - week1End;
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
  
  const day3Week = findWeekForPosition(day3Position);
  const day9Week = findWeekForPosition(day9Position);
  
  console.log(`  Day 3 (Sep 3) assigned to week: ${day3Week}`);
  console.log(`  Day 9 (Sep 9) assigned to week: ${day9Week}`);
  console.log(`  Result: ${day3Week === 2 && day9Week === 2 ? 'SUCCESS - Both days in Week 2' : 'FAILURE'}`);
}

comprehensiveTest();