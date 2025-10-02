import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { EMPLOYEE_STATUS_CONFIG } from "@/lib/constants";
import { formatNumberWithSeparators, getInitials } from "@/lib/shared-utils";

interface EmployeeCardProps {
  name: string;
  role?: string;
  weeklyPoints: number;
  weeklyGoal: number;
  monthlyPoints: number;
  monthlyGoal: number;
  weeklyProgress: number;
  monthlyProgress: number;
  status: "below" | "on-track" | "above";
}

export function EmployeeCard({
  name,
  role = "Funcionário",
  weeklyPoints,
  weeklyGoal,
  monthlyPoints,
  monthlyGoal,
  weeklyProgress,
  monthlyProgress,
  status
}: EmployeeCardProps) {
  // Usando utilitários centralizados
  const getStatusConfig = () => {
    const config = EMPLOYEE_STATUS_CONFIG[status];
    return {
      ...config,
      icon: status === "above" ? CheckCircle : status === "on-track" ? Clock : AlertTriangle
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-gradient-card shadow-card border-border/70 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-dashboard-primary/20 border border-dashboard-primary/30 ring-1 ring-dashboard-primary/30">
            <AvatarFallback className="bg-dashboard-primary text-primary-foreground font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
          <Badge 
            variant={statusConfig.variant} 
            className={`gap-1 ${statusConfig.badgeClass}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.badge}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bloco Semanal */}
          <div className="space-y-2 rounded-lg p-3 bg-card/30 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dashboard-info"></div>
              <span className="text-sm font-medium text-foreground">Semanal</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-semibold text-dashboard-info">{formatNumberWithSeparators(weeklyPoints)}<span className="ml-1 text-sm text-muted-foreground">pts</span></div>
              <div className="text-xs text-muted-foreground">Meta: {formatNumberWithSeparators(weeklyGoal)}</div>
            </div>
            <Progress value={weeklyProgress} className="h-1.5 bg-white/10" />
            <div className="text-xs text-muted-foreground">{weeklyProgress.toFixed(1)}% da meta semanal</div>
          </div>
          
          {/* Bloco Mensal */}
          <div className="space-y-2 rounded-lg p-3 bg-card/30 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dashboard-secondary"></div>
              <span className="text-sm font-medium text-foreground">Mensal</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-semibold text-dashboard-secondary">{formatNumberWithSeparators(monthlyPoints)}<span className="ml-1 text-sm text-muted-foreground">pts</span></div>
              <div className="text-xs text-muted-foreground">Meta: {formatNumberWithSeparators(monthlyGoal)}</div>
            </div>
            <Progress value={monthlyProgress} className="h-1.5 bg-white/10" />
            <div className="text-xs text-muted-foreground">{monthlyProgress.toFixed(1)}% da meta mensal</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}