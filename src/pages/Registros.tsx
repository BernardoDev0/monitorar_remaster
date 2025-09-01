import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { CalculationsService } from "@/services/CalculationsService";
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit, 
  Calendar,
  Clock,
  User,
  Building2,
  Hash,
  MessageSquare
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

interface EntryRecord {
  id: number;
  date: string;
  time: string;
  employee: string;
  refinery: string;
  points: number;
  observations: string;
  status: "completed" | "absent" | "pending";
}

export default function Registros() {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState("todas");
  const [selectedEmployee, setSelectedEmployee] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<EntryRecord[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [employeesFull, setEmployeesFull] = useState<{id:number; real_name:string;}[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de edição/exclusão
  const [editOpen, setEditOpen] = useState(false);
  const [editRecordId, setEditRecordId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState(""); // dd/MM/yyyy
  const [editTime, setEditTime] = useState(""); // HH:mm
  const [editEmployeeId, setEditEmployeeId] = useState<string>("");
  const [editRefinery, setEditRefinery] = useState("");
  const [editPoints, setEditPoints] = useState<string>("0");
  const [editObs, setEditObs] = useState("");

  // Carregar dados do Supabase
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      
      // Buscar registros primeiro
      const { data: entries, error: entriesError } = await supabase
        .from('entry')
        .select('id, date, points, observations, refinery, employee_id')
        .order('date', { ascending: false })
        .limit(200);

      if (entriesError) throw entriesError;

      // Buscar funcionários
      const { data: employees, error: employeesError } = await supabase
        .from('employee')
        .select('id, real_name');

      if (employeesError) throw employeesError;

      setEmployeesFull(employees || []);

      // Criar mapa de funcionários para lookup rápido
      const employeeMap = employees?.reduce((map, emp) => {
        map[emp.id] = emp.real_name;
        return map;
      }, {} as Record<number, string>) || {};

      // Transformar dados para o formato da interface
      const transformedRecords: EntryRecord[] = entries?.map(entry => ({
        id: entry.id,
        date: format(parseISO(entry.date), 'dd/MM/yyyy', { locale: ptBR }),
        time: format(parseISO(entry.date), 'HH:mm', { locale: ptBR }),
        employee: employeeMap[entry.employee_id] || 'Desconhecido',
        refinery: entry.refinery,
        points: entry.points,
        observations: entry.observations,
        status: entry.points > 0 ? "completed" : "absent"
      })) || [];

      setRecords(transformedRecords);

      // Extrair funcionários únicos
      const uniqueEmployees = [...new Set(transformedRecords.map(r => r.employee))];
      setEmployees(uniqueEmployees);

    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edição
  const openEdit = (record: EntryRecord) => {
    setEditRecordId(record.id);
    setEditDate(record.date);
    setEditTime(record.time);
    const emp = employeesFull.find(e => e.real_name === record.employee);
    setEditEmployeeId(emp ? String(emp.id) : "");
    setEditRefinery(record.refinery);
    setEditPoints(String(record.points));
    setEditObs(record.observations);
    setEditOpen(true);
  };

  // Atualizar registro
  const handleUpdateRecord = async () => {
    if (!editRecordId) return;
    try {
      // Montar timestamp a partir de dd/MM/yyyy HH:mm
      const parsed = parse(`${editDate} ${editTime}`, 'dd/MM/yyyy HH:mm', new Date());
      const iso = parsed.toISOString();
      const employee_id = editEmployeeId ? parseInt(editEmployeeId) : undefined;
      const points = parseInt(editPoints || '0', 10);

      const { error } = await supabase
        .from('entry')
        .update({
          date: iso,
          employee_id,
          refinery: editRefinery,
          points,
          observations: editObs,
        })
        .eq('id', editRecordId);

      if (error) throw error;

      toast({ title: 'Registro atualizado', description: 'As alterações foram salvas.' });
      setEditOpen(false);
      await loadRecords();
    } catch (error:any) {
      console.error('Erro ao atualizar registro:', error);
      toast({ title: 'Erro', description: error.message || 'Falha ao atualizar registro.', variant: 'destructive' });
    }
  };

  // Excluir um registro
  const handleDeleteOne = async (id: number) => {
    try {
      const { error } = await supabase.from('entry').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Registro excluído', description: `Registro #${id} removido.` });
      await loadRecords();
    } catch (error:any) {
      console.error('Erro ao excluir:', error);
      toast({ title: 'Erro', description: error.message || 'Falha ao excluir registro.', variant: 'destructive' });
    }
  };

  // Excluir todos os registros
  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase.from('entry').delete().gte('id', 0);
      if (error) throw error;
      toast({ title: 'Todos os registros foram excluídos' });
      await loadRecords();
    } catch (error:any) {
      console.error('Erro ao excluir todos:', error);
      toast({ title: 'Erro', description: error.message || 'Falha ao excluir todos os registros.', variant: 'destructive' });
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.refinery.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.observations.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = selectedEmployee === "todos" || record.employee === selectedEmployee;
    
    // Filtro por semana baseado no ciclo 26→25 (usando intervalo para evitar problemas de timezone)
    let matchesWeek = true;
    if (selectedWeek !== "todas") {
      // Obter o intervalo da semana selecionada no ciclo atual
      const weekDates = CalculationsService.getWeekDates(selectedWeek);
      // Converter data de dd/MM/yyyy de volta para ISO para comparação
      const [day, month, year] = record.date.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      matchesWeek = isoDate >= weekDates.start && isoDate <= weekDates.end;
    }
    
    return matchesSearch && matchesEmployee && matchesWeek;
  });

  const exportToExcel = () => {
    try {
      // Preparar dados para exportação
      const exportData = filteredRecords.map(record => ({
        'Data': record.date,
        'Horário': record.time,
        'Funcionário': record.employee,
        'Refinaria': record.refinery,
        'Pontos': record.points,
        'Observações': record.observations,
        'Status': record.status === 'completed' ? 'Concluído' : 
                  record.status === 'absent' ? 'Ausente' : 'Pendente'
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Data
        { wch: 8 },  // Horário
        { wch: 15 }, // Funcionário
        { wch: 10 }, // Refinaria
        { wch: 8 },  // Pontos
        { wch: 30 }, // Observações
        { wch: 10 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Registros");

      // Gerar nome do arquivo com data atual
      const fileName = `registros_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      // Salvar arquivo
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Sucesso",
        description: `Arquivo ${fileName} baixado com sucesso!`,
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar dados para Excel",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-dashboard-success/20 text-dashboard-success border-dashboard-success/30">Concluído</Badge>;
      case "absent":
        return <Badge variant="destructive">Ausente</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-dashboard-warning/20 text-dashboard-warning border-dashboard-warning/30">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const totalPoints = filteredRecords.reduce((sum, record) => sum + record.points, 0);
  const completedRecords = filteredRecords.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registros</h1>
          <p className="text-muted-foreground">Gerenciamento e histórico de registros da equipe</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-dashboard-primary" />
                <span className="text-sm font-medium text-foreground">Total de Registros</span>
              </div>
              <p className="text-2xl font-bold text-dashboard-primary mt-2">{filteredRecords.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-dashboard-success" />
                <span className="text-sm font-medium text-foreground">Concluídos</span>
              </div>
              <p className="text-2xl font-bold text-dashboard-success mt-2">{completedRecords}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-dashboard-info" />
                <span className="text-sm font-medium text-foreground">Total de Pontos</span>
              </div>
              <p className="text-2xl font-bold text-dashboard-info mt-2">{totalPoints.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-dashboard-warning" />
                <span className="text-sm font-medium text-foreground">Média Diária</span>
              </div>
              <p className="text-2xl font-bold text-dashboard-warning mt-2">{Math.round(totalPoints / 7)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Semana:</label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="1">Semana 1</SelectItem>
                  <SelectItem value="2">Semana 2</SelectItem>
                  <SelectItem value="3">Semana 3</SelectItem>
                  <SelectItem value="4">Semana 4</SelectItem>
                  <SelectItem value="5">Semana 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Funcionário:</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Buscar:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar registros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ações:</label>
              <div className="flex gap-2">
                <Button 
                  variant="dashboard" 
                  size="sm" 
                  className="whitespace-nowrap"
                  onClick={exportToExcel}
                  disabled={filteredRecords.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
                {/* Excluir Todos com confirmação */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="dashboard" 
                      size="sm" 
                      className="whitespace-nowrap text-red-300 border-red-500/30 hover:text-red-100 hover:bg-red-500/20 hover:border-red-500/50"
                      disabled={records.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir Todos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza que quer excluir todos os dados?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é permanente e removerá todos os registros da tabela. Não poderá ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAll}>Excluir tudo</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seus Registros
            </div>
            <Badge variant="outline" className="text-dashboard-info border-dashboard-info/30">
              {filteredRecords.length} registros encontrados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-secondary/20">
                <TableHead className="text-foreground">Data</TableHead>
                <TableHead className="text-foreground">Horário</TableHead>
                <TableHead className="text-foreground">Funcionário</TableHead>
                <TableHead className="text-foreground">Refinaria</TableHead>
                <TableHead className="text-foreground">Pontos</TableHead>
                <TableHead className="text-foreground">Observações</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className="border-border hover:bg-secondary/10">
                    <TableCell className="text-foreground">{record.date}</TableCell>
                    <TableCell className="text-muted-foreground">{record.time}</TableCell>
                    <TableCell className="font-medium text-foreground">{record.employee}</TableCell>
                    <TableCell className="text-foreground">{record.refinery}</TableCell>
                    <TableCell className="font-mono text-dashboard-primary font-bold">
                      {record.points.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {record.observations}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-dashboard-primary/20" onClick={() => openEdit(record)}>
                          <Edit className="h-4 w-4 text-dashboard-primary" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-dashboard-danger/20">
                              <Trash2 className="h-4 w-4 text-dashboard-danger" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOne(record.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-gradient-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Registro</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize os campos e salve para aplicar as mudanças.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-foreground">Data</label>
              <Input value={editDate} onChange={e => setEditDate(e.target.value)} placeholder="dd/MM/yyyy" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-foreground">Horário</label>
              <Input value={editTime} onChange={e => setEditTime(e.target.value)} placeholder="HH:mm" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-foreground">Funcionário</label>
              <Select value={editEmployeeId} onValueChange={setEditEmployeeId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {employeesFull.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)}>{emp.real_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-foreground">Refinaria</label>
              <Input value={editRefinery} onChange={e => setEditRefinery(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-foreground">Pontos</label>
              <Input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-foreground">Observações</label>
              <Input value={editObs} onChange={e => setEditObs(e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button variant="dashboard" onClick={handleUpdateRecord}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}