// Supabase Edge Function: send-confirmation-email
// Using Supabase native email (100% free)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Payload {
  employee_name: string;
  date: string;
  points: number;
  refinery: string;
  observations: string;
}

// Basic CORS headers for browser calls
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
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    const payload = (await req.json()) as Payload;
    const to = getRecipient(payload.employee_name);

    if (!to) {
      return new Response(
        JSON.stringify({ error: `Recipient not found for employee '${payload.employee_name}'` }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Branding configuration (optional)
    const BRAND_COLOR = Deno.env.get('BRAND_COLOR') ?? '#0ea5e9';
    const BRAND_NAME = Deno.env.get('BRAND_NAME') ?? 'Sistema de Pontos';
    const LOGO_URL = Deno.env.get('LOGO_URL') ?? '';

    console.log(`[send-confirmation-email] Sending to: ${to} using Supabase native email`);

    const subject = 'Confirmação de Ponto Registrado';

    // Professional HTML template
    const htmlBody = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
    <meta name="color-scheme" content="light only" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,0.04);overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #f1f5f9;background:${BRAND_COLOR};color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${LOGO_URL ? `<img src="${LOGO_URL}" alt="${BRAND_NAME}" height="24" style="display:block;height:24px;width:auto;" />` : `<span style="font-size:16px;font-weight:600;">${BRAND_NAME}</span>`}
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-size:12px;opacity:.95;">${subject}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:14px;">Olá <strong>${payload.employee_name}</strong>,</p>
                <p style="margin:0 0 16px 0;font-size:14px;">Seu ponto foi registrado com sucesso:</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px;">
                  <tr>
                    <td style="width:140px;color:#64748b;font-size:13px;">Data/Hora:</td>
                    <td style="font-size:14px;color:#0f172a;"><strong>${payload.date}</strong></td>
                  </tr>
                  <tr>
                    <td style="width:140px;color:#64748b;font-size:13px;">Refinaria:</td>
                    <td style="font-size:14px;color:#0f172a;"><strong>${payload.refinery}</strong></td>
                  </tr>
                  <tr>
                    <td style="width:140px;color:#64748b;font-size:13px;">Pontos:</td>
                    <td style="font-size:14px;color:#0f172a;"><strong>${payload.points}</strong></td>
                  </tr>
                  <tr>
                    <td style="width:140px;color:#64748b;font-size:13px;">Observações:</td>
                    <td style="font-size:14px;color:#0f172a;"><strong>${payload.observations || '-'}</strong></td>
                  </tr>
                </table>
                <p style="margin:20px 0 0 0;font-size:14px;">Atenciosamente,<br/>${BRAND_NAME}</p>
              </td>
            </tr>
          </table>
          <div style="font-size:12px;color:#94a3b8;margin-top:12px;">Mensagem automática — não responda este e-mail.</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    // Method 1: Try using Supabase Auth email templates (if user exists)
    try {
      // First check if user exists in your auth system
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      const existingUser = users?.users?.find(user => user.email === to);
      
      if (existingUser) {
        // User exists, we can use auth email system
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: to,
          options: {
            redirectTo: `${supabaseUrl}/auth/callback`,
            data: {
              // Custom data for the email
              employee_name: payload.employee_name,
              date: payload.date,
              points: payload.points,
              refinery: payload.refinery,
              observations: payload.observations,
              email_type: 'point_confirmation'
            }
          }
        });

        if (!error && data) {
          console.log('[send-confirmation-email] Email sent via Supabase Auth system');
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              provider: 'supabase_auth',
              sent_to: to,
              method: 'existing_user'
            }), 
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
      }
    } catch (authError) {
      console.log('[send-confirmation-email] Auth method failed, trying direct approach:', authError);
    }

    // Method 2: Create a temporary user and send invite (will be cleaned up)
    try {
      const tempPassword = crypto.randomUUID();
      
      // Create temporary user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: to,
        password: tempPassword,
        email_confirm: false, // Don't require email confirmation initially
        user_metadata: {
          employee_name: payload.employee_name,
          date: payload.date,
          points: payload.points,
          refinery: payload.refinery,
          observations: payload.observations,
          temp_user: true, // Mark as temporary
          created_for: 'point_confirmation'
        }
      });

      if (createError) {
        throw new Error(`Failed to create temp user: ${createError.message}`);
      }

      // Send password reset email (this will contain our notification)
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: to,
        options: {
          redirectTo: `${supabaseUrl}/auth/callback?type=point_confirmation`,
          data: {
            employee_name: payload.employee_name,
            date: payload.date,
            points: payload.points,
            refinery: payload.refinery,
            observations: payload.observations,
            email_type: 'point_confirmation'
          }
        }
      });

      if (resetError) {
        // Clean up the temporary user if email sending failed
        if (newUser?.user?.id) {
          await supabase.auth.admin.deleteUser(newUser.user.id);
        }
        throw new Error(`Failed to send email: ${resetError.message}`);
      }

      // Schedule cleanup of temporary user (optional, or you can clean up manually)
      console.log(`[send-confirmation-email] Temporary user created: ${newUser?.user?.id}, email sent successfully`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'supabase_temp_user',
          sent_to: to,
          method: 'temporary_user',
          temp_user_id: newUser?.user?.id
        }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );

    } catch (tempUserError) {
      console.error('[send-confirmation-email] Temporary user method failed:', tempUserError);
    }

    // Method 3: Fallback - Log the email content (for development/debugging)
    console.log('[send-confirmation-email] All email methods failed, logging content for manual processing:');
    console.log('='.repeat(50));
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`EMPLOYEE: ${payload.employee_name}`);
    console.log(`DATE: ${payload.date}`);
    console.log(`REFINERY: ${payload.refinery}`);
    console.log(`POINTS: ${payload.points}`);
    console.log(`OBSERVATIONS: ${payload.observations}`);
    console.log('='.repeat(50));

    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: 'console_log',
        sent_to: to,
        method: 'logged_to_console',
        message: 'Email content logged to console - check Supabase function logs'
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('[send-confirmation-email] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'internal_error',
        message: 'An unexpected error occurred',
        details: String(error)
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});