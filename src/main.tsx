import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startEmailQueueWorker } from './services/EmailQueueWorker';

createRoot(document.getElementById("root")!).render(<App />);

startEmailQueueWorker({ intervalMs: 15000 });
