import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home, RefreshCw, Copy, Check, Terminal } from 'lucide-react';
import { safeLocalStorage, safeSessionStorage } from '../../core/storage/safeStorage';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  isRoot?: boolean;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[EditMee ErrorBoundary] Caught render error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  private handleReloadApp = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearStorageAndReload = () => {
    try {
      safeLocalStorage.clear();
      safeSessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  private handleCopyDiagnostics = () => {
    const report = [
      `EditMee Diagnostic Report`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}`,
      `UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'}`,
      `Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Unknown'}`,
      `\nStack Trace:\n${this.state.error?.stack || 'No stack trace available'}`,
      `\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'No component stack available'}`,
    ].join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report);
      }
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      // Fallback
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred.';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      if (this.props.isRoot) {
        return (
          <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 overflow-x-hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 max-w-xl w-full text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  EditMee
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  EditMee encountered a temporary loading problem.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={this.handleReloadApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload EditMee
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={this.handleCopyDiagnostics}
                  className="hover:text-slate-400 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  {this.state.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{this.state.copied ? 'Copied' : 'Copy Diagnostics'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[280px] flex items-center justify-center p-3 sm:p-6 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {this.props.fallbackTitle || 'Error loading tool workspace'}
              </h3>
              <p className="text-xs text-rose-300 font-mono mt-1 leading-relaxed break-words px-2">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Component
              </button>
              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              >
                {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{this.state.copied ? 'Copied' : 'Copy Error'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

