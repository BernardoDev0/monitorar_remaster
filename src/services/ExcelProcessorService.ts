import * as XLSX from 'xlsx';
import { CalculationsService } from './CalculationsService';
import { supabase } from '@/integrations/supabase/client';
import { parseDate, formatDateISO, isValidDate } from '@/lib/date-utils';
import { parseNumberBR, isValidNumber, safeSum } from '@/lib/number-utils';
import { batchInsertEntries, getCachedEmployees } from '@/lib/supabase-utils';

export interface ExcelRecord {
  employee: string;
  date: Date;
  points: number;
  month: string;
  refinery?: string;
}

export interface EmployeeData {
  total: number;
  records: number;
  months: { [key: string]: { points: number; records: number } };
  refineries: { [key: string]: number };
}

export interface ProcessedExcelData {
  employees: { [key: string]: EmployeeData };
  months: { [key: string]: any };
  records: ExcelRecord[];
  statistics: {
    total_files: number;
    total_employees: number;
    total_records: number;
    total_points: number;
    total_profit: number; // R$ 3.25 por ponto
  };
}

export class ExcelProcessorService {
  private static readonly POINT_VALUE = 3.25; // R$ 3,25 por ponto
  private static readonly USE_COMPANY_CYCLE_FOR_LOCAL = true;

  static async processExcelFiles(files: FileList): Promise<ProcessedExcelData> {
    const processedData: ProcessedExcelData = {
      employees: {},
      months: {},
      records: [],
      statistics: {
        total_files: files.length,
        total_employees: 0,
        total_records: 0,
        total_points: 0,
        total_profit: 0
      }
    };

    for (const file of Array.from(files)) {
      if (file.name.match(/\.(xlsx|xls)$/i)) {
        try {
          const fileData = await this.extractDataFromExcel(file);
          this.mergeData(processedData, fileData);
        } catch (error) {
          console.error(`Erro ao processar ${file.name}:`, error);
        }
      }
    }

    this.calculateFinalStatistics(processedData);
    return processedData;
  }

  // Retorna o nome do funcionário com base no nome do arquivo.
  // Ex.: "Matheus Agosto.xlsx" -> "Matheus"
  private static extractEmployeeNameFromFilename(fileName: string): string {
    const base = fileName.replace(/\.(xlsx|xls)$/i, '');
    const KNOWN = ['Rodrigo', 'Maurício', 'Matheus', 'Wesley'];

    const normalize = (s: string) => s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const baseNorm = normalize(base);
    const knownNorm = KNOWN.map((n) => ({ raw: n, norm: normalize(n) }));

    // 1) match por início (ex.: "matheus agosto")
    const starts = knownNorm.find((k) => baseNorm.startsWith(k.norm));
    if (starts) return starts.raw;

    // 2) match por palavra contida (ex.: "planilha_mauricio_setembro")
    const contains = knownNorm.find((k) => baseNorm.split(/[\s_.-]+/).includes(k.norm));
    if (contains) return contains.raw;

    // 3) match pelo primeiro token (compatibilidade)
    const firstToken = base.split(/[\s_-]+/)[0];
    const matchFirst = knownNorm.find((k) => normalize(firstToken) === k.norm);
    if (matchFirst) return matchFirst.raw;

    // 4) fallback: retorna base (ainda funciona, mas não aparecerá colorido no gráfico)
    return base;
  }

  private static async extractDataFromExcel(file: File): Promise<Partial<ProcessedExcelData>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetNames = workbook.SheetNames || [];
          const allRows: any[] = [];
          for (const sname of sheetNames) {
            const ws = workbook.Sheets[sname];
            const rows = XLSX.utils.sheet_to_json(ws);
            if (rows && (rows as any[]).length) {
              console.log(`📄 Lendo aba '${sname}' com ${(rows as any[]).length} linha(s) em ${file.name}`);
              allRows.push(...(rows as any[]));
            } else {
              console.log(`📄 Aba '${sname}' vazia em ${file.name}`);
            }
          }
          const jsonData = allRows;

          // Extrai corretamente o nome do funcionário do arquivo
          const employeeName = this.extractEmployeeNameFromFilename(file.name);
          const fileData: Partial<ProcessedExcelData> = {
            employees: {},
            records: []
          };

