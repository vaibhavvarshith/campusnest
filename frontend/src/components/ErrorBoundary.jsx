import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CampusNest ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F7FB',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(20, 45, 78, 0.08)',
              border: '1px solid #E2E8F0',
              padding: '36px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#142D4E', marginBottom: '8px' }}>
              Something Went Wrong
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              An unexpected error occurred while rendering this view. Your session and data are secure.
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  color: '#DC2626',
                  fontFamily: 'monospace',
                  marginBottom: '24px',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Home size={16} /> Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
