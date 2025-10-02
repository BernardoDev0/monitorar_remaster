import { supabase } from '@/integrations/supabase/client';
import { Employee, Entry } from './EmployeeService';
import { CalculationsService } from './CalculationsService';
import { formatDateISO } from '@/lib/date-utils';
import { ExcelProcessorService } from './ExcelProcessorService';
import { EMPLOYEE_NAMES, TEAM_MONTHLY_GOAL, POINT_VALUE } from '@/lib/constants';
import { Logger, getEmployeeColor, calculateTotalPoints } from '@/lib/shared-utils';

export interface ChartData {
  weeklyData: any[];
  monthlyData: any[];
  teamPerformance: any[];
  employeeStats: Record<string, any>;
}

export interface GeneralStats {
  bestPerformer: string;
  bestPoints: number;
  avgTeam: number;
  totalGoal: number;
  progressPercentage: number;
  totalRevenue: number; // Receita total em BRL baseada no valor por ponto
  // Campos opcionais (usados no contexto semanal)
  totalPoints?: number;          // Soma de pontos da equipe no período
  totalGoalPoints?: number;      // Meta total em pontos (não formatada em K)
  goalRemaining?: number;        // Pontos restantes para atingir a meta
  activeEmployees?: number;      // Quantos colaboradores fizeram pontos (>0)
  totalEmployees?: number;       // Total de colaboradores considerados
  weekRange?: string;            // Intervalo da semana (opcional)
}

/**
 * Serviço centralizado para busca de dados do Supabase
 * Responsável por abstrair queries complexas e fornecer dados estruturados
 */
export class DataService {

  /**
   * Busca todos os funcionários com cache
   */
  static async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .order('real_name');

    if (error) {
      Logger.error('Erro ao buscar funcionários', error);
      return [];
    }

