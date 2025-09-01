import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EmployeeService } from "@/services/EmployeeService";

const Login = () => {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua chave de acesso.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se é CEO primeiro
      if (accessKey.trim().toLowerCase() === 'moni4242') {
        // Login do CEO
        const ceoUser = {
          id: 'ceo_001',
          username: 'luis',
          real_name: 'Luis',
          role: 'ceo',
          access_key: 'Moni4242'
        };
        
        localStorage.setItem("currentUser", JSON.stringify(ceoUser));
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo, Luis! (CEO)"
        });
        
        // Redirecionar para área administrativa
        navigate("/admin");
        return;
      }
      
      // Autenticar funcionário usando chave de acesso
      const employee = await EmployeeService.authenticateByAccessKey(accessKey.trim());
      
      if (employee) {
        // Salvar dados do funcionário no localStorage
        localStorage.setItem("currentUser", JSON.stringify(employee));
        
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${employee.real_name || employee.name}!`
        });
        
        // Redirecionar para dashboard
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Chave de acesso inválida. Verifique e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="w-full max-w-md space-y-8">
        <Card className="bg-gradient-card border-border/50 shadow-card animate-scale-in">
          <CardHeader>
            {/* Logo da empresa no lugar do título */}
            <div className="flex justify-center mb-4">
              <img 
                src="/moni2.ico" 
                alt="Logo da Empresa" 
                style={{width: '245px', height: 'auto'}}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">Chave de Acesso</Label>
                <Input
                  id="accessKey"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Digite sua chave de acesso"
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Autenticando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground animate-fade-in space-y-2">
          <p>Sistema de Controle de Pontos</p>
          <div className="text-xs opacity-75">
            <p><strong></strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;