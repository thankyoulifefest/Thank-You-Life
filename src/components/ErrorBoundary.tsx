import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F3] px-4 py-16 text-[#1E1C18]">
          <div className="mx-auto max-w-xl rounded-xl border border-[#1F4E32]/20 bg-white p-8">
            <h1 className="font-display text-2xl font-bold text-[#1F4E32]">
              Unable to load this view
            </h1>
            <p className="mt-2 text-sm text-[#4B5D4F]">
              Something went wrong while communicating with the database or rendering the interface.
            </p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-[#1F4E32]/15 bg-[#FAF8F3] p-3 font-mono text-xs text-[#1E1C18]">
              {this.state.errorMessage}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-[#1F4E32] px-4 py-2.5 text-sm font-semibold text-[#FAF8F3] hover:bg-[#163924]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
