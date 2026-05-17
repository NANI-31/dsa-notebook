import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LuInfo, LuRefreshCw, LuLayers } from 'react-icons/lu';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-lg shadow-red-500/5">
            <LuInfo size={40} />
          </div>
          
          <h1 className="text-3xl font-extrabold text-text-main mb-4 tracking-tight">
            Something went wrong
          </h1>
          
          <p className="text-text-muted max-w-md mb-8 leading-relaxed">
            We encountered an unexpected error while rendering this page. Our team has been notified.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand/20"
            >
              <LuRefreshCw size={18} />
              Try Again
            </button>
            
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 bg-sidebar border border-border-subtle text-text-main px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/5 active:scale-95 shadow-sm"
            >
              <LuLayers size={18} />
              Back to Home
            </Link>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-12 p-6 bg-black/40 border border-red-500/20 rounded-2xl text-left max-w-2xl w-full overflow-auto">
              <p className="text-red-400 font-mono text-xs mb-2 uppercase tracking-widest font-bold">Error Trace</p>
              <pre className="text-text-muted font-mono text-[10px] whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
