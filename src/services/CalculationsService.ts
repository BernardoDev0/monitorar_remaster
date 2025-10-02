// Portando lógica do utils/calculations.py para TypeScript
// Mantendo a lógica original de semanas 26→25

import { formatDateISO, formatDateBR, generateMonthKey } from '@/lib/date-utils';

export interface WeekDates {
  start: string;
  end: string;
}

export interface MonthCycleDates {
  start: string;
  end: string;
}

export class CalculationsService {
  // Nomes dos meses em PT-BR (0-based)
  static readonly MONTH_NAMES_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Retorna a chave MM/YYYY do mês da EMPRESA (26→25) para uma data específica
  static getCompanyMonthKeyFromDate(date: Date): string {
    const day = date.getDate();
    let month = date.getMonth() + 1; // 1..12 (mês base da data)
    let year = date.getFullYear();

    // Dias 26..31 pertencem ao mês seguinte (mês de término)
    if (day >= 26) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return `${month.toString().padStart(2, '0')}/${year}`;
  }

  // Retorna o nome do mês PT-BR dado o índice 1..12
  static getMonthNamePT(month1to12: number): string {
    return this.MONTH_NAMES_PT[(month1to12 - 1 + 12) % 12];
  }
  
  /**
   * Obtém início do ciclo atual (dia 26)
   */
  static getCurrentCycleStart(): Date {
    const today = new Date();
    const currentDay = today.getDate();
    let cycleYear = today.getFullYear();
    let cycleMonth = today.getMonth() + 1;

    // Se já passou do dia 25, estamos no próximo ciclo
    if (currentDay >= 26) {
      // Estamos no próximo ciclo - manter mês atual
      cycleMonth = today.getMonth() + 1;
    } else {
      // Ainda no ciclo anterior - ir para mês anterior
      cycleMonth -= 1;
      if (cycleMonth < 1) {
        cycleMonth = 12;
        cycleYear -= 1;
      }
    }

    return new Date(cycleYear, cycleMonth - 1, 26);
  }

