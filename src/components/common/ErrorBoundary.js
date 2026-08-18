'use client';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console or external service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid py-5" style={{ minHeight: '80vh' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div className="py-5">
                  <i className="fa fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                  <h2 className="mb-4">Something went wrong</h2>
                  <p className="text-muted mb-4">
                    We're sorry, but something unexpected happened. Please try refreshing the page.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fa fa-refresh me-2"></i>
                      Refresh Page
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => window.history.back()}
                    >
                      <i className="fa fa-arrow-left me-2"></i>
                      Go Back
                    </button>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4 text-start">
                      <summary className="btn btn-outline-secondary btn-sm">
                        Show Error Details
                      </summary>
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6>Error:</h6>
                        <pre className="text-danger small">
                          {this.state.error.toString()}
                        </pre>
                        {this.state.errorInfo && (
                          <>
                            <h6>Component Stack:</h6>
                            <pre className="text-muted small">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;