          // Tentar detectar automaticamente uma coluna de pontos caso os nomes não batam
          const fallbackPointsKey = this.detectPointsKey(jsonData);
          if (fallbackPointsKey) {
            console.log(`🔎 Chave de pontos detectada em ${file.name}: '${fallbackPointsKey}'`);
          } else {
            console.log(`🔎 Nenhuma chave de pontos clara detectada em ${file.name}`);
          }

          // Tentar detectar automaticamente uma coluna de data
          const fallbackDateKey = this.detectDateKey(jsonData);
          if (fallbackDateKey) {
            console.log(`🗓️  Chave de data detectada em ${file.name}: '${fallbackDateKey}'`);
          } else {
            console.log(`🗓️  Nenhuma chave de data clara detectada em ${file.name}`);
          }

          // Inicializar dados do funcionário
          if (employeeName) {
            fileData.employees![employeeName] = {
              total: 0,
              records: 0,
              months: {},
              refineries: {}
            };
          }

          // Logs de diagnóstico sobre as colunas detectadas
          const firstRow = (jsonData && jsonData.length > 0) ? (jsonData[0] as any) : null;
          if (firstRow && typeof firstRow === 'object') {
            const keys = Object.keys(firstRow);
            console.log(`🧭 Cabeçalhos detectados em ${file.name}:`, keys);
          } else {
            console.log(`🧭 Planilha sem cabeçalhos legíveis em ${file.name}`);
          }

          let totalRows = 0;
          let validDateRows = 0;
          let withPointsRows = 0;
          let sumPoints = 0;

          // Processar cada linha
          jsonData.forEach((row: any) => {
            totalRows++;
            try {
              let rawDate = this.getFirstValueByKeyIncludes(row, ['data', 'date', 'dia']);
              let dateValue = parseDate(rawDate);

              // Se ainda não obteve data, tentar a chave detectada automaticamente
              if (!dateValue && fallbackDateKey && Object.prototype.hasOwnProperty.call(row, fallbackDateKey)) {
                rawDate = (row as any)[fallbackDateKey];
                dateValue = parseDate(rawDate);
              }

              // Se ainda não, varrer os valores da linha e pegar o primeiro que pareça data
              if (!dateValue && row && typeof row === 'object') {
                for (const key of Object.keys(row)) {
                  const candidate = (row as any)[key];
                  const tryDate = parseDate(candidate);
                  if (tryDate) { dateValue = tryDate; break; }
                }
              }

              // Usar apenas colunas de pontos, evitando colunas de metas/objetivos/planejado
              let rawPoints = this.getFirstValueByKeyMatch(row, ['pontos', 'pontuacao', 'pontuação'], ['meta','objetiv','planejad','previst','saldo']);
              if ((rawPoints === undefined || parseNumberBR(rawPoints) === 0) && fallbackPointsKey && Object.prototype.hasOwnProperty.call(row, fallbackPointsKey)) {
                rawPoints = (row as any)[fallbackPointsKey];
              }
              const pointsValue = parseNumberBR(rawPoints);
              const refineryValue = String(this.getFirstValueByKeyIncludes(row, ['refinaria', 'refinery']))
                .trim();

              // Ignorar linhas sem data válida para evitar jogar tudo no mês atual
              if (!dateValue) return;
              validDateRows++;

              if (pointsValue > 0 && employeeName) {
                withPointsRows++;
                sumPoints += pointsValue;
                const monthKey = this.getCompanyMonthFromDate(dateValue);
                
                // Adicionar aos totais
                fileData.employees![employeeName].total += pointsValue;
                fileData.employees![employeeName].records += 1;

                // Adicionar aos dados mensais
                if (!fileData.employees![employeeName].months[monthKey]) {
                  fileData.employees![employeeName].months[monthKey] = {
                    points: 0,
                    records: 0
                  };
                }
                fileData.employees![employeeName].months[monthKey].points += pointsValue;
                fileData.employees![employeeName].months[monthKey].records += 1;

                // Adicionar refinaria
                if (refineryValue) {
                  if (!fileData.employees![employeeName].refineries[refineryValue]) {
                    fileData.employees![employeeName].refineries[refineryValue] = 0;
                  }
                  fileData.employees![employeeName].refineries[refineryValue] += pointsValue;
                }

                // Adicionar registro individual
                fileData.records!.push({
                  employee: employeeName,
                  date: dateValue,
                  points: pointsValue,
                  month: monthKey,
                  refinery: refineryValue
                });
              }
            } catch (error) {
              console.warn('Erro ao processar linha:', error);
            }
          });

