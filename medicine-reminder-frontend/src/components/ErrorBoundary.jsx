import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown error',
    };
  }

  componentDidCatch(error, info) {
    console.error('[UI Crash]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-slate-100">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900/90 p-5">
            <h1 className="text-xl font-bold text-rose-300">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-300">
              The app hit an unexpected issue. Please reload and continue.
            </p>
            <p className="mt-2 rounded-lg bg-slate-800/80 p-2 text-xs text-slate-400">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
