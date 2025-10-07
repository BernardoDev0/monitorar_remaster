import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, Download, TrendingUp, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportService } from "@/services/ExportService";
import { DataService } from "@/services/DataService";
import { ExcelProcessorService } from "@/services/ExcelProcessorService";
import { ChartContainer } from "@/components/Charts/ChartContainer";
import { WeeklyChart } from "@/components/Charts/WeeklyChart";
import { MonthlyChart } from "@/components/Charts/MonthlyChart";
import { TeamChart } from "@/components/Charts/TeamChart";
import { ChartTypeSelector } from "@/components/Charts/ChartTypeSelector";
import { EmployeeControls } from "@/components/Charts/EmployeeControls";
import { ExecutivePanel } from "@/components/Charts/ExecutivePanel";
import { useLoading, InlineLoading, CardLoading } from "@/components/ui/loading-state";

export default function Graficos() {
  const [selectedChart, setSelectedChart] = useState("weekly");
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");
  const [hiddenEmployees, setHiddenEmployees] = useState<Set<string>>(new Set());
  const { loading, withLoading } = useLoading(false);
  const [chartData, setChartData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const { toast } = useToast();

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadRealData();
  }, []);

  // Atualiza as estatísticas quando a aba muda (semanal x mensal)
  useEffect(() => {
    if (selectedChart === "weekly" && weeklyStats) {
      setStats(weeklyStats);
    } else if (selectedChart === "progress" && monthlyStats) {
      setStats(monthlyStats);
    }
  }, [selectedChart, weeklyStats, monthlyStats]);

  const loadRealData = async () => {
    await withLoading(async () => {
      const [chartDataResult, monthlyStatsResult, weeklyStatsResult] = await Promise.all([
        DataService.getChartData(),
        DataService.getGeneralStats(), // Mensal
        DataService.getWeeklyStats()   // Semanal
      ]);
      
      setChartData(chartDataResult);
      setMonthlyStats(monthlyStatsResult);
      setWeeklyStats(weeklyStatsResult);

      // Define stats inicial de acordo com aba padrão (weekly)
      setStats(weeklyStatsResult);
    });
  };

  const toggleEmployee = (employee: string) => {
    setHiddenEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employee)) {
        newSet.delete(employee);
      } else {
        newSet.add(employee);
      }
      return newSet;
    });
  };

  const handleExportData = async () => {
    await withLoading(async () => {
      await ExportService.exportEmployeeDataToZip();
      toast({
        title: "Sucesso",
        description: "Arquivos exportados com sucesso! Verifique sua pasta de downloads.",
      });
    });
  };

  const renderChart = () => {
    if (loading || !chartData) {
      return <CardLoading />;
    }

    switch (selectedChart) {
      case "weekly":
        return <WeeklyChart data={chartData.weeklyData} hiddenEmployees={hiddenEmployees} />;
      
      case "progress":
        return (
          <MonthlyChart 
            data={chartData.monthlyData} 
            hiddenEmployees={hiddenEmployees} 
            viewMode={viewMode} 
          />
        );
      
      case "team":
        // Substituição: em vez de gráfico de pizza, mostrar painel executivo
        return (
          <ExecutivePanel 
            monthlyData={chartData.monthlyData}
            teamData={chartData.teamPerformance}
            hiddenEmployees={hiddenEmployees}
          />
        );
      
      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (selectedChart) {
      case "weekly":
        return "Progresso Semanal";
      case "progress":
        return "Progresso Mensal";
      case "team":
        return "Visão Executiva"; // alterado de Distribuição da Equipe
      default:
        return "Gráfico";
    }
  };

  const getChartIcon = () => {
    switch (selectedChart) {
      case "weekly":
        return <BarChart3 className="h-5 w-5" />;
      case "progress":
        return <TrendingUp className="h-5 w-5" />;
      case "team":
        return <Target className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gráficos</h1>
          <p className="text-muted-foreground">Visualização de dados e métricas da equipe</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportData}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? (
              <InlineLoading text="Exportando..." size="sm" />
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Excel
              </>
            )}
          </Button>
          
          <Badge variant="outline" className="text-dashboard-info border-dashboard-info/30">
            <Target className="h-3 w-3 mr-1" />
            Meta Ativa
          </Badge>
        </div>
      </div>

      {/* Chart Type Selector */}
      <ChartTypeSelector 
        selectedChart={selectedChart} 
        onChartChange={setSelectedChart} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chart Area */}
        <div className="col-span-12 xl:col-span-8">
          <Card className="bg-gradient-card shadow-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                {getChartIcon()}
                {getChartTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-96">
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="col-span-12 xl:col-span-4">
          <Card className="bg-gradient-card shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Modo de Visualização */}
              {selectedChart === "progress" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visualização</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewMode === "team" ? "dashboard-active" : "outline"}
                      onClick={() => setViewMode("team")}
                      className="h-8 text-xs"
                      size="sm"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Equipe
                    </Button>
                    <Button
                      variant={viewMode === "individual" ? "dashboard-active" : "outline"}
                      onClick={() => setViewMode("individual")}
                      className="h-8 text-xs"
                      size="sm"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Individual
                    </Button>
                  </div>
                </div>
              )}

              {/* Funcionários */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Funcionários</h4>
                <EmployeeControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  hiddenEmployees={hiddenEmployees}
                  onToggleEmployee={toggleEmployee}
                  selectedChart={selectedChart}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Cards - Apenas para Progresso Semanal e Progresso Mensal */}
      {stats && selectedChart !== 'team' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Melhor Card */}
            <Card className="bg-gradient-card shadow-card border-border">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Melhor</div>
                  <div className="font-semibold text-dashboard-success text-lg">{stats.bestPerformer}</div>
                  <div className="text-sm text-dashboard-success">{stats.bestPoints} pts</div>
                </div>
              </CardContent>
            </Card>

            {/* Média Card */}
            <Card className="bg-gradient-card shadow-card border-border">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Média</div>
                  <div className="font-semibold text-dashboard-info text-lg">{stats.avgTeam} pts</div>
                  <div className="text-xs text-muted-foreground">por funcionário</div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Card */}
            <Card className="bg-gradient-card shadow-card border-border">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Meta</div>
                  <div className="font-semibold text-dashboard-warning text-lg">29.500 pts</div>
                  <div className="text-xs text-muted-foreground">{selectedChart === 'weekly' ? 'mensal' : 'mensal'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Faturamento */}
            <Card className="bg-gradient-card shadow-card border-border">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Faturamento</div>
                  <div className="font-semibold text-dashboard-primary text-lg">
                    {ExcelProcessorService.formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedChart === 'weekly' ? 'no mês' : 'total'} (pontos × 3,25)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extras: apenas no Progresso Semanal */}
          {selectedChart === 'weekly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {/* Pontos na Semana */}
              <Card className="bg-gradient-card shadow-card border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Pontos da semana</div>
                    <div className="font-semibold text-foreground text-lg">{(stats.totalPoints ?? 0).toLocaleString('pt-BR')} pts</div>
                    {stats.weekRange && (
                      <div className="text-xs text-muted-foreground">{stats.weekRange}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progresso da Meta */}
              <Card className="bg-gradient-card shadow-card border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Progresso da Meta</div>
                    <div className="font-semibold text-dashboard-success text-lg">{(stats.progressPercentage ?? 0).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">em relação à meta mensal</div>
                  </div>
                </CardContent>
              </Card>

              {/* Restante para Meta */}
              <Card className="bg-gradient-card shadow-card border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Restante p/ Meta</div>
                    <div className="font-semibold text-dashboard-warning text-lg">{(stats.goalRemaining ?? 0).toLocaleString('pt-BR')} pts</div>
                    <div className="text-xs text-muted-foreground">de {(stats.totalGoalPoints ?? 0).toLocaleString('pt-BR')} pts</div>
                  </div>
                </CardContent>
              </Card>

              {/* Colaboradores Ativos */}
              <Card className="bg-gradient-card shadow-card border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Colaboradores Ativos</div>
                    <div className="font-semibold text-dashboard-info text-lg">{stats.activeEmployees ?? 0} / {stats.totalEmployees ?? 0}</div>
                    <div className="text-xs text-muted-foreground">fizeram pontos neste mês</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

    </div>
  );
}