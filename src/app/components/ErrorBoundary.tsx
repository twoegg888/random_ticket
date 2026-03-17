import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-[24px]">
          <div className="max-w-[400px] text-center">
            <div className="mb-[32px]">
              <svg className="w-[120px] h-[120px] mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[24px] text-black mb-[12px]">
              오류가 발생했습니다
            </h1>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-600 mb-[32px] leading-[1.6]">
              예상치 못한 오류가 발생했습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>
            {this.state.error && (
              <div className="bg-gray-50 rounded-[12px] p-[16px] mb-[32px] text-left">
                <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-gray-500 mb-[8px]">
                  에러 메시지:
                </p>
                <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] text-gray-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-black text-white rounded-[12px] h-[52px] font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] active:scale-95 transition-transform"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
