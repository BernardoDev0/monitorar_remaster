import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startEmailQueueWorker } from './services/EmailQueueWorker';

// Tratamento de erro global para evitar tela preta
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
  
  // Iniciar worker de email de forma segura
  try {
    startEmailQueueWorker({ intervalMs: 15000 });
  } catch (workerError) {
    console.warn('Erro ao iniciar EmailQueueWorker:', workerError);
    // Não bloquear a aplicação se o worker falhar
  }
} catch (error) {
  console.error('Erro crítico ao inicializar aplicação:', error);
  
  // Fallback: mostrar mensagem de erro básica
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
        background: #0f172a;
        color: #f1f5f9;
        padding: 2rem;
      ">
        <div style="
          max-width: 400px;
          text-align: center;
          background: #1e293b;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid #334155;
        ">
          <h1 style="margin: 0 0 1rem 0; color: #ef4444;">Erro de Inicialização</h1>
          <p style="margin: 0 0 1.5rem 0; color: #94a3b8;">
            Não foi possível carregar a aplicação. Isso pode ser devido a:
          </p>
          <ul style="text-align: left; color: #94a3b8; margin: 0 0 1.5rem 0;">
            <li>Navegador muito antigo</li>
            <li>JavaScript desabilitado</li>
            <li>Bloqueios de rede corporativa</li>
            <li>Modo privado/incógnito</li>
          </ul>
          <button onclick="window.location.reload()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
          ">
            Tentar Novamente
          </button>
        </div>
      </div>
    `;
  }
}