          console.log(`📊 Resumo ${file.name}: totalLinhas=${totalRows}, datasValidas=${validDateRows}, comPontos=${withPointsRows}, somaPontos=${sumPoints}`);
          resolve(fileData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Busca o primeiro valor em uma linha cujas chaves contenham algum dos termos (case-insensitive)
  private static getFirstValueByKeyIncludes(row: any, needles: string[]): any {
    if (!row || typeof row !== 'object') return undefined;
    const lowerNeedles = needles.map((n) => n.toLowerCase());
    for (const key of Object.keys(row)) {
      const k = String(key).toLowerCase();
      if (lowerNeedles.some((n) => k.includes(n))) {
        return (row as any)[key];
      }
    }
    return undefined;
  }

  private static getFirstValueByKeyMatch(row: any, includes: string[], excludes: string[] = []): any {
    if (!row || typeof row !== 'object') return undefined;
    const inc = includes.map((s) => s.toLowerCase());
    const exc = excludes.map((s) => s.toLowerCase());
    for (const key of Object.keys(row)) {
      const k = String(key).toLowerCase();
      if (inc.some((n) => k.includes(n)) && !exc.some((n) => k.includes(n))) {
        return (row as any)[key];
      }
    }
    return undefined;
  }

  private static detectPointsKey(rows: any[]): string | null {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const sums: Record<string, { sum: number; count: number }> = {};
    const excludeName = ['meta', 'objetiv', 'planejad', 'previst', 'saldo', 'valor', 'preco', 'preço', 'vlr', 'r$', 'reais', 'fatur', 'receita', 'lucro'];
    const preferName = ['ponto', 'pontua'];

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      for (const key of Object.keys(row)) {
          const k = String(key).toLowerCase();
          if (excludeName.some((n) => k.includes(n))) continue;
          const v = (row as any)[key];
          const n = parseNumberBR(v);
          if (!isNaN(n) && isFinite(n) && n > 0) {
            if (!sums[key]) sums[key] = { sum: 0, count: 0 };
            sums[key].sum += n;
            sums[key].count += 1;
          }
        }
    }

    const entries = Object.entries(sums);
    if (entries.length === 0) return null;

    // Preferir colunas que contenham 'ponto/pontua'
    const preferred = entries
      .filter(([k]) => preferName.some((n) => k.toLowerCase().includes(n)))
      .sort((a, b) => b[1].sum - a[1].sum);

    const candidates = (preferred.length ? preferred : entries)
      // Evitar valores médios muito altos (provável R$)
      .filter(([, { sum, count }]) => count > 0 && (sum / count) <= 2000)
      .sort((a, b) => b[1].sum - a[1].sum);

    const best = candidates[0]?.[0] || null;
    if (best) {
      console.log('🧪 Candidatos a coluna de pontos (top 5):', candidates.slice(0, 5));
    }
    return best;
  }

  // Removido - usando parseNumberBR do number-utils

  private static detectDateKey(rows: any[]): string | null {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const scores: Record<string, number> = {};
    const exclude = ['ponto','pontua','meta','objetiv','planejad','previst','saldo','valor','preco','preço','vlr','r$','fatur','receita','lucro','refinaria','refinery'];

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      for (const key of Object.keys(row)) {
        const k = String(key).toLowerCase();
        if (exclude.some((n) => k.includes(n))) continue;
        const v = (row as any)[key];
        const d = parseDate(v);
        if (d) scores[key] = (scores[key] || 0) + 1;
      }
    }

