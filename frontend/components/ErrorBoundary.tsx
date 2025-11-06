'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="container-app mt-8">
            <div className="card">
              <div className="card-body text-center py-16">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                  Something went wrong
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined })
                    window.location.reload()
                  }}
                  className="btn-primary"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

