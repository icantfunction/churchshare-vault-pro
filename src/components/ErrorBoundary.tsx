
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log('[DEBUG-600] ErrorBoundary: Component constructed');
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[DEBUG-701] ErrorBoundary: Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DEBUG-709] ErrorBoundary: Component error details:', error, errorInfo);
    console.error('[DEBUG-710] ErrorBoundary: Component stack:', errorInfo.componentStack);
  }

  componentDidMount() {
    console.log('[DEBUG-601] ErrorBoundary: Component mounted');
  }

  componentWillUnmount() {
    console.log('[DEBUG-602] ErrorBoundary: Component will unmount');
  }

  render() {
    if (this.state.hasError) {
      console.log('[DEBUG-711] ErrorBoundary: Rendering error fallback');
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Something went wrong. Please try refreshing the page.
                {this.state.error && (
                  <details className="mt-2">
                    <summary>Error details</summary>
                    <pre className="text-xs mt-1 overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => {
                console.log('[DEBUG-712] ErrorBoundary: Refresh button clicked');
                window.location.reload();
              }} 
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
