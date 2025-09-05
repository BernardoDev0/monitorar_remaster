import { useEffect, useMemo, useState } from 'react';
import { ExcelProcessorService } from '@/services/ExcelProcessorService';
import { CalculationsService } from '@/services/CalculationsService';
import { DataService } from '@/services/DataService';

interface ExecutivePanelProps {
  monthlyData: any[]; // últimos meses com pontos por pessoa
  teamData: { name: string; value: number; color?: string }[]; // pontos do mês atual por pessoa
  hiddenEmployees: Set<string>;
}

// Utilitário
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function ExecutivePanel({ monthlyData, teamData, hiddenEmployees }: ExecutivePanelProps) {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const list = await DataService.getEmployees();
      setEmployees(list || []);
    })();
  }, []);

  // Datas do ciclo mensal (26 -> 25)
  const cycle = useMemo(() => CalculationsService.getMonthCycleDates(), []);
  const totalDays = useMemo(() => {
    const start = new Date(cycle.start);
    const end = new Date(cycle.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [cycle]);
  const elapsedDays = useMemo(() => {
    const start = new Date(cycle.start);
    const today = new Date();
    const end = new Date(cycle.end);
    const ref = today > end ? end : today;
    return clamp(Math.ceil((ref.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1, totalDays);
  }, [cycle, totalDays]);
  const remainingDays = Math.max(totalDays - elapsedDays, 0);

  // Filtra Rodrigo e ocultos
  const visibleTeam = useMemo(() => teamData.filter(t => t.name !== 'Rodrigo' && !hiddenEmployees.has(t.name)), [teamData, hiddenEmployees]);

  const totalPoints = useMemo(() => visibleTeam.reduce((s, r) => s + (r.value || 0), 0), [visibleTeam]);
  const POINT_VALUE = 3.25;
  const metaEquipe = 29500; // 10.500 + 9.500 + 9.500 = 29.500

  // Projeções
  const runRatePerDay = totalPoints / Math.max(elapsedDays, 1);
  const forecastPoints = Math.round(runRatePerDay * totalDays);
  const progressPct = Math.round((totalPoints / metaEquipe) * 1000) / 10;
  const gapToGoal = Math.max(metaEquipe - totalPoints, 0);
  const needPerDay = remainingDays > 0 ? Math.ceil(gapToGoal / remainingDays) : 0;

  // Top 3 contribuintes (visíveis)
  const topContrib = useMemo(() => {
    return [...visibleTeam].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 3);
  }, [visibleTeam]);

  // Tendência 3 meses (usando monthlyData)
  const trend = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return { last: 0, prev: 0, changePct: 0 };
    const last3 = monthlyData.slice(-3).map((m: any) => {
      return Object.keys(m)
        .filter(k => !['name','key','start','end'].includes(k))
        .filter(k => k !== 'Rodrigo' && !hiddenEmployees.has(k))
        .reduce((sum, k) => sum + (m[k] || 0), 0);
    });
    const last = last3[last3.length - 1] || 0;
    const prev = last3.length >= 2 ? last3[last3.length - 2] : 0;
    const changePct = prev > 0 ? Math.round(((last - prev) / prev) * 1000) / 10 : 0;
    return { last, prev, changePct };
  }, [monthlyData, hiddenEmployees]);

  // Risco por colaborador: progresso atual vs meta mensal
  const riskList = useMemo(() => {
    if (!employees || employees.length === 0) return [] as { name: string; atual: number; monthlyGoal: number; progressPct: number }[];
    const mapAtual = new Map<string, number>();
    for (const t of teamData) {
      mapAtual.set(t.name, t.value || 0);
    }
    const list = employees
      .filter(e => e.real_name !== 'Rodrigo' && !hiddenEmployees.has(e.real_name))
      .map(e => {
        const monthlyGoal = CalculationsService.getMonthlyGoal(e);
        const atual = mapAtual.get(e.real_name) || 0;
        const progressPct = monthlyGoal > 0 ? Math.round((atual / monthlyGoal) * 1000) / 10 : 0;
        return { name: e.real_name, atual, monthlyGoal, progressPct };
      })
      .filter(x => x.monthlyGoal > 0)
      .sort((a, b) => a.progressPct - b.progressPct)
      .slice(0, 3);
    return list;
  }, [employees, teamData, hiddenEmployees]);

  return (
    <div className="h-full space-y-4">
      {/* Linha superior - Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visão do mês */}
        <div className="rounded-lg bg-gradient-to-br from-background/40 to-background/60 border border-border p-3">
          <div className="text-xs text-muted-foreground mb-1">Visão do mês</div>
          <div className="text-xl font-bold text-foreground">{totalPoints.toLocaleString('pt-BR')} pts</div>
          <div className="text-sm text-muted-foreground">{ExcelProcessorService.formatCurrency(totalPoints * POINT_VALUE)}</div>
          <div className="mt-2 h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div className="h-full bg-dashboard-primary" style={{ width: `${clamp(progressPct, 0, 100)}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{progressPct}% da meta</div>
        </div>

        {/* Meta e projeção */}
        <div className="rounded-lg bg-gradient-to-br from-background/40 to-background/60 border border-border p-3">
          <div className="text-xs text-muted-foreground mb-2 font-medium">Meta & Projeção</div>
          <div className="text-lg font-bold text-foreground">Falta {gapToGoal.toLocaleString('pt-BR')} pts</div>
          <div className="text-sm text-muted-foreground">{needPerDay.toLocaleString('pt-BR')} pts/dia</div>
          <div className="mt-2 text-sm font-semibold text-foreground">Meta: {metaEquipe.toLocaleString('pt-BR')} pts</div>
        </div>

        {/* Progresso do ciclo */}
        <div className="rounded-lg bg-gradient-to-br from-background/40 to-background/60 border border-border p-3">
          <div className="text-xs text-muted-foreground mb-2 font-medium">Progresso do Ciclo</div>
          <div className="text-lg font-bold text-foreground">{elapsedDays} de {totalDays} dias</div>
          <div className="text-sm text-muted-foreground">Ritmo: {Math.round(runRatePerDay)} pts/dia</div>
          <div className="mt-2 h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-dashboard-secondary transition-all duration-300" 
              style={{ width: `${(elapsedDays / totalDays) * 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Linha inferior - Performance individual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risco de meta */}
        <div className="rounded-lg bg-gradient-to-br from-background/40 to-background/60 border border-border p-3">
          <div className="text-xs text-muted-foreground mb-3 font-medium">Risco de Meta</div>
          {riskList.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-dashboard-success">
              <div className="w-2 h-2 rounded-full bg-dashboard-success"></div>
              Todos dentro do ritmo
            </div>
          ) : (
            <div className="space-y-3">
              {riskList.map((r) => {
                const isHighRisk = r.progressPct < 50;
                const isMediumRisk = r.progressPct >= 50 && r.progressPct < 100;
                
                return (
                  <div key={r.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-foreground">{r.name}</div>
                      <div className={`text-sm font-bold ${isHighRisk ? 'text-dashboard-danger' : isMediumRisk ? 'text-dashboard-warning' : 'text-dashboard-success'}`}>
                        {r.progressPct}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{r.atual.toLocaleString('pt-BR')} pts</span>
                      <span>Meta: {r.monthlyGoal.toLocaleString('pt-BR')} pts</span>
                    </div>
                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isHighRisk ? 'bg-dashboard-danger' : 
                          isMediumRisk ? 'bg-dashboard-warning' : 
                          'bg-dashboard-success'
                        }`}
                        style={{ width: `${Math.min(r.progressPct, 100)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top contribuintes */}
        <div className="rounded-lg bg-gradient-to-br from-background/40 to-background/60 border border-border p-3">
          <div className="text-xs text-muted-foreground mb-3 font-medium">Top Contribuintes</div>
          <div className="space-y-2">
            {topContrib.map((t, idx) => (
              <div key={t.name} className="flex items-center justify-between text-sm">
                <div className="text-foreground">{idx + 1}. {t.name}</div>
                <div className="text-dashboard-info">{t.value.toLocaleString('pt-BR')} pts</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Tendência: {trend.changePct >= 0 ? '+' : ''}{trend.changePct}% vs anterior
          </div>
        </div>
      </div>
    </div>
  );
}