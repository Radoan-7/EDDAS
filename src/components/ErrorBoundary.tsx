import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("EDAAS render error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" className="grid min-h-screen place-items-center bg-slate-50 p-6">
          <section className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg">
            <AlertTriangle size={32} className="mx-auto text-red-700" />
            <h1 className="mt-3 text-lg font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">The page could not be displayed. Reload the app to try again.</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Reload app</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
