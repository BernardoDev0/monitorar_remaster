// Debug test to understand the exact flow
function debugWeekCalculation() {
  const today = new Date('2025-10-06'); // Usando a data de hoje para simulação
  console.log(`Calculating for date: ${today.toISOString().split('T')[0]}`);
  console.log(`Day of month: ${today.getDate()}`);
  
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  console.log(`Current: ${currentDay}/${currentMonth}/${currentYear}`);
  
  // Determinar início do ciclo atual (dia 26)
  let cycleYear = currentYear;
  let cycleMonth = currentMonth;

  // Se dia >= 26, estamos no ciclo que COMEÇA neste mês e termina no próximo
  // Se dia < 26, estamos no ciclo que COMEÇOU no mês anterior e termina neste mês
  if (currentDay >= 26) {
    // Estamos no ciclo que COMEÇA neste mês (ex: 26/Set a 25/Out)
    console.log('Today >= 26, so we are in the cycle that starts this month');
    cycleMonth = currentMonth;
  } else {
    // Estamos no ciclo que TERMINA neste mês (ex: 26/Ago a 25/Set)
    console.log('Today < 26, so we are in the cycle that ends this month');
    cycleMonth -= 1;
    if (cycleMonth < 1) {
      cycleMonth = 12;
      cycleYear -= 1;
    }
  }
  
  console.log(`Cycle month: ${cycleMonth}/${cycleYear}`);
  
  // Calcular início e fim do ciclo
  const cycleStart = new Date(cycleYear, cycleMonth - 1, 26);
  const cycleEnd = new Date(cycleYear, cycleMonth, 25); // Mês seguinte, dia 25
  
  console.log(`Cycle: ${cycleStart.toISOString().split('T')[0]} to ${cycleEnd.toISOString().split('T')[0]}`);
  
  // Para Outubro 6, 2025:
  // currentDay = 6 < 26, então cycleMonth = 10 - 1 = 9 (Setembro)
  // cycleYear = 2025
  // ciclo: 26/Set/2025 a 25/Out/2025
  // total dias = 30
  
  // Calcular total de dias no ciclo
  const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Total days in cycle: ${totalDays}`);
  
  // Calcular dias decorridos desde o início do ciclo para o dia 02 de outubro
  const day02Date = new Date(2025, 9, 2); // October 2, 2025 (month is 0-indexed)
  const day02PositionInCycle = Math.floor((day02Date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`October 2 position in cycle: ${day02PositionInCycle}`);
  
  // Calcular dias decorridos para o dia atual (Oct 6)
  const daysElapsed = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Today (Oct 6) position in cycle: ${daysElapsed}`);
  
  // Calcular tamanho da semana 1
  const week1End = Math.max(day02PositionInCycle, 7);
  console.log(`Week 1 end: ${week1End} days from start of cycle`);
  
  // Determinar semana para Oct 2
  if (day02PositionInCycle <= week1End) {
    console.log(`✅ October 2 (day ${day02PositionInCycle}) is in Week 1`);
  } else {
    console.log(`❌ October 2 (day ${day02PositionInCycle}) is NOT in Week 1`);
  }
  
  // Determinar semana para Oct 6
  if (daysElapsed <= week1End) {
    console.log(`Today (Oct 6, day ${daysElapsed}) would be in Week 1`);
  } else {
    console.log(`Today (Oct 6, day ${daysElapsed}) would be in Week 2 or later`);
  }
  
  // Listar as datas do ciclo
  console.log('\nAll cycle dates:');
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(cycleStart);
    date.setDate(cycleStart.getDate() + i);
    const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
    console.log(`  Day ${i+1}: ${date.toISOString().split('T')[0]} (${dayOfWeek})`);
  }
}

debugWeekCalculation();