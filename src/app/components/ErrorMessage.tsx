interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export default function ErrorMessage({ message, onRetry, fullScreen = false }: ErrorMessageProps) {
  const content = (
    <div className="text-center">
      <svg className="w-[80px] h-[80px] mx-auto mb-[24px] text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[18px] text-black mb-[12px]">
        오류가 발생했습니다
      </h3>
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-600 mb-[24px] leading-[1.6]">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-black text-white rounded-[8px] px-[32px] h-[48px] font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] active:scale-95 transition-transform"
        >
          다시 시도
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-[24px]">
        <div className="max-w-[400px]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-[80px] px-[24px]">
      {content}
    </div>
  );
}
