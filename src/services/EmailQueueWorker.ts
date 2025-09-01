import emailjs from '@emailjs/browser';
import { supabase } from '@/integrations/supabase/client';

// Env (Vite)
const EMAILJS_SERVICE_ID = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

let started = false;
let intervalId: number | undefined;

function ensureEmailJsInit() {
  if (EMAILJS_PUBLIC_KEY) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch {}
  }
}

async function fetchPending(limit = 5) {
  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

function buildTemplateParams(item: any) {
  return {
    to_email: item.recipient_email,
    to_name: item.recipient_name || item.employee_name,
    employee_name: item.employee_name,
    date: item.date,
    refinery: item.refinery,
    points: String(item.points ?? ''),
    observations: item.observations || 'Nenhuma observação',
    from_name: 'Sistema de Pontos'
  } as Record<string, string>;
}

async function markAsSent(id: string) {
  const { error } = await supabase
    .from('email_queue')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function markAsFailed(id: string, errMsg: string) {
  const { error } = await supabase
    .from('email_queue')
    .update({ status: 'failed', error: errMsg })
    .eq('id', id);
  if (error) throw error;
}

async function processOnce() {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    // Config faltando, não processa
    return;
  }
  ensureEmailJsInit();

  const items = await fetchPending(5);
  for (const item of items) {
    try {
      const params = buildTemplateParams(item);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY);
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