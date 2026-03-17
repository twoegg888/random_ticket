import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export default function LoginCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { login } = useApp();
  const hasProcessed = useRef(false); // 🔥 중복 실행 방지

  const redirectUri = `${window.location.origin}/login/callback`;

  useEffect(() => {
    // 🔥 이미 처리했으면 스킵
    if (hasProcessed.current) {
      console.log('⚠️ Login callback already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');

      // 에러가 있으면 바로 로그인 페이지로 (에러 화면 없이)
      if (errorParam) {
        console.error('Kakao OAuth error:', errorParam, errorDescription);
        navigate('/login', { replace: true });
        return;
      }

      // code가 없으면 바로 로그인 페이지로
      if (!code) {
        navigate('/login', { replace: true });
        return;
      }

      // 🔥 처리 시작 플래그 설정
      hasProcessed.current = true;

      try {
        console.log('Processing login callback with code:', code);
        
        // 서버에 인증 코드 전송
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/auth/kakao/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              code,
              redirectUri,
            }),
          }
        );

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          console.error('Login failed:', data);
          // 에러 화면 없이 바로 로그인 페이지로
          navigate('/login', { replace: true });
          return;
        }

        if (data.success) {
          // 로그인 성공
          console.log('Login successful, user:', data.user);
          console.log('🔑 Access Token:', data.accessToken);
          
          // 🔥 await 추가하여 login 완료 대기
          await login(
            data.user.kakaoId,
            data.user.nickname,
            data.user.email,
            data.user.profileImage,
            data.accessToken
          );
          
          console.log('✅ Login completed, navigating to home...');
          
          // 즉시 홈으로 이동
          navigate('/', { replace: true });
        } else {
          // 에러 화면 없이 바로 로그인 페이지로
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Login error:', err);
        // 에러 화면 없이 바로 로그인 페이지로
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [location.search]); // 🔥 location.search만 의존성으로

  // 로딩 화면만 표시
  return (
    <div className="bg-white relative w-[480px] mx-auto h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-black font-semibold text-lg">로그인 중...</p>
        <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}