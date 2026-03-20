import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { kakaoRestApiKey } from '../../../utils/supabase/info';
import imgKakao from "figma:asset/152a75c45e952c474894abadfecac91956cd1209.png";
const BRAND_LOGO_URL = 'https://dbase01.cafe24.com/box_logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isInitialized } = useApp();

  const redirectUri = `${window.location.origin}/login/callback`;
  
  // 로그인 후 돌아갈 페이지 (state로 전달받음)
  const from = (location.state as any)?.from?.pathname || '/';

  // 초기화 완료 후, 이미 로그인된 경우 원래 가려던 페이지로 리다이렉트
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate, from]);

  // 초기화가 완료되지 않았으면 로딩 화면 표시
  if (!isInitialized) {
    return (
      <div className="bg-white relative w-[480px] mx-auto h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleKakaoLogin = () => {
    if (!kakaoRestApiKey) {
      alert('카카오 로그인 설정이 누락되었습니다.');
      return;
    }

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="bg-white relative w-[480px] mx-auto h-screen">
      {/* 상단 로고 */}
      <div className="absolute left-0 right-0 top-0 flex h-[64px] items-center px-[20px]">
        <div className="flex h-[32px] w-[132px] items-center">
          <img
            src={BRAND_LOGO_URL}
            alt="Centbox"
            className="h-full w-full object-contain object-left"
          />
        </div>
      </div>

      {/* 타이틀 영역 */}
      <div className="absolute left-0 right-0 top-[136px] px-[28px]">
        <div className="flex flex-col gap-[15px] pb-[0.8px]">
          <div className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold text-[26.25px] text-black leading-[28px]">
            <p className="mb-0">안녕하세요,</p>
            <p>랜덤티켓입니다</p>
          </div>
          <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14.875px] text-[#666] leading-[20.8px]">
            <p>로그인하고 다양한 혜택을 만나보세요!</p>
          </div>
        </div>
      </div>

      {/* 로그인 버튼 영역 */}
      <div className="absolute bottom-[283px] left-0 right-0 flex flex-col gap-[16px] items-center justify-center p-[24px]">
        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="bg-[#f9df4a] rounded-[14px] w-full flex items-center justify-between pl-[20px] pr-[20.02px] py-[16px] hover:bg-[#f5d835] transition-colors"
        >
          <div className="size-[24px]">
            <img src={imgKakao} alt="카카오" className="size-full" />
          </div>
          <div className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold text-[15px] text-black leading-[20.8px]">
            카카오 로그인
          </div>
          <div className="size-[24px]" />
        </button>
      </div>
    </div>
  );
}
