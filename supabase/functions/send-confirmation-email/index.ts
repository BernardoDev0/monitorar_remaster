// Supabase Edge Function: send-confirmation-email
// Sistema híbrido: armazena dados para o frontend enviar via EmailJS
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Payload {
  employee_name: string;
  date: string;
  points: number;
  refinery: string;
  observations: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getRecipient(name: string): string | undefined {
  const map: Record<string, string> = {
    'Rodrigo': 'rodrigo@monitorarconsultoria.com.br',
    'Maurício': 'carlos.mauricio.prestserv@petrobras.com.br',
    'Matheus': 'Matheus.e.lima.prestserv@petrobras.com.br',
    'Wesley': 'Wesley_fgc@hotmail.com',
  };
  return map[name];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const payload = (await req.json()) as Payload;
    const to = getRecipient(payload.employee_name);

    if (!to) {
      return new Response(
        JSON.stringify({ error: `Recipient not found for employee '${payload.employee_name}'` }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`[send-confirmation-email] Processing email for: ${to} (employee: ${payload.employee_name})`);

    // Tentar alternativa GRATUITA: Resend.com (3000 emails/mês grátis)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (RESEND_API_KEY) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmação de Ponto Registrado</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0ea5e9;">Confirmação de Ponto Registrado</h2>
        
        <p>Olá <strong>${payload.employee_name}</strong>,</p>
        
        <p>Seu ponto foi registrado com sucesso:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>📅 Data/Hora:</strong> ${payload.date}</p>
            <p><strong>🏭 Refinaria:</strong> ${payload.refinery}</p>
            <p><strong>📊 Pontos:</strong> ${payload.points}</p>
            <p><strong>📝 Observações:</strong> ${payload.observations || 'Nenhuma observação'}</p>
        </div>
        
        <p>Atenciosamente,<br>
        <strong>Sistema de Pontos</strong></p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
            Esta é uma mensagem automática. Não responda este email.
        </p>
    </div>
</body>
</html>`;

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sistema de Pontos <noreply@bernardovelosotavares.dev>', // Você precisa configurar um domínio
            to: [to],
            subject: 'Confirmação de Ponto Registrado',
            html: emailHtml,
            text: `Olá ${payload.employee_name},\n\nSeu ponto foi registrado com sucesso:\n\nData/Hora: ${payload.date}\nRefinaria: ${payload.refinery}\nPontos: ${payload.points}\nObservações: ${payload.observations || 'Nenhuma observação'}\n\nAtenciosamente,\nSistema de Pontos`
          })
        });

        if (resendResponse.ok) {
          const resendResult = await resendResponse.json();
          console.log(`[send-confirmation-email] ✅ Email sent via Resend to: ${to}`, resendResult);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              provider: 'resend',
              sent_to: to,
              sent_from: 'noreply@bernardovelosotavares.dev',
              message: 'Email enviado com sucesso via Resend!',
              email_id: resendResult.id
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } else {
          const resendError = await resendResponse.text();
          console.error(`[send-confirmation-email] ❌ Resend error:`, resendError);
        }
      } catch (resendError) {
        console.error('[send-confirmation-email] ❌ Resend failed:', resendError);
      }
    }

    // Fallback: Armazenar no banco para o frontend processar com EmailJS
    try {
      const { data: notification, error: dbError } = await supabase
        .from('email_queue')
        .insert({
          recipient_email: to,
          recipient_name: payload.employee_name,
          employee_name: payload.employee_name,
          date: payload.date,
          refinery: payload.refinery,
          points: payload.points,
          observations: payload.observations || '',
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('[send-confirmation-email] Database insert failed:', dbError);
        throw dbError;
      }

      console.log(`[send-confirmation-email] ✅ Email queued for frontend processing:`, notification.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'frontend_queue',
          sent_to: to,
          queue_id: notification.id,
          message: 'Email adicionado à fila para envio via frontend',
          instructions: 'O frontend deve processar a fila e enviar via EmailJS'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } catch (dbError) {
      console.error('[send-confirmation-email] ❌ Database error:', dbError);
      
      // Última tentativa: resposta com dados para frontend processar
      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'immediate_frontend',
          email_data: {
            to: to,
            employee_name: payload.employee_name,
            date: payload.date,
            refinery: payload.refinery,
            points: payload.points,
            observations: payload.observations || ''
          },
          message: 'Dados do email retornados para o frontend processar imediatamente'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

  } catch (error) {
    console.error('[send-confirmation-email] ❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'internal_error',
        message: 'An unexpected error occurred',
        details: String(error)
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});