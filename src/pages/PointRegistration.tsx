import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { supabase } from '@/integrations/supabase/client';

// Configurações do EmailJS (via Vite)
const EMAILJS_SERVICE_ID = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

interface PointData {
  employee_name: string;
  refinery: string;
  points: number;
  observations?: string;
}

const PointRegistration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<PointData>({
    employee_name: 'Maurício',
    refinery: 'REVAP',
    points: 724,
    observations: 'Teste de envio de email'
  });

  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('✅ EmailJS initialized');
    } else {
      console.warn('⚠️ VITE_EMAILJS_PUBLIC_KEY não definido');
    }
  }, []);

  const getRecipientEmail = (name: string): string | undefined => {
    const map: Record<string, string> = {
      'Rodrigo': 'rodrigo@monitorarconsultoria.com.br',
      'Maurício': 'carlos.mauricio.prestserv@petrobras.com.br',
      'Matheus': 'Matheus.e.lima.prestserv@petrobras.com.br',
      'Wesley': 'Wesley_fgc@hotmail.com',
    };
    return map[name];
  };

  const sendConfirmationEmail = async (pointData: PointData): Promise<boolean> => {
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ EmailJS não configurado (verifique VITE_EMAILJS_*)');
        return false;
      }

      const recipientEmail = getRecipientEmail(pointData.employee_name);
      if (!recipientEmail) {
        console.error(`❌ Sem email para: ${pointData.employee_name}`);
        return false;
      }

      console.log(`📧 Enviando email para: ${recipientEmail}`);

      const templateParams = {
        to_email: recipientEmail,
        to_name: pointData.employee_name,
        employee_name: pointData.employee_name,
        date: new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        refinery: pointData.refinery,
        points: pointData.points.toString(),
        observations: pointData.observations || 'Nenhuma observação',
        from_name: 'Sistema de Pontos'
      } as Record<string, string>;

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('✅ Email enviado:', result);
      return true;
    } catch (error) {
      console.error('❌ Falha ao enviar email:', error);
      return false;
    }
  };

  const registerPoint = async (pointData: PointData) => {
    setLoading(true);
    setMessage('');

    try {
      // 1) Salvar ponto no banco (tabela entry já usada no app)
      const now = new Date();
      const iso = now.toISOString();
      // Buscar employee_id pelo real_name
      const { data: employee, error: empErr } = await supabase
        .from('employee')
        .select('id, real_name')
        .eq('real_name', pointData.employee_name)
        .maybeSingle();

      if (empErr) throw empErr;

      const employee_id = employee?.id ?? null;

      const { error: insertErr } = await supabase
        .from('entry')
        .insert({
          date: iso,
          employee_id,
          refinery: pointData.refinery,
          points: pointData.points,
          observations: pointData.observations || ''
        });

      if (insertErr) throw insertErr;

      console.log('✅ Ponto registrado no banco');

      // 2) Tentar enviar email direto via EmailJS
      const emailSent = await sendConfirmationEmail(pointData);

      setMessage(
        emailSent
          ? `✅ Ponto registrado e email enviado para ${pointData.employee_name}!`
          : `⚠️ Ponto registrado, mas falha no envio do email para ${pointData.employee_name}`
      );
    } catch (error: any) {
      console.error('❌ Erro ao registrar ponto:', error);
      setMessage(`❌ Erro ao registrar ponto: ${error.message || String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerPoint(form);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Teste de Envio de Email (EmailJS)</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Funcionário</label>
          <select
            className="w-full border rounded p-2"
            value={form.employee_name}
            onChange={(e) => setForm((f) => ({ ...f, employee_name: e.target.value }))}
          >
            <option>Rodrigo</option>
            <option>Maurício</option>
            <option>Matheus</option>
            <option>Wesley</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Refinaria</label>
          <input
            className="w-full border rounded p-2"
            value={form.refinery}
            onChange={(e) => setForm((f) => ({ ...f, refinery: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Pontos</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={form.points}
            onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Observações</label>
          <input
            className="w-full border rounded p-2"
            value={form.observations || ''}
            onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
          />
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Registrando...' : 'Registrar Ponto'}
        </button>
      </form>

      {message && (
        <div
          className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default PointRegistration;