    const best = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)[0] || null;

    return best;
  }

  // Removido - usando parseDate do date-utils



  private static getCompanyMonthFromDate(date: Date): string {
    try {
      if (!this.USE_COMPANY_CYCLE_FOR_LOCAL) {
        // Agrupar por mês calendário
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return `${m.toString().padStart(2, '0')}/${y}`;
      }

      // Centralizar regra no CalculationsService (26→25)
      return CalculationsService.getCompanyMonthKeyFromDate(date);
    } catch (error) {
      return 'Sem Data';
    }
  }

  private static mergeData(processedData: ProcessedExcelData, fileData: Partial<ProcessedExcelData>) {
    // Mesclar funcionários
    if (fileData.employees) {
      Object.entries(fileData.employees).forEach(([employee, data]) => {
        if (!processedData.employees[employee]) {
          processedData.employees[employee] = data;
        } else {
          // Somar dados
          processedData.employees[employee].total += data.total;
          processedData.employees[employee].records += data.records;
          
          // Mesclar meses
          Object.entries(data.months).forEach(([month, monthData]) => {
            if (!processedData.employees[employee].months[month]) {
              processedData.employees[employee].months[month] = monthData;
            } else {
              processedData.employees[employee].months[month].points += monthData.points;
              processedData.employees[employee].months[month].records += monthData.records;
            }
          });
          
          // Mesclar refinarias
          Object.entries(data.refineries).forEach(([refinery, points]) => {
            if (!processedData.employees[employee].refineries[refinery]) {
              processedData.employees[employee].refineries[refinery] = 0;
            }
            processedData.employees[employee].refineries[refinery] += points;
          });
        }
      });
    }

    // Adicionar registros
    if (fileData.records) {
      processedData.records.push(...fileData.records);
    }
  }

  private static calculateFinalStatistics(processedData: ProcessedExcelData) {
    processedData.statistics.total_employees = Object.keys(processedData.employees).length;
    processedData.statistics.total_records = processedData.records.length;
    
    // Calcular pontos totais
    processedData.statistics.total_points = Object.values(processedData.employees)
      .reduce((sum, emp) => sum + emp.total, 0);
    
    // Calcular lucro total (pontos × R$ 3,25)
    processedData.statistics.total_profit = processedData.statistics.total_points * this.POINT_VALUE;
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static calculateMonthlyData(processedData: ProcessedExcelData): any[] {
    const monthlyData: { [key: string]: { [employee: string]: number } } = {};
    
    // Agrupar por mês
    Object.entries(processedData.employees).forEach(([employee, data]) => {
      Object.entries(data.months).forEach(([month, monthData]) => {
        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }
        monthlyData[month][employee] = monthData.points;
      });
    });
    
    // Converter para formato do gráfico ordenando por ano/mês (MM/YYYY)
    const parse = (key: string) => {
      const [mm, yyyy] = key.split('/').map((v) => parseInt(v, 10));
      return { y: isNaN(yyyy) ? 0 : yyyy, m: isNaN(mm) ? 0 : mm };
    };

    return Object.entries(monthlyData)
      .sort(([a], [b]) => {
        const pa = parse(a);
        const pb = parse(b);
        if (pa.y !== pb.y) return pa.y - pb.y;
        return pa.m - pb.m;
      })
      .map(([month, employees]) => ({
        name: month,
        ...employees
      }));
  }

  // Retorna dados mensais prontos para o gráfico a partir dos arquivos locais em 'registros monitorar'
  static async loadLocalMonthlyChartData(): Promise<any[] | null> {
    try {
      console.log('🔍 Iniciando carregamento dos arquivos Excel locais...');
      console.log('🧮 Modo de agrupamento:', this.USE_COMPANY_CYCLE_FOR_LOCAL ? 'Ciclo 26→25' : 'Mês calendário');
      
      // Carregar URLs dos arquivos .xlsx/.xls dentro da pasta com espaço no nome
      const modules = (import.meta as any).glob('/registros monitorar/**/*.{xlsx,xls}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
      const entries = Object.entries(modules);
      
      console.log('📁 Arquivos encontrados:', entries.length);
      entries.forEach(([path]) => console.log('  - Arquivo:', path));
      
      if (!entries.length) {
        console.log('⚠️ Nenhum arquivo Excel encontrado na pasta registros monitorar');
        return null;
      }

      const processed: ProcessedExcelData = {
        employees: {},
        months: {},
        records: [],
        statistics: {
          total_files: entries.length,
          total_employees: 0,
          total_records: 0,
          total_points: 0,
          total_profit: 0,
        },
      };

      console.log('⚡ Processando arquivos Excel...');
      for (const [path, modVal] of entries) {
        try {
          const base = path.split('/')?.pop() || 'arquivo.xlsx';
          console.log(`📊 Processando arquivo: ${base}`);
          
          // Com eager: true + query '?url' e import: 'default', modVal já é a URL string
          let url: string | undefined = modVal as unknown as string;

          if (!url || typeof url !== 'string') {
            console.warn(`❌ URL inválida para ${base}:`, url);
            continue;
          }

          const resp = await fetch(url);
          if (!resp.ok) {
            console.warn(`❌ Erro ao carregar ${base}: ${resp.status} ${resp.statusText}`);
            continue;
          }
          
          const blob = await resp.blob();
          const file = new File([blob], base, { type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const partial = await this.extractDataFromExcel(file);
          
          console.log(`✅ Dados extraídos de ${base}:`, {
            funcionários: Object.keys(partial.employees || {}),
            registros: partial.records?.length || 0
          });
          
          this.mergeData(processed, partial);
        } catch (error) {
          console.error(`❌ Erro ao processar ${path}:`, error);
        }
      }

      this.calculateFinalStatistics(processed);
      
      console.log('📈 Estatísticas finais:', processed.statistics);
      console.log('👥 Funcionários processados:', Object.keys(processed.employees));

      // Montar dados mensais ordenados e com nomes em PT-BR
      const rawMonthly = this.calculateMonthlyData(processed); // name: MM/YYYY
      console.log('📅 Dados mensais brutos:', rawMonthly);
      
      const mapped = rawMonthly.map((row) => {
        const [mmStr, yyyyStr] = String(row.name).split('/');
        const mm = parseInt(mmStr, 10);
        const key = `${mm.toString().padStart(2, '0')}/${yyyyStr}`; // chave estável
        const display = isNaN(mm) 
          ? String(row.name) 
          : CalculationsService.getMonthNamePT((mm - 1 + 12) % 12 + 1);
        const { name, ...rest } = row;
        // Retornar tanto a "key" (MM/YYYY) quanto o "name" (nome PT)
        return { key, name: display, year: parseInt(yyyyStr, 10) || undefined, ...rest };
      });

      console.log('📊 Dados finais para o gráfico:', mapped);
      return mapped;
    } catch (err) {
      console.error('❌ Erro geral em loadLocalMonthlyChartData:', err);
      return null;
    }
  }

  // ===== NOVO: Importador direto para o banco (somente mês atual da empresa) =====
  // Lê planilhas da pasta local '/adicionar no nosso bc' e insere em 'entry' SEM disparar emails
  // Espera colunas: Data, Refinaria, Pontos, Observações
  static async importLocalEntriesForCurrentCycleFromFolder(folder = '/adicionar no nosso bc') {
    // 1) coletar arquivos (glob precisa ser literal, não pode interpolar variável)
    const modules = (import.meta as any).glob('/adicionar no nosso bc/*.{xlsx,xls}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
    const fileEntries = Object.entries(modules);
    if (!fileEntries.length) {
      console.warn(`Nenhum arquivo Excel encontrado em '${folder}'`);
      return { inserted: 0, skipped_duplicates: 0, files: [] as any[] };
    }

    // 2) datas do mês atual da empresa (26→25)
    const { start, end } = CalculationsService.getMonthCycleDates();
    const endExclusiveDate = new Date(`${end}T00:00:00Z`);
    endExclusiveDate.setUTCDate(endExclusiveDate.getUTCDate() + 1);
    const endExclusive = formatDateISO(endExclusiveDate);

    // 3) mapa funcionários (id por nome)
    const { data: employees, error: empErr } = await supabase
      .from('employee')
      .select('id, real_name');
    if (empErr) throw empErr;
    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const empByName = new Map<string, number>();
    for (const e of employees || []) empByName.set(normalize(e.real_name), e.id);

    let totalInserted = 0;
    let totalSkipped = 0;
    const perFile: any[] = [];

    // helper: extrair nome do funcionário a partir do arquivo (reaproveita lógica usada em processador)
    const extractEmployeeNameFromFilename = (filePath: string) => {
      const base = filePath.split('/').pop() || filePath;
      return base.replace(/\.(xlsx|xls)$/i, '');
    };

    const ensureDate = (raw: any): Date | null => {
      // Tenta parse robusto: numero excel, string "YYYY-MM-DD HH:mm:ss", Date, etc.
      const asStr = String(raw ?? '').trim();
      if (!asStr) return null;
      // numero excel
      if (typeof raw === 'number') {
        // Excel serial date -> JS Date (dias desde 1899-12-30)
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const millis = raw * 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + millis);
      }
      // padrão com espaço
      const tryIso = asStr.replace(' ', 'T');
      const d = new Date(tryIso);
      if (!isNaN(d.getTime())) return d;
      // fallback
      const d2 = new Date(asStr);
      return isNaN(d2.getTime()) ? null : d2;
    };

    // 4) processar cada arquivo
    for (const [virtualPath, url] of fileEntries) {
      const employeeRaw = extractEmployeeNameFromFilename(virtualPath);
      const empId = empByName.get(normalize(employeeRaw));
      if (!empId) {
        perFile.push({ file: virtualPath, inserted: 0, skipped: 0, error: `Funcionário não encontrado: ${employeeRaw}` });
        continue;
      }

      try {
        const res = await fetch(url);
        const arrayBuf = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuf, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const ws = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json(ws) as any[];

        // Buscar existentes do ciclo para esse funcionário e deduplicar
        const { data: existing, error: exErr } = await supabase
          .from('entry')
          .select('id, date, points, refinery, observations')
          .eq('employee_id', empId)
          .gte('date', start)
          .lt('date', endExclusive)
          .limit(2000);
        if (exErr) throw exErr;
        const keyOf = (r: any) => `${new Date(r.date).toISOString()}|${r.points}|${(r.refinery||'').trim().toLowerCase()}|${(r.observations||'').trim().toLowerCase()}`;
        const existingKeys = new Set((existing || []).map(keyOf));

        const toInsert: any[] = [];
        for (const row of rows) {
          const dataCell = row['Data'] ?? row['data'] ?? row['DATA'];
          const obsCell = row['Observações'] ?? row['Observacoes'] ?? row['observacoes'] ?? row['OBS'] ?? '';
          const refCell = row['Refinaria'] ?? row['refinaria'] ?? '';
          let pts = row['Pontos'] ?? row['pontos'] ?? 0;

          // pular linhas de Total/restante
          const dataCellStr = String(dataCell || '').toLowerCase();
          const obsStr = String(obsCell || '').toLowerCase();
          if (dataCellStr.startsWith('total') || obsStr.includes('restante mensal')) continue;

          // parse pontos
          pts = parseNumberBR(pts);

          const d = ensureDate(dataCell);
          if (!d) continue;
          const iso = d.toISOString();
          const isoDateOnly = iso.split('T')[0];
          if (isoDateOnly < start || isoDateOnly >= endExclusive) continue; // fora do mês atual

          const candidate = {
            date: iso,
            employee_id: empId,
            refinery: String(refCell || ''),
            points: Number(pts) || 0,
            observations: String(obsCell || ''),
          };
          const candKey = `${candidate.date}|${candidate.points}|${candidate.refinery.trim().toLowerCase()}|${candidate.observations.trim().toLowerCase()}`;
          if (!existingKeys.has(candKey)) {
            existingKeys.add(candKey);
            toInsert.push(candidate);
          } else {
            totalSkipped++;
          }
        }

        let inserted = 0;
        // inserir em lotes
        const chunkSize = 100;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          const chunk = toInsert.slice(i, i + chunkSize);
          if (!chunk.length) continue;
          const { error: insErr, count } = await supabase
            .from('entry')
            .insert(chunk, { count: 'exact' });
          if (insErr) throw insErr;
          inserted += count || chunk.length;
        }

        totalInserted += inserted;
        perFile.push({ file: virtualPath, inserted, skipped: toInsert.length - inserted });
      } catch (e: any) {
        perFile.push({ file: virtualPath, inserted: 0, skipped: 0, error: e?.message || String(e) });
      }
    }

    return { inserted: totalInserted, skipped_duplicates: totalSkipped, files: perFile };
  }
}