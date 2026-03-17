import { useNavigate, useSearchParams } from 'react-router';
import { useEffect } from 'react';

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  useEffect(() => {
    console.error('=== 결제 실패 ===');
    console.error('에러 코드:', errorCode);
    console.error('에러 메시지:', errorMessage);
    console.error('전체 URL:', window.location.href);
  }, [errorCode, errorMessage]);

  return (
    <div className="bg-white relative w-[480px] mx-auto h-screen flex items-center justify-center px-[24px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 font-['Pretendard:Bold',sans-serif] text-[20px] mb-2">결제 실패</p>
        <p className="text-gray-600 font-['Pretendard:Regular',sans-serif] text-[14px] mb-1">
          {errorMessage || '결제가 취소되었습니다.'}
        </p>
        {errorCode && (
          <p className="text-gray-400 font-['Pretendard:Regular',sans-serif] text-[12px] mb-4">
            (오류 코드: {errorCode})
          </p>
        )}
        <button
          onClick={() => navigate('/points', { replace: true })}
          className="mt-6 px-6 py-3 bg-black text-white rounded-lg font-['Pretendard:SemiBold',sans-serif] text-[14px]"
        >
          포인트 페이지로 이동
        </button>
      </div>
    </div>
  );
}