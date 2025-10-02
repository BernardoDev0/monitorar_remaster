import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { EmployeeCard } from "@/components/Dashboard/EmployeeCard";
import { ProgressSection } from "@/components/Dashboard/ProgressSection";
import { EmployeeService, Employee } from "@/services/EmployeeService";
import { CalculationsService } from "@/services/CalculationsService";
import { PageLoading, useLoading } from "@/components/ui/loading-state";

interface EmployeeMetrics extends Employee {
  weeklyPoints: number;
  weeklyGoal: number;
  monthlyPoints: number;
  monthlyGoal: number;
  weeklyProgress: number;
  monthlyProgress: number;
  status: "below" | "on-track" | "above";
}

const Index = () => {
  const [selectedWeek, setSelectedWeek] = useState(String(CalculationsService.getCurrentWeek()));
  const [employees, setEmployees] = useState<EmployeeMetrics[]>([]);
  const { loading, withLoading } = useLoading(true);
  const navigate = useNavigate();

  // Carregar dados dos funcionários
  const loadEmployeesData = async () => {
    await withLoading(async () => {
      const allEmployees = await EmployeeService.getAllEmployees();
      
      // Calcular métricas para cada funcionário
      const employeesWithMetrics = await Promise.all(
        allEmployees.map(async (employee) => {
          const weekDates = CalculationsService.getWeekDates(selectedWeek);
          const monthDates = CalculationsService.getMonthCycleDates();
          
          const weeklyPoints = await EmployeeService.getWeekPoints(employee.id, weekDates);
          console.log('DEBUG - Pontos semanais:', employee.real_name, weeklyPoints, 'Período:', weekDates.start, 'até', weekDates.end);
          
          // CORREÇÃO: Pontos mensais devem ser apenas até hoje, não do mês inteiro
          // FORÇAR timezone de São Paulo para funcionar no Vercel
          const today = new Date();
          const saoPauloDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
          const localDateYYYYMMDD = `${saoPauloDate.getFullYear()}-${(saoPauloDate.getMonth() + 1).toString().padStart(2, '0')}-${saoPauloDate.getDate().toString().padStart(2, '0')}`;
          console.log('DEBUG - Hoje (São Paulo):', localDateYYYYMMDD);
          const monthlyPoints = await EmployeeService.getMonthPoints(employee.id, {
            start: monthDates.start,
            end: localDateYYYYMMDD // Usar a data local formatada
          });
          console.log('DEBUG - Pontos mensais:', employee.real_name, monthlyPoints, 'Período:', monthDates.start, 'até', localDateYYYYMMDD);
          
          const weeklyGoal = CalculationsService.getWeeklyGoal(employee);
          const monthlyGoal = CalculationsService.getMonthlyGoal(employee);
          
          const weeklyProgress = CalculationsService.calculateProgressPercentage(weeklyPoints, weeklyGoal);
          const monthlyProgress = CalculationsService.calculateProgressPercentage(monthlyPoints, monthlyGoal);
          
          const computedStatus = CalculationsService.getEmployeeStatus(weeklyProgress);
          const status: EmployeeMetrics["status"] =
            computedStatus === "top-performer" ? "above" :
            computedStatus === "on-track" ? "on-track" : "below";
          
          return {
            ...employee,
            weeklyPoints,
            weeklyGoal,
            monthlyPoints,
            monthlyGoal,
            weeklyProgress,
            monthlyProgress,
            status
          } as EmployeeMetrics;
        })
      );
      
      setEmployees(employeesWithMetrics);
    });
  };

  // Verificar se o usuário tem permissão (CEO)
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== "ceo") {
      navigate("/dashboard");
      return;
    }
    
    loadEmployeesData();
  }, [navigate, selectedWeek]);

  // Calcular métricas totais
  const filteredEmployees = employees.filter(emp => (emp.real_name || emp.name) !== 'Rodrigo');
  const totalWeeklyPoints = filteredEmployees.reduce((sum, emp) => sum + emp.weeklyPoints, 0);
  const totalMonthlyPoints = filteredEmployees.reduce((sum, emp) => sum + emp.monthlyPoints, 0);
  console.log('DEBUG - Total de Pontos Semanais Agregados:', totalWeeklyPoints);
  console.log('DEBUG - Total de Pontos Mensais Agregados:', totalMonthlyPoints);
  const totalMonthlyGoal = 29500; // Meta mensal fixa da equipe (exclui Rodrigo)
  
  // CORREÇÃO: Progresso da equipe deve ser baseado nos pontos semanais, não mensais
  // pois estamos mostrando "Progresso da Equipe Esta Semana"
  const teamProgress = (totalWeeklyPoints / (totalMonthlyGoal / 5)) * 100; // Meta semanal = Meta mensal / 5

  if (loading) {
    return (
      <PageLoading 
        title="Carregando Dashboard Executivo" 
        description="Buscando dados da equipe..." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground">Visão geral da performance da equipe</p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total de Pontos Desta Semana",
            value: totalWeeklyPoints.toLocaleString(),
            subtitle: `Faturamento: R$ ${(totalWeeklyPoints * 3.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: "trending" as const,
            variant: "primary" as const
          },
          {
            title: "Pontos Acumulados no Mês",
            value: totalMonthlyPoints.toLocaleString(),
            subtitle: `Faturamento: R$ ${(totalMonthlyPoints * 3.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: "default" as const
          },
          {
            title: "Progresso da Equipe Esta Semana",
            value: `${teamProgress.toFixed(1)}%`,
            icon: "users" as const,
            variant: teamProgress >= 50 ? ("success" as const) : ("warning" as const)
          }
        ].map((metric, index) => (
          <div key={metric.title}>
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Progresso Geral */}
      <div>
        <ProgressSection
          totalPoints={totalMonthlyPoints}
          totalGoal={totalMonthlyGoal} 
          completedPercentage={teamProgress}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
        />
      </div>

      {/* Cards dos Funcionários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employees.map((employee, index) => (
          <div key={employee.name}>
            <EmployeeCard
              name={employee.real_name || employee.name}
              role={employee.role}
              weeklyPoints={employee.weeklyPoints}
              weeklyGoal={employee.weeklyGoal}
              monthlyPoints={employee.monthlyPoints}
              monthlyGoal={employee.monthlyGoal}
              weeklyProgress={employee.weeklyProgress}
              monthlyProgress={employee.monthlyProgress}
              status={employee.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
