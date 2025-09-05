import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EMPLOYEE_NAMES, MONTHLY_GOALS, POINT_VALUE, TEAM_MONTHLY_GOAL, EXPORT_CONFIG } from '@/lib/constants';
import { Logger, getEmployeeColor } from '@/lib/shared-utils';

interface ExportEntry {
  Data: string;
  Refinaria: string;
  Pontos: number;
  Observações: string;
}

export class ExportService {
  /**
   * Exporta dados dos funcionários em arquivos Excel separados dentro de um ZIP
   * Formato igual ao da imagem: Data, Refinaria, Pontos, Observações
   */
  static async exportEmployeeDataToZip(): Promise<void> {
    try {
      // Buscar todos os funcionários
      const { data: employees, error: employeesError } = await supabase
        .from('employee')
        .select('id, real_name')
        .order('real_name');

      if (employeesError || !employees) {
        throw new Error('Erro ao buscar funcionários');
      }

      // Buscar todas as entradas
      const { data: entries, error: entriesError } = await supabase
        .from('entry')
        .select(`
          id,
          date,
          points,
          observations,
          refinery,
          employee_id
        `)
        .order('date', { ascending: false })
        .limit(EXPORT_CONFIG.MAX_RECORDS);

      if (entriesError || !entries) {
        throw new Error('Erro ao buscar registros');
      }

      // Criar um ZIP
      const zip = new JSZip();

      // Agrupar entradas por funcionário
      const entriesByEmployee = new Map<number, typeof entries>();
      entries.forEach(entry => {
        if (!entriesByEmployee.has(entry.employee_id)) {
          entriesByEmployee.set(entry.employee_id, []);
        }
        entriesByEmployee.get(entry.employee_id)?.push(entry);
      });

      // Criar arquivo Excel para cada funcionário
      for (const employee of employees) {
        const employeeEntries = entriesByEmployee.get(employee.id) || [];
        
        // Formatar dados para Excel (igual ao formato da imagem)
        let exportData: ExportEntry[];
        
        if (employeeEntries.length > 0) {
          exportData = employeeEntries.map(entry => ({
            Data: format(new Date(entry.date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
            Refinaria: entry.refinery || '',
            Pontos: entry.points || 0,
            Observações: entry.observations || ''
          }));
          
          // Calcular total de pontos
          const totalPontos = exportData.reduce((sum, entry) => sum + entry.Pontos, 0);
          
          // Meta mensal baseada nas constantes centralizadas
          const metaMensal = MONTHLY_GOALS[employee.real_name as keyof typeof MONTHLY_GOALS] || 9500;
          const restanteMensal = Math.max(0, metaMensal - totalPontos);
          
          // Adicionar linha de Total
          exportData.push({
            Data: 'Total',
            Refinaria: '',
            Pontos: totalPontos,
            Observações: `Restante mensal: ${restanteMensal}`
          });
        } else {
          // Se não tem dados, criar arquivo com uma linha indicando
          const metaMensal = MONTHLY_GOALS[employee.real_name as keyof typeof MONTHLY_GOALS] || 9500;
          exportData = [
            {
              Data: format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
              Refinaria: '',
              Pontos: 0,
              Observações: 'Nenhum registro encontrado'
            },
            {
              Data: 'Total',
              Refinaria: '',
              Pontos: 0,
              Observações: `Restante mensal: ${metaMensal}`
            }
          ];
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustar largura das colunas
        const colWidths = [
          { wch: 20 }, // Data
          { wch: 12 }, // Refinaria  
          { wch: 8 },  // Pontos
          { wch: 50 }  // Observações
        ];
        ws['!cols'] = colWidths;

        // Adicionar ao workbook
        XLSX.utils.book_append_sheet(wb, ws, EXPORT_CONFIG.EXCEL_SHEET_NAME);

        // Converter para buffer (ArrayBuffer no browser, compatível com JSZip)
        const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        
        // Adicionar ao ZIP - nome igual à segunda imagem
        const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });
        const fileName = `${employee.real_name} ${currentMonth}.xlsx`;
        zip.file(fileName, excelBuffer);
      }

      // Gerar ZIP e fazer download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${EXPORT_CONFIG.ZIP_FILENAME_PREFIX}${format(new Date(), 'yyyy-MM-dd')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      Logger.error('Erro ao exportar dados', error);
      throw error;
    }
  }



}