import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary captured unexpected error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070b] text-white flex flex-col items-center justify-center p-6 font-mono select-none">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e1220] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-sans font-bold text-xl text-white tracking-wide mb-1">
                SURAKSHA RECOVERY MODE
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The console encountered a rendering anomaly. The local-first security layer has isolated the session.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART CONSOLE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
