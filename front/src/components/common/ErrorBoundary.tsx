import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Vous pouvez ajouter ici un service de journalisation d'erreurs
    // Par exemple : errorLoggingService.logError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center bg-red-50 dark:bg-red-900 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Une erreur s'est produite
          </h2>
          <p className="text-red-600 dark:text-red-300">
            L'application a rencontré un problème. Veuillez rafraîchir la page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;