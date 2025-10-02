import { supabase } from '@/integrations/supabase/client';
import { 
  getAllEmployees, 
  getEmployeeById, 
  getEmployeeByAccessKey,
  createEntry,
  getEmployeeEntries,
  addToEmailQueue 
} from '@/lib/supabase-utils';
import { formatDateISO } from '@/lib/date-utils';

export interface Employee {
  id: number;
  name: string;
  real_name: string;
  username: string;
  access_key: string;
  role: string;
  weekly_goal: number;
  default_refinery: string;
  created_at?: string;
  updated_at?: string;
}

export interface Entry {
  id: number;
  employee_id: number;
  date: string;
  refinery: string;
  points: number;
  observations: string;
  created_at?: string;
  updated_at?: string;
}

export class EmployeeService {
  // Autenticação por chave de acesso (mantendo lógica original)
  static async authenticateByAccessKey(accessKey: string): Promise<Employee | null> {
    const result = await getEmployeeByAccessKey(accessKey);
    
    if (!result.success || !result.data) {
      return null;
    }
    
    return result.data as Employee;
  }

  // Buscar funcionário por ID
  static async getEmployeeById(id: number): Promise<Employee | null> {
    const result = await getEmployeeById(id);
    
    if (!result.success || !result.data) {
      if (!result.data) {
        console.warn('Funcionário não encontrado com ID:', id);
      }
      return null;
    }
    
    return result.data as Employee;
  }

  // Buscar todos os funcionários
  static async getAllEmployees(): Promise<Employee[]> {
    const result = await getAllEmployees();
    
    if (!result.success || !result.data) {
      return [];
    }
    
    return result.data as Employee[];
  }

  // Registrar novo ponto
  static async createEntry(entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry | null> {
    const result = await createEntry({
      employee_id: entry.employee_id,
      date: entry.date,
      points: entry.points,
      refinery: entry.refinery,
      observations: entry.observations
    });
    
    if (!result.success || !result.data) {
      return null;
    }
    
    // Disparar e-mail de confirmação (não bloqueante)
    try {
      const emp = await this.getEmployeeById(entry.employee_id);
      const payload = {
        employee_name: emp?.real_name || emp?.name || 'Funcionário',
        date: entry.date,
        points: entry.points,
        refinery: entry.refinery,
        observations: entry.observations || ''
      };
      
      await addToEmailQueue(payload);
    } catch (emailError) {
      console.warn('Erro ao adicionar email à fila:', emailError);
      // Não falha a operação principal se o email falhar
    }
    
    return result.data as Entry;
  }

  // Buscar entradas do funcionário
  static async getEmployeeEntries(
    employeeId: number, 
    limit?: number, 
    offset?: number,
    dateFilter?: { start?: string; end?: string }
  ): Promise<Entry[]> {
    const result = await getEmployeeEntries(employeeId, {
      limit,
      offset,
      start: dateFilter?.start,
      end: dateFilter?.end
    });
    
    if (!result.success || !result.data) {
      return [];
    }
    
    return result.data as Entry[];
  }

  // Calcular pontos do dia
  static async getTodayPoints(employeeId: number): Promise<number> {
    try {
      // Usar janela [início do dia, início do próximo dia) para evitar problemas de timezone
      const todayDate = new Date();
      const startStr = formatDateISO(todayDate);
      const endDate = new Date(todayDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const endStr = formatDateISO(endDate);
      
      const { data, error } = await supabase
        .from('entry')
        .select('points')
        .eq('employee_id', employeeId)
        .gte('date', startStr)
        .lt('date', endStr);

      if (error) {
        console.error('Erro ao calcular pontos do dia:', error);
        return 0;
      }

      return data?.reduce((total, entry) => total + (entry.points || 0), 0) || 0;
    } catch (error) {
      console.error('Erro ao calcular pontos do dia:', error);
      return 0;
    }
  }

  // Calcular pontos da semana (baseado na lógica 26→25)
  static async getWeekPoints(employeeId: number, weekDates: { start: string; end: string }): Promise<number> {
    try {
      // Tornar limite superior exclusivo: end + 1 dia
      const endExclusive = new Date(`${weekDates.end}T00:00:00Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      const endExclusiveStr = formatDateISO(endExclusive);

      console.log('🔍 QUERY SEMANAL - Employee:', employeeId);
      console.log('🔍 QUERY SEMANAL - Start:', weekDates.start);
      console.log('🔍 QUERY SEMANAL - End Original:', weekDates.end);
      console.log('🔍 QUERY SEMANAL - End Exclusive:', endExclusiveStr);

      const { data, error } = await supabase
        .from('entry')
        .select('points, date')
        .eq('employee_id', employeeId)
        .gte('date', weekDates.start)
        .lt('date', endExclusiveStr);

      if (error) {
        console.error('Erro ao calcular pontos da semana:', error);
        return 0;
      }

      console.log('🔍 DADOS SEMANAIS ENCONTRADOS:', data?.length, 'registros');
      console.log('🔍 PRIMEIROS 5 REGISTROS:', data?.slice(0, 5));
      const total = data?.reduce((total, entry) => total + (entry.points || 0), 0) || 0;
      console.log('🔍 TOTAL SEMANAL CALCULADO:', total);
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular pontos da semana:', error);
      return 0;
    }
  }

  // Calcular pontos mensais (baseado na lógica 26→25)
  static async getMonthPoints(employeeId: number, monthDates: { start: string; end: string }): Promise<number> {
    try {
      // Tornar limite superior exclusivo: end + 1 dia
      const endExclusive = new Date(`${monthDates.end}T00:00:00Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      const endExclusiveStr = formatDateISO(endExclusive);

      console.log('🔍 QUERY MENSAL - Employee:', employeeId);
      console.log('🔍 QUERY MENSAL - Start:', monthDates.start);
      console.log('🔍 QUERY MENSAL - End Original:', monthDates.end);
      console.log('🔍 QUERY MENSAL - End Exclusive:', endExclusiveStr);

      const { data, error } = await supabase
        .from('entry')
        .select('points, date')
        .eq('employee_id', employeeId)
        .gte('date', monthDates.start)
        .lt('date', endExclusiveStr);

      if (error) {
        console.error('Erro ao calcular pontos mensais:', error);
        return 0;
      }

      console.log('🔍 DADOS MENSAIS ENCONTRADOS:', data?.length, 'registros');
      console.log('🔍 PRIMEIROS 5 REGISTROS:', data?.slice(0, 5));
      const total = data?.reduce((total, entry) => total + (entry.points || 0), 0) || 0;
      console.log('🔍 TOTAL MENSAL CALCULADO:', total);
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular pontos mensais:', error);
      return 0;
    }
  }
}