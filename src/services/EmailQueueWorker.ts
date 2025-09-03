import emailjs from '@emailjs/browser';
import { supabase } from '@/integrations/supabase/client';

// Env (Vite)
const EMAILJS_SERVICE_ID = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

let started = false;
let intervalId: number | undefined;

// Janela de "recência" para evitar enviar backlog quando permissões/worker forem habilitados
// Somente processa itens criados dentro dos últimos X minutos
const FRESH_WINDOW_MINUTES = 10; // ajuste conforme necessidade

// Expirar itens muito antigos para não acumular pendências eternas
const EXPIRE_AFTER_MINUTES = 60; // marca como failed após 60 minutos

// Fallback local mapping (mesmo da Edge Function) caso a linha da fila não tenha o e-mail explícito
function getRecipient(name?: string): string | undefined {
  if (!name) return undefined;
  const map: Record<string, string> = {
    'Rodrigo': 'rodrigo@monitorarconsultoria.com.br',
    'Maurício': 'carlos.mauricio.prestserv@petrobras.com.br',
    'Matheus': 'Matheus.e.lima.prestserv@petrobras.com.br',
    'Wesley': 'Wesley_fgc@hotmail.com',
  };
  return map[name];
}

function ensureEmailJsInit() {
  if (EMAILJS_PUBLIC_KEY) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch {}
  }
}

async function expireOldPending(cutoffIso: string) {
  try {
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'failed', error: 'expired (older than policy)' })
      .eq('status', 'pending')
      .lt('created_at', cutoffIso);
    if (error) throw error;
  } catch (e) {
    // Silenciar erros de rede para não poluir console e não quebrar aplicação
    const errorMsg = (e as any)?.message || String(e);
    if (!errorMsg.includes('net::ERR_FAILED') && !errorMsg.includes('fetch')) {
      console.warn('[EmailQueueWorker] Erro ao expirar pendências antigas:', errorMsg);
    }
  }
}

async function fetchPending(limit = 1, sinceIso?: string) {
  try {
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending');

    if (sinceIso) {
      query = query.gte('created_at', sinceIso);
    }

    const { data, error } = await query
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).filter(Boolean);
  } catch (e) {
    // Retornar array vazio em caso de erro de rede para não quebrar o worker
    const errorMsg = (e as any)?.message || String(e);
    if (!errorMsg.includes('net::ERR_FAILED') && !errorMsg.includes('fetch')) {
      console.warn('[EmailQueueWorker] Erro ao buscar pendências:', errorMsg);
    }
    return [];
  }
}

function buildTemplateParams(item: any) {
  const toEmail = item.recipient_email || getRecipient(item.employee_name);
  return {
    to_email: toEmail,
    email: toEmail, // compatibilidade, caso o template use {{email}}
    to_name: item.recipient_name || item.employee_name,
    employee_name: item.employee_name,
    date: item.date,
    refinery: item.refinery,
    points: String(item.points ?? ''),
    observations: item.observations || 'Nenhuma observação',
    from_name: 'Sistema de Pontos'
  } as Record<string, string | undefined>;
}

async function markAsSent(id: string) {
  try {
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } catch (e) {
    // Silenciar erros de rede
    const errorMsg = (e as any)?.message || String(e);
    if (!errorMsg.includes('net::ERR_FAILED') && !errorMsg.includes('fetch')) {
      console.warn('[EmailQueueWorker] Erro ao marcar como enviado:', errorMsg);
    }
  }
}

async function markAsFailed(id: string, errMsg: string) {
  try {
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'failed', error: errMsg })
      .eq('id', id);
    if (error) throw error;
  } catch (e) {
    // Silenciar erros de rede
    const errorMsg = (e as any)?.message || String(e);
    if (!errorMsg.includes('net::ERR_FAILED') && !errorMsg.includes('fetch')) {
      console.warn('[EmailQueueWorker] Erro ao marcar como falhado:', errorMsg);
    }
  }
}

async function processOnce() {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[EmailQueueWorker] EmailJS env vars ausentes. Pulei processamento.');
    return;
  }
  ensureEmailJsInit();

  const now = Date.now();
  const freshSinceIso = new Date(now - FRESH_WINDOW_MINUTES * 60 * 1000).toISOString();
  const expireCutoffIso = new Date(now - EXPIRE_AFTER_MINUTES * 60 * 1000).toISOString();

  // Passo 1: expirar pendências muito antigas (não processar backlog)
  await expireOldPending(expireCutoffIso);

  // Passo 2: buscar somente itens "recentes" (apenas 1 por ciclo para evitar rajadas)
  let items: any[] = [];
  try {
    items = await fetchPending(1, freshSinceIso);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[EmailQueueWorker] Falha ao buscar fila (possível RLS). Erro:', e?.message || e);
    return;
  }

  for (const item of items) {
    try {
      const params = buildTemplateParams(item);
      if (!params.to_email) {
        // eslint-disable-next-line no-console
        console.error('[EmailQueueWorker] Sem destinatário. employee_name=', item?.employee_name, 'recipient_email=', item?.recipient_email);
        await markAsFailed(item.id, 'recipient_email vazio (422)');
        continue;
      }

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params as any, EMAILJS_PUBLIC_KEY);
      await markAsSent(item.id);
      // eslint-disable-next-line no-console
      console.log('[EmailQueueWorker] sent', item.id);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[EmailQueueWorker] failed', item.id, err);
      await markAsFailed(item.id, err?.message || String(err));
    }
  }
}

export function startEmailQueueWorker(options?: { intervalMs?: number }) {
  if (started) return;
  started = true;

  const interval = options?.intervalMs ?? 15000; // 15s

  // Primeira rodada imediata
  processOnce().catch(() => {});

  // Depois, loop com intervalo
  intervalId = window.setInterval(() => {
    processOnce().catch(() => {});
  }, interval);

  // eslint-disable-next-line no-console
  console.log('[EmailQueueWorker] started');
}

export function stopEmailQueueWorker() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
  }
  started = false;
  // eslint-disable-next-line no-console
  console.log('[EmailQueueWorker] stopped');
}