    return data as Employee[];
  }

  /**
   * Busca entradas com filtros e paginação
   */
  static async getEntries(filters?: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Entry[]> {
    let query = supabase
      .from('entry')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      Logger.error('Erro ao buscar entradas', error);
      return [];
    }

    return data as Entry[];
  }

  /**
   * Calcula pontos de um funcionário em um período
   */
  static async getEmployeePoints(
    employeeId: number, 
    startDate: string, 
    endDate: string
  ): Promise<number> {
    // Tornar limite superior exclusivo: end + 1 dia
    const endExclusive = new Date(`${endDate}T00:00:00Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    const endExclusiveStr = formatDateISO(endExclusive);

    const { data, error } = await supabase
      .from('entry')
      .select('points')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lt('date', endExclusiveStr);

    if (error) {
      Logger.error('Erro ao calcular pontos', error);
      return 0;
    }

    if (!data) {
      return 0;
    }

    return calculateTotalPoints(data) || 0;
  }

  /**
   * Gera dados para gráficos semanais
   */
  static async getWeeklyChartData(): Promise<any[]> {
    const employees = await this.getEmployees();
    if (!employees.length) return [];

    const weeklyData = [];
    const cycleStart = CalculationsService.getCurrentCycleStart();
    
    // Gerar 5 semanas do ciclo
    for (let week = 1; week <= 5; week++) {
      const weekDates = CalculationsService.getWeekDates(week.toString());
      const weekData = { name: `Semana ${week}` };
      
      for (const employee of employees) {
        const points = await this.getEmployeePoints(
          employee.id, 
          weekDates.start, 
          weekDates.end
        );
        weekData[employee.real_name] = points;
      }
      
      weeklyData.push(weekData);
    }

    return weeklyData;
  }

  /**
   * Gera dados para gráficos mensais
   * IMPORTANTE: Usa o período customizado da empresa (26→25)
   */
  static async getMonthlyChartData(): Promise<any[]> {
    // Tentar carregar dados locais da pasta 'registros monitorar'
    const localData = await ExcelProcessorService.loadLocalMonthlyChartData();
    
    if (localData && localData.length > 0) {
      console.log('📂 Carregando dados mensais dos arquivos locais de Excel:', localData);

      // Construir sempre os últimos 7 meses do ciclo da empresa (26→25)
      const currentMonthDates = CalculationsService.getMonthCycleDates();
      const currentCycleEnd = new Date(currentMonthDates.end);
      const currentCompanyMonth = currentCycleEnd.getMonth(); // 0-based
      const currentYear = currentCycleEnd.getFullYear();

      type MonthToShow = { monthIndex: number; yearForMonth: number; name: string; key: string; start: string; end: string };
      const monthsToShow: MonthToShow[] = [];
      for (let i = 6; i >= 0; i--) {
        let monthIndex = currentCompanyMonth - i; // 0-based
        let yearForMonth = currentYear;
        if (monthIndex < 0) { monthIndex += 12; yearForMonth -= 1; }
        const name = CalculationsService.getMonthNamePT(monthIndex + 1);
        const monthDates = CalculationsService.getMonthCycleDates(monthIndex + 1, yearForMonth);
        const key = `${(monthIndex + 1).toString().padStart(2, '0')}/${yearForMonth}`;
        monthsToShow.push({ monthIndex, yearForMonth, name, key, start: monthDates.start, end: monthDates.end });
      }

      // Índice por chave estável MM/YYYY gerada pelo ExcelProcessorService
      const byKey = new Map<string, any>(localData.map((row: any) => [row.key || row.name, row]));
      const employeeNames = EMPLOYEE_NAMES;

      const merged = monthsToShow.map(({ name, key, start, end }) => {
        const base: any = { name, key, start, end };
        const found = byKey.get(key) || {};
        for (const emp of employeeNames) {
          base[emp] = typeof found[emp] === 'number' ? found[emp] : 0;
        }
        return base;
      });

      return merged;
    }

    // Fallback: dados do banco de dados (lógica original)
    const employees = await this.getEmployees();
    if (!employees.length) return [];

    const monthlyData = [] as any[];
    
    // PADRONIZAÇÃO: usar APENAS CalculationsService.getMonthCycleDates() para obter o ciclo atual
    const currentMonthDates = CalculationsService.getMonthCycleDates();
    const currentCycleEnd = new Date(currentMonthDates.end);
    const currentCompanyMonth = currentCycleEnd.getMonth(); // 0-based (mês de término do ciclo)
    const currentYear = currentCycleEnd.getFullYear();
    
    Logger.debug('Ciclo atual da empresa', currentMonthDates);
    Logger.debug('Mês atual da empresa (0-based, mês de término)', currentCompanyMonth);
    Logger.debug('Nome do mês atual da empresa', CalculationsService.getMonthNamePT(currentCompanyMonth + 1));
    
    // Mostrar últimos 7 meses da empresa (incluindo o atual)
    const monthsToShow = [] as { monthIndex: number; yearForMonth: number }[];
    for (let i = 6; i >= 0; i--) {
      let monthIndex = currentCompanyMonth - i;
      let yearForMonth = currentYear;
      
      if (monthIndex < 0) {
        monthIndex += 12;
        yearForMonth -= 1;
      }
      
      monthsToShow.push({ monthIndex, yearForMonth });
    }
    
    for (let index = 0; index < monthsToShow.length; index++) {
      const { monthIndex, yearForMonth } = monthsToShow[index];
      // monthIndex é 0-based, mas getMonthCycleDates espera 1-based
      const monthDates = CalculationsService.getMonthCycleDates(monthIndex + 1, yearForMonth);
      const displayMonthName = CalculationsService.getMonthNamePT(monthIndex + 1);
      const key = `${(monthIndex + 1).toString().padStart(2, '0')}/${yearForMonth}`;
      
      const monthData: any = { name: displayMonthName, key, start: monthDates.start, end: monthDates.end };
      
      Logger.debug(`Processando mês: ${displayMonthName} (${monthIndex + 1}/${yearForMonth})`);
      Logger.debug(`Período: ${monthDates.start} até ${monthDates.end}`);
      
      for (const employee of employees) {
        const points = await this.getEmployeePoints(
          employee.id,
          monthDates.start,
          monthDates.end
        );
        monthData[employee.real_name] = points;
      }
      
      monthlyData.push(monthData);
    }

    return monthlyData;
  }

  /**
   * Gera dados para gráfico de pizza da equipe
   */
  static async getTeamPerformanceData(): Promise<any[]> {
    const employees = await this.getEmployees();
    if (!employees.length) return [];

    // Padronizar: sempre usar CalculationsService para o ciclo mensal atual (26→25)
    const monthDates = CalculationsService.getMonthCycleDates();
    const teamData = [];

    for (const employee of employees) {
      const points = await this.getEmployeePoints(
        employee.id,
        monthDates.start,
        monthDates.end
      );

      teamData.push({
        name: employee.real_name,
        value: points,
        color: getEmployeeColor(employee.real_name)
      });
    }

    return teamData;
  }

  /**
   * Gera todos os dados de gráficos de uma vez
   */
  static async getChartData(): Promise<ChartData> {
    const [weeklyData, monthlyData, teamPerformance] = await Promise.all([
      this.getWeeklyChartData(),
      this.getMonthlyChartData(),
      this.getTeamPerformanceData()
    ]);

    return {
      weeklyData,
      monthlyData,
      teamPerformance,
      employeeStats: {}
    };
  }

  /**
   * Calcula estatísticas gerais do mês atual (ciclo 26→25).
   * Se houver dados locais (Excel), usa eles; caso contrário, usa o fallback do banco.
   */
  static async getGeneralStats(): Promise<GeneralStats> {
    const employees = await this.getEmployees();
    if (!employees.length) {
      // Fallback seguro
      return {
        bestPerformer: '-',
        bestPoints: 0,
        avgTeam: 0,
        totalGoal: Math.round(29500 / 1000 * 10) / 10,
        progressPercentage: 0,
        totalRevenue: 0,
      };
    }

    // CORREÇÃO: Calcular apenas até hoje, não o mês inteiro
    const monthDates = CalculationsService.getMonthCycleDates();
    const today = new Date();
    // FORÇAR timezone de São Paulo para funcionar no Vercel
    const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const localDateYYYYMMDD = `${saoPauloDate.getFullYear()}-${(saoPauloDate.getMonth() + 1).toString().padStart(2, '0')}-${saoPauloDate.getDate().toString().padStart(2, '0')}`;

    let bestPerformer = '';
    let bestPoints = 0;
    let totalPoints = 0;
    let totalPointsForAverage = 0;
    let employeeCountForAverage = 0;

    for (const employee of employees) {
      const points = await this.getEmployeePoints(employee.id, monthDates.start, localDateYYYYMMDD);
      
      // Excluir freelancer dos totais
      if (employee.real_name !== 'Rodrigo') {
        totalPoints += points;

        if (points > bestPoints) {
          bestPoints = points;
          bestPerformer = employee.real_name;
        }

        // Para média: excluir Rodrigo (freelancer)
        totalPointsForAverage += points;
        employeeCountForAverage++;
      }
    }

    if (bestPoints <= 0) {
      bestPerformer = '-';
    }

    const avgTeam = employeeCountForAverage > 0 ? 
      Math.round(totalPointsForAverage / employeeCountForAverage) : 0;

    const totalGoalTeam = TEAM_MONTHLY_GOAL; // Meta mensal da equipe
    const progressPercentage = totalGoalTeam > 0 ? 
      Math.round(((totalPoints / totalGoalTeam) * 100) * 10) / 10 : 0;

    // CORREÇÃO: Faturamento apenas do mês atual, não de todos os meses
    const totalRevenue = totalPoints * POINT_VALUE;

    return {
      bestPerformer,
      bestPoints,
      avgTeam,
      totalGoal: Math.round(totalGoalTeam / 1000 * 10) / 10,
      progressPercentage,
      totalRevenue,
    };
  }

  /**
   * Gera dados para gráfico de pizza da equipe
   */
  static async getWeeklyStats(): Promise<GeneralStats> {
    const employees = await this.getEmployees();
    if (!employees.length) {
      return {
        bestPerformer: '-',
        bestPoints: 0,
        avgTeam: 0,
        totalGoal: Math.round((0) / 1000 * 10) / 10,
        progressPercentage: 0,
        totalRevenue: 0,
        totalPoints: 0,
        totalGoalPoints: 0,
        goalRemaining: 0,
        activeEmployees: 0,
        totalEmployees: 0,
        weekRange: ''
      };
    }

    // CORREÇÃO: Calcular apenas a semana atual, não o mês inteiro
    const currentWeek = CalculationsService.getCurrentWeek();
    const weekDates = CalculationsService.getWeekDates(currentWeek.toString());

    let bestPerformer = '';
    let bestPoints = 0;
    let totalPoints = 0;
    let totalPointsForAverage = 0;
    let employeeCountForAverage = 0;
    let activeEmployees = 0;

    for (const employee of employees) {
      if (employee.real_name === 'Rodrigo') {
        continue; // excluir freelancer dos totais semanais/mensais
      }
      const pts = await this.getEmployeePoints(employee.id, weekDates.start, weekDates.end);
      totalPoints += pts;

      if (pts > bestPoints) {
        bestPoints = pts;
        bestPerformer = employee.real_name;
      }

      if (employee.real_name !== 'Rodrigo') {
        totalPointsForAverage += pts;
        employeeCountForAverage++;
      }

      if (pts > 0) activeEmployees++;
    }

    if (bestPoints <= 0) bestPerformer = '-';

    const avgTeam = employeeCountForAverage > 0 ? Math.round(totalPointsForAverage / employeeCountForAverage) : 0;

    // Meta SEMANAL da equipe: somatório das metas semanais (excluindo Rodrigo)
    const totalWeeklyGoalTeam = employees
      .filter(e => e.real_name !== 'Rodrigo')
      .reduce((sum, e) => sum + CalculationsService.getWeeklyGoal(e), 0);

    const progressPercentage = totalWeeklyGoalTeam > 0
      ? Math.round(((totalPoints / totalWeeklyGoalTeam) * 100) * 10) / 10
      : 0;

    const totalRevenue = totalPoints * POINT_VALUE; // faturamento da semana atual

    const weekRange = `${weekDates.start} ~ ${weekDates.end}`;

    return {
      bestPerformer,
      bestPoints,
      avgTeam,
      totalGoal: Math.round(totalWeeklyGoalTeam / 1000 * 10) / 10,
      progressPercentage,
      totalRevenue,
      totalPoints,
      totalGoalPoints: totalWeeklyGoalTeam,
      goalRemaining: Math.max(totalWeeklyGoalTeam - totalPoints, 0),
      activeEmployees,
      totalEmployees: employees.filter(e => e.real_name !== 'Rodrigo').length,
      weekRange,
    };
  }

}