  // Lógica original: getWeekDates() do calculations.py
  static getWeekDates(weekStr: string): WeekDates {
    const weekNum = parseInt(weekStr);
    if (weekNum < 1 || weekNum > 5) {
      throw new Error('Semana deve estar entre 1 e 5');
    }

    const today = new Date();
    // FORÇAR timezone de São Paulo para funcionar no Vercel
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentDay = saoPauloDate.getDate();
    const currentMonth = saoPauloDate.getMonth() + 1; // 1-12
    const currentYear = saoPauloDate.getFullYear();
    
    // Usar a mesma lógica do getMonthCycleDates()
    let endMonth: number;
    let endYear: number;
    
    if (currentDay >= 1 && currentDay <= 25) {
      // Dias 1-25: estamos no ciclo que TERMINA no mês atual
      endMonth = currentMonth;
      endYear = currentYear;
    } else {
      // Dias 26-31: estamos no ciclo que TERMINA no próximo mês
      endMonth = currentMonth + 1;
      endYear = currentYear;
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
    }

    // Início do ciclo: dia 26 do mês anterior ao mês de término
    let startMonth = endMonth - 1;
    let startYear = endYear;
    if (startMonth < 1) {
      startMonth = 12;
      startYear -= 1;
    }
    
    const cycleStart = new Date(startYear, startMonth - 1, 26);
    const cycleEnd = new Date(endYear, endMonth - 1, 25);
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // CORREÇÃO: Semana 1 SEMPRE tem 7 dias, as outras se ajustam
    let weekStartDate = new Date(cycleStart);
    let daysToAdd = 0;
    let weekDays: number;
    
    if (weekNum === 1) {
      // Semana 1: FORÇAR 7 dias (26/09 até 02/10)
      weekDays = 7;
      daysToAdd = 0; // Começa no início do ciclo
      
      // FORÇAR o fim da semana 1 para ser exatamente 7 dias após o início
      const weekEndDate = new Date(cycleStart);
      weekEndDate.setDate(cycleStart.getDate() + 6); // +6 porque inclui o dia inicial
      
      console.log('🔧 SEMANA 1 FORÇADA:');
      console.log('🔧 Início:', formatDateISO(cycleStart));
      console.log('🔧 Fim:', formatDateISO(weekEndDate));
      console.log('🔧 Dias calculados:', Math.floor((weekEndDate.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      return {
        start: formatDateISO(cycleStart),
        end: formatDateISO(weekEndDate)
      };
    } else {
      // Para semanas 2-5: distribuir os dias restantes
      const remainingDays = totalDays - 7; // Dias após a semana 1
      const remainingWeeks = 4; // Semanas 2, 3, 4, 5
      const baseDaysPerWeek = Math.floor(remainingDays / remainingWeeks);
      const extraDays = remainingDays % remainingWeeks;
      
      // Semana 1 já tem 7 dias
      daysToAdd = 7;
      
      // Somar dias das semanas anteriores (2 até weekNum-1)
      for (let i = 2; i < weekNum; i++) {
        const weekDaysForLoop = baseDaysPerWeek + (i - 1 <= extraDays ? 1 : 0);
        daysToAdd += weekDaysForLoop;
      }
      
      // Calcular dias desta semana
      weekDays = baseDaysPerWeek + (weekNum - 1 <= extraDays ? 1 : 0);
    }
    
    weekStartDate.setDate(cycleStart.getDate() + daysToAdd);
    
    console.log('🔧 CÁLCULO SEMANA:', weekNum);
    console.log('🔧 Total dias no ciclo:', totalDays);
    console.log('🔧 Dias por semana base:', Math.floor(totalDays / 5));
    console.log('🔧 Dias extras:', totalDays % 5);
    console.log('🔧 Dias desta semana:', weekDays);
    console.log('🔧 Início da semana:', weekStartDate.toISOString().split('T')[0]);
    console.log('🔧 Fim da semana:', new Date(weekStartDate.getTime() + (weekDays - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + weekDays - 1);

    return {
      start: formatDateISO(weekStartDate),
      end: formatDateISO(weekEndDate)
    };
  }

  // Obter semana atual baseada no ciclo 26→25 (LÓGICA CORRIGIDA)
  static getCurrentWeek(): number {
    const today = new Date();
    // FORÇAR timezone de São Paulo para funcionar no Vercel
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentDay = saoPauloDate.getDate();
    const currentMonth = saoPauloDate.getMonth() + 1;
    const currentYear = saoPauloDate.getFullYear();

    // Usar a mesma lógica do getMonthCycleDates()
    let endMonth: number;
    let endYear: number;
    
    if (currentDay >= 1 && currentDay <= 25) {
      // Dias 1-25: estamos no ciclo que TERMINA no mês atual
      endMonth = currentMonth;
      endYear = currentYear;
    } else {
      // Dias 26-31: estamos no ciclo que TERMINA no próximo mês
      endMonth = currentMonth + 1;
      endYear = currentYear;
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
    }

    // Início do ciclo: dia 26 do mês anterior ao mês de término
    let startMonth = endMonth - 1;
    let startYear = endYear;
    if (startMonth < 1) {
      startMonth = 12;
      startYear -= 1;
    }

    // Calcular início e fim do ciclo
    const cycleStart = new Date(startYear, startMonth - 1, 26);
    const cycleEnd = new Date(endYear, endMonth - 1, 25);
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular dias decorridos desde o início
    const daysElapsed = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Distribuir em 5 semanas de forma equilibrada
    const daysPerWeek = Math.floor(totalDays / 5);
    const extraDays = totalDays % 5;
    
    // Calcular semana atual
    let week = 1;
    let daysCount = 0;
    
    for (let i = 1; i <= 5; i++) {
      const weekDays = daysPerWeek + (i <= extraDays ? 1 : 0);
      daysCount += weekDays;
      
      if (daysElapsed <= daysCount) {
        week = i;
        break;
      }
    }
    
    return Math.min(Math.max(week, 1), 5);
  }

  // Obter datas do ciclo mensal (26→25)
  // CONVENÇÃO: o parâmetro 'month' representa o MÊS DE TÉRMINO do ciclo (ex.: Setembro => 26/Ago a 25/Set)
  static getMonthCycleDates(month?: number, year?: number): MonthCycleDates {
    const today = new Date();
    // FORÇAR timezone de São Paulo para funcionar no Vercel
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

    // Determinar mês/ano de término do ciclo
    let endMonth: number;
    let endYear: number;

    if (month && year) {
      endMonth = month; // mês de término informado (1-12)
      endYear = year;
    } else {
      // CORREÇÃO FINAL: Lógica baseada no LOGICA_CICLO_EMPRESA.md
      // Dias 1-25 pertencem ao mês corrente (mês de término)
      // Dias 26-31 pertencem ao mês seguinte (mês de término)
      const currentDay = saoPauloDate.getDate();
      const currentMonth = saoPauloDate.getMonth() + 1; // 1-12
      const currentYear = saoPauloDate.getFullYear();
      
      if (currentDay >= 1 && currentDay <= 25) {
        // Dias 1-25: estamos no ciclo que TERMINA no mês atual
        endMonth = currentMonth;
        endYear = currentYear;
      } else {
        // Dias 26-31: estamos no ciclo que TERMINA no próximo mês
        endMonth = currentMonth + 1;
        endYear = currentYear;
        if (endMonth > 12) {
          endMonth = 1;
          endYear += 1;
        }
      }
    }

    // Início do ciclo: dia 26 do mês anterior ao mês de término
    let startMonth = endMonth - 1;
    let startYear = endYear;
    if (startMonth < 1) {
      startMonth = 12;
      startYear -= 1;
    }

    const cycleStart = new Date(startYear, startMonth - 1, 26);
    const cycleEnd = new Date(endYear, endMonth - 1, 25);

    console.log('🔧 CICLO MENSAL CALCULADO (CORRIGIDO):');
    console.log('🔧 Data atual:', saoPauloDate.toISOString().split('T')[0]);
    console.log('🔧 Dia atual:', saoPauloDate.getDate());
    console.log('🔧 Mês de término:', endMonth, '/', endYear);
    console.log('🔧 Início do ciclo:', formatDateISO(cycleStart));
    console.log('🔧 Fim do ciclo:', formatDateISO(cycleEnd));

    return {
      start: formatDateISO(cycleStart),
      end: formatDateISO(cycleEnd)
    };
  }

  // Determinar semana de uma data específica (baseado no ciclo 26→25)
  static getWeekFromDate(dateStr: string): number {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Usar a mesma lógica do getMonthCycleDates()
    let endMonth: number;
    let endYear: number;
    
    if (day >= 1 && day <= 25) {
      // Dias 1-25: estamos no ciclo que TERMINA no mês atual
      endMonth = month;
      endYear = year;
    } else {
      // Dias 26-31: estamos no ciclo que TERMINA no próximo mês
      endMonth = month + 1;
      endYear = year;
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
    }

    // Início do ciclo: dia 26 do mês anterior ao mês de término
    let startMonth = endMonth - 1;
    let startYear = endYear;
    if (startMonth < 1) {
      startMonth = 12;
      startYear -= 1;
    }

    // Calcular início e fim do ciclo
    const cycleStart = new Date(startYear, startMonth - 1, 26);
    const cycleEnd = new Date(endYear, endMonth - 1, 25);
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular dias decorridos desde o início
    const daysElapsed = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Distribuir em 5 semanas de forma equilibrada
    const daysPerWeek = Math.floor(totalDays / 5);
    const extraDays = totalDays % 5;
    
    // Calcular semana atual
    let week = 1;
    let daysCount = 0;
    
    for (let i = 1; i <= 5; i++) {
      const weekDays = daysPerWeek + (i <= extraDays ? 1 : 0);
      daysCount += weekDays;
      
      if (daysElapsed <= daysCount) {
        week = i;
        break;
      }
    }
    
    return Math.min(Math.max(week, 1), 5);
  }

  // Semanas disponíveis (sempre 1-5)
  static getAvailableWeeks(): string[] {
    return ['1', '2', '3', '4', '5'];
  }

  // Calcular meta diária baseada no funcionário
  static getDailyGoal(employee: { username: string; weekly_goal?: number }): number {
    // Lógica original: Matheus (E89P) tem meta especial
    if (employee.username === 'E89P') {
      return 535; // 2675 / 5 dias
    }
    return 475; // 2375 / 5 dias (meta padrão)
  }

  static getWeeklyGoal(employee: { username: string; weekly_goal?: number }): number {
    if (employee.username === 'E89P') {
      return 2675; // 5 * 535
    }
    return 2375; // 5 * 475
  }

  // Calcular meta mensal baseada no funcionário
  static getMonthlyGoal(employee: { username: string }): number {
    // Lógica original do employee.py
    if (employee.username === 'E89P') {
      return 10500;
    }
    return 9500;
  }

  // Calcular porcentagem de progresso
  static calculateProgressPercentage(current: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.round((current / goal) * 100 * 10) / 10; // Rounded to 1 decimal
  }

  static getEmployeeStatus(progressPercentage: number): 'at-risk' | 'on-track' | 'top-performer' {
    if (progressPercentage < 50) return 'at-risk';
    if (progressPercentage < 100) return 'on-track';
    return 'top-performer';
  }

  // Formatação utilitária
  static formatDateBR(dateStr: string): string {
    return formatDateBR(dateStr);
  }

  static formatDateForKey(date: Date): string {
    return generateMonthKey(date);
  }

  // Método interno para formatação - usando date-utils
  private static formatDateInternal(date: Date): string {
    return formatDateBR(date.toISOString());
  }

  static formatTimestampBR(dateStr: string): { date: string; time: string } {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
  }
}