
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('[DEBUG-001] Main.tsx: Application bootstrap starting');
console.log('[DEBUG-002] Main.tsx: Creating React root');

const root = createRoot(document.getElementById("root")!);

console.log('[DEBUG-003] Main.tsx: Rendering App component');
root.render(<App />);

console.log('[DEBUG-004] Main.tsx: Initial render complete');
