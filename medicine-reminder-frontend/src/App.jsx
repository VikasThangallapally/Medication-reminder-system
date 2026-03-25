import AppRoutes from './routes/AppRoutes';
import { useTheme } from './context/ThemeContext';

function App() {
  const { isLight } = useTheme();

  return (
    <div className={`scene-bg min-h-screen font-body ${isLight ? 'theme-light text-slate-800' : 'theme-dark text-slate-100'}`}>
      <div className="medical-grid" />
      <div className="ecg-scan" />
      <div className="medicine-float-layer" aria-hidden="true">
        <span className="pill-shape pill-a" />
        <span className="pill-shape pill-b" />
        <span className="pill-shape pill-c" />
        <span className="pill-shape pill-d" />
        <span className="pill-shape pill-e" />
        <span className="organ-shape organ-a" />
        <span className="organ-shape organ-b" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex-1">
          <AppRoutes />
        </div>

        <footer
          className={`mt-6 border-t px-4 py-3 text-center text-xs font-semibold tracking-wide ${
            isLight
              ? 'border-slate-300/60 bg-white/65 text-slate-700'
              : 'border-cyan-300/20 bg-slate-950/35 text-cyan-100/85'
          }`}
        >
          © 2026 Medical Reminder System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default App;
