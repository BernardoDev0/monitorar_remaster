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

  // Lógica: getWeekDates() do calculations.py - CORRIGIDA PARA GARANTIR 26-02 NA SEMANA 1 e distribuição mais lógica de semanas
  static getWeekDates(weekStr: string): WeekDates {
    const weekNum = parseInt(weekStr);
    if (weekNum < 1 || weekNum > 5) {
      throw new Error('Semana deve estar entre 1 e 5');
    }

    const today = new Date();
    // FORÇAR timezone de São Paulo para consistência com outros métodos
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentMonth = saoPauloDate.getMonth() + 1;
    const currentYear = saoPauloDate.getFullYear();
    
    // Lógica baseada no ciclo 26→25
    let cycleYear = currentYear;
    let cycleMonth = currentMonth;

    // Se dia >= 26, estamos no ciclo que COMEÇA neste mês e termina no próximo
    // Se dia < 26, estamos no ciclo que COMEÇOU no mês anterior e termina neste mês
    if (saoPauloDate.getDate() >= 26) {
      // Manter mês atual - já está no próximo ciclo
      cycleMonth = currentMonth;
    } else {
      // Ir para ciclo anterior
      cycleMonth -= 1;
      if (cycleMonth < 1) {
        cycleMonth = 12;
        cycleYear -= 1;
      }
    }

    // Calcular início e fim do ciclo
    const cycleStart = new Date(cycleYear, cycleMonth - 1, 26);
    const cycleEnd = new Date(cycleYear, cycleMonth, 25); // Mês seguinte, dia 25
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // LÓGICA SIMPLES: Garantir que o período 26-(02 ou 07) esteja na Semana 1
    // Para garantir que 26-02 fique na semana 1, vamos considerar que a semana 1 tem pelo menos 7 dias
    // ou até o dia 02 do mês, o que for maior
    const day02Date = new Date(cycleYear, cycleMonth - 1, 2); // Dia 02 do mês de término
    
    // Calcular a posição do dia 02 no ciclo
    const day02Position = Math.floor((day02Date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular o final da semana 1 para garantir que o dia 02 esteja incluído
    // A semana 1 vai até o maior entre: posição do dia 02 ou 7 dias (para cobrir 26-02)
    const week1End = Math.max(day02Position, 7);
    
    // Calcular datas para a semana solicitada
    if (weekNum === 1) {
      // Semana 1: do início do ciclo até week1End
      const weekStartDate = new Date(cycleStart);
      const weekEndDate = new Date(cycleStart);
      weekEndDate.setDate(cycleStart.getDate() + week1End - 1);
      
      return {
        start: formatDateISO(weekStartDate),
        end: formatDateISO(weekEndDate)
      };
    } else {
      // Distribuir os dias restantes nas semanas 2-5 de forma mais lógica (semanas de 7 dias com ajustes no final)
      const remainingDays = totalDays - week1End;
      // Aproximadamente 7 dias por semana, mas ajustando para o número total
      const targetDaysPerWeek = 7;
      
      // Calcular quantos dias completos de 7 dias podemos ter e quantos dias sobram
      const fullWeeks = Math.floor(remainingDays / 7);
      let remainingAfterFullWeeks = remainingDays % 7;
      
      // Ajustar distribuição para que semanas 2-5 tenham no máximo 7 dias cada, 
      // com os dias extras distribuídos no final
      let dayOffset = week1End; // Começar após o fim da semana 1
      
      // Calcular o início e fim da semana solicitada
      for (let i = 2; i <= 5; i++) {
        if (i === weekNum) {
          // Para cada semana após a primeira, tentar alocar 7 dias
          let daysThisWeek;
          if (i - 1 <= fullWeeks) {
            // Atribuir 7 dias para as semanas completas
            daysThisWeek = 7;
          } else {
            // Para semanas extras, distribuir os dias restantes
            const remainingWeeks = 5 - i + 1; // quantas semanas faltam incluindo esta
            daysThisWeek = Math.ceil(remainingAfterFullWeeks / remainingWeeks);
            remainingAfterFullWeeks -= daysThisWeek;
          }
          
          // Certificar que não ultrapassa o final do ciclo
          if (dayOffset + daysThisWeek > totalDays) {
            daysThisWeek = totalDays - dayOffset;
          }
          
          if (daysThisWeek <= 0) {
            // Se não tem mais dias, retornar o último dia do ciclo
            const weekStartDate = new Date(cycleStart);
            weekStartDate.setDate(cycleStart.getDate() + dayOffset);
            
            const weekEndDate = new Date(cycleEnd); // ultimo dia do ciclo
            return {
              start: formatDateISO(weekStartDate),
              end: formatDateISO(weekEndDate)
            };
          }
          
          const weekStartDate = new Date(cycleStart);
          weekStartDate.setDate(cycleStart.getDate() + dayOffset);
          
          const weekEndDate = new Date(cycleStart);
          weekEndDate.setDate(cycleStart.getDate() + dayOffset + daysThisWeek - 1);

          return {
            start: formatDateISO(weekStartDate),
            end: formatDateISO(weekEndDate)
          };
        }
        
        // Calcular dias para a semana atual para avançar o offset
        let daysThisWeek;
        if (i - 1 <= fullWeeks) {
          // Atribuir 7 dias para as semanas completas
          daysThisWeek = 7;
        } else {
          // Para semanas extras, distribuir os dias restantes
          const remainingWeeks = 5 - i + 1; // quantas semanas faltam incluindo esta
          daysThisWeek = Math.ceil(remainingAfterFullWeeks / remainingWeeks);
          remainingAfterFullWeeks = remainingAfterFullWeeks - daysThisWeek;
        }
        
        // Certificar que não ultrapassa o final do ciclo
        if (dayOffset + daysThisWeek > totalDays) {
          daysThisWeek = totalDays - dayOffset;
        }
        
        dayOffset += daysThisWeek;
      }
      
      // Se saiu do loop sem retornar, retornar a última semana (semana 5)
      const weekStartDate = new Date(cycleStart);
      weekStartDate.setDate(cycleStart.getDate() + dayOffset);
      
      const weekEndDate = new Date(cycleEnd); // ultimo dia do ciclo
      return {
        start: formatDateISO(weekStartDate),
        end: formatDateISO(weekEndDate)
      };
    }
  }

  // Obter semana atual baseada no ciclo 26→25 (LÓGICA CORRIGIDA PARA GARANTIR 26-02 NA SEMANA 1 e distribuição mais lógica de semanas)
  static getCurrentWeek(): number {
    const today = new Date();
    // FORÇAR timezone de São Paulo para funcionar no Vercel
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentDay = saoPauloDate.getDate();
    const currentMonth = saoPauloDate.getMonth() + 1;
    const currentYear = saoPauloDate.getFullYear();

    // Determinar início do ciclo atual (dia 26)
    let cycleYear = currentYear;
    let cycleMonth = currentMonth;

    // Se dia >= 26, estamos no ciclo que COMEÇA neste mês e termina no próximo
    // Se dia < 26, estamos no ciclo que COMEÇOU no mês anterior e termina neste mês
    if (currentDay >= 26) {
      // Estamos no ciclo que COMEÇA neste mês (ex: 26/Set a 25/Out)
      cycleMonth = currentMonth;
    } else {
      // Estamos no ciclo que TERMINA neste mês (ex: 26/Ago a 25/Set)
      cycleMonth -= 1;
      if (cycleMonth < 1) {
        cycleMonth = 12;
        cycleYear -= 1;
      }
    }

    // Calcular início e fim do ciclo
    const cycleStart = new Date(cycleYear, cycleMonth - 1, 26);
    const cycleEnd = new Date(cycleYear, cycleMonth, 25); // Mês seguinte, dia 25
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular dias decorridos desde o início do ciclo
    const daysElapsed = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // LÓGICA SIMPLES: Garantir que o período 26-(02 ou 07) esteja na Semana 1
    // Para garantir que 26-02 fique na semana 1, vamos considerar que a semana 1 tem pelo menos 7 dias
    // ou até o dia 02 do mês, o que for maior
    const day02Date = new Date(cycleYear, cycleMonth - 1, 2); // Dia 02 do mês de término
    
    // Calcular a posição do dia 02 no ciclo
    const day02Position = Math.floor((day02Date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular o final da semana 1 para garantir que o dia 02 esteja incluído
    // A semana 1 vai até o maior entre: posição do dia 02 ou 7 dias (para cobrir 26-02)
    const week1End = Math.max(day02Position, 7);
    
    if (daysElapsed <= week1End) {
      return 1;
    }
    
    // Distribuir os dias restantes nas semanas 2-5 de forma mais lógica (semanas de 7 dias com ajustes no final)
    const remainingDays = totalDays - week1End;
    // Aproximadamente 7 dias por semana, mas ajustando para o número total
    const targetDaysPerWeek = 7;
    
    // Calcular quantos dias completos de 7 dias podemos ter e quantos dias sobram
    const fullWeeks = Math.floor(remainingDays / 7);
    let remainingAfterFullWeeks = remainingDays % 7;
    
    // Calcular a semana para dias após a semana 1
    const daysAfterWeek1 = daysElapsed - week1End;
    
    // Percorrer semanas 2-5 para encontrar a correta
    let dayCounter = 0; // Dias acumulados após a semana 1
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      let weekDays;
      if (weekIndex - 1 <= fullWeeks) {
        // Atribuir 7 dias para as semanas completas
        weekDays = 7;
      } else {
        // Para semanas extras, distribuir os dias restantes
        const remainingWeeks = 5 - weekIndex + 1; // quantas semanas faltam incluindo esta
        weekDays = Math.ceil(remainingAfterFullWeeks / remainingWeeks);
        remainingAfterFullWeeks -= weekDays;
      }
      
      if (daysAfterWeek1 <= dayCounter + weekDays) {
        return weekIndex;
      }
      dayCounter += weekDays;
    }
    
    // Caso não encaixe em nenhuma semana anterior (deveria ser semana 5)
    return 5;
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
      // CORREÇÃO: Ciclo atual sempre termina no mês atual (se hoje é outubro, ciclo termina em outubro)
      endMonth = saoPauloDate.getMonth() + 1;
      endYear = saoPauloDate.getFullYear();
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

    return {
      start: formatDateISO(cycleStart),
      end: formatDateISO(cycleEnd)
    };
  }

  // Determinar semana de uma data específica (baseado no ciclo 26→25) - CORRIGIDO
  static getWeekFromDate(dateStr: string): number {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Encontrar início do ciclo mensal para esta data (sempre dia 26)
    let cycleYear = year;
    let cycleMonth = month;

    // Se dia >= 26, estamos no ciclo que COMEÇA neste mês e termina no próximo
    // Se dia < 26, estamos no ciclo que COMEÇOU no mês anterior e termina neste mês
    if (day >= 26) {
      // Manter mês atual - já está no próximo ciclo
      cycleMonth = month;
    } else {
      // Ir para ciclo anterior
      cycleMonth -= 1;
      if (cycleMonth < 1) {
        cycleMonth = 12;
        cycleYear -= 1;
      }
    }

    // Calcular início e fim do ciclo
    const cycleStart = new Date(cycleYear, cycleMonth - 1, 26);
    const cycleEnd = new Date(cycleYear, cycleMonth, 25); // Mês seguinte, dia 25
    
    // Calcular total de dias no ciclo
    const totalDays = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular dias decorridos desde o início
    const daysElapsed = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // LÓGICA SIMPLES: Garantir que o período 26-(02 ou 07) esteja na Semana 1
    // Para garantir que 26-02 fique na semana 1, vamos considerar que a semana 1 tem pelo menos 7 dias
    // ou até o dia 02 do mês, o que for maior
    const day02Date = new Date(cycleYear, cycleMonth - 1, 2); // Dia 02 do mês de término
    
    // Calcular a posição do dia 02 no ciclo
    const day02Position = Math.floor((day02Date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calcular o final da semana 1 para garantir que o dia 02 esteja incluído
    // A semana 1 vai até o maior entre: posição do dia 02 ou 7 dias (para cobrir 26-02)
    const week1End = Math.max(day02Position, 7);
    
    if (daysElapsed <= week1End) {
      return 1;
    }
    
    // Distribuir os dias restantes nas semanas 2-5 de forma mais lógica (semanas de 7 dias com ajustes no final)
    const remainingDays = totalDays - week1End;
    // Aproximadamente 7 dias por semana, mas ajustando para o número total
    const targetDaysPerWeek = 7;
    
    // Calcular quantos dias completos de 7 dias podemos ter e quantos dias sobram
    const fullWeeks = Math.floor(remainingDays / 7);
    let remainingAfterFullWeeks = remainingDays % 7;
    
    // Calcular a semana para dias após a semana 1
    const daysAfterWeek1 = daysElapsed - week1End;
    
    // Percorrer semanas 2-5 para encontrar a correta
    let dayCounter = 0; // Dias acumulados após a semana 1
    for (let weekIndex = 2; weekIndex <= 5; weekIndex++) {
      let weekDays;
      if (weekIndex - 1 <= fullWeeks) {
        // Atribuir 7 dias para as semanas completas
        weekDays = 7;
      } else {
        // Para semanas extras, distribuir os dias restantes
        const remainingWeeks = 5 - weekIndex + 1; // quantas semanas faltam incluindo esta
        weekDays = Math.ceil(remainingAfterFullWeeks / remainingWeeks);
        remainingAfterFullWeeks -= weekDays;
      }
      
      if (daysAfterWeek1 <= dayCounter + weekDays) {
        return weekIndex;
      }
      dayCounter += weekDays;
    }
    
    // Caso não encaixe em nenhuma semana anterior (deveria ser semana 5)
    return 5;
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