import svgPaths from "../../imports/svg-vzn95yzv5e";
import { Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TicketCard } from "../components/TicketCard";

export default function WinningTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pending');
  const { userData, isLoggedIn, isInitialized } = useApp();
  
  // 로그인 가드 - 초기화가 완료된 후에만 체크
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate, location]);

  // 초기화 중이거나 로그인 안 되어 있으면 로딩 표시
  if (!isInitialized || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 탭에 따라 필터링 (converted 티켓은 제외)
  const filteredTickets = userData.winningTickets.filter(ticket => {
    // 🔥 포인트로 전환된 티켓은 목록에서 제외
    if (ticket.status === 'converted') return false;
    
    if (activeTab === 'pending') return ticket.status === 'active';
    if (activeTab === 'completed') return ticket.status !== 'active';
    return true;
  });

  return (
    <div className="bg-white w-full max-w-[480px] mx-auto h-screen flex flex-col">
      {/* 헤더 - 고정 */}
      <div className="bg-white h-[56px] flex items-center px-[24px] border-b border-[#eaeaea] flex-shrink-0">
        <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[20px] text-black">
          당첨 티켓
        </h1>
      </div>

      {/* 탭 네비게이션 - 고정 */}
      <div className="bg-white border-b border-[#eaeaea] flex-shrink-0">
        <div className="flex gap-[16px] px-[24px]">
          <button
            onClick={() => setActiveTab('pending')}
            className="relative py-[14px] px-[2px]"
          >
            <span className={`text-[15px] ${
              activeTab === 'pending'
                ? "font-['Noto_Sans_KR:Medium',sans-serif] text-black"
                : "font-['Noto_Sans_KR:Regular',sans-serif] text-[#666]"
            }`}>
              발급 전
            </span>
            {activeTab === 'pending' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className="relative py-[14px] px-[2px]"
          >
            <span className={`text-[15px] ${
              activeTab === 'completed'
                ? "font-['Noto_Sans_KR:Medium',sans-serif] text-black"
                : "font-['Noto_Sans_KR:Regular',sans-serif] text-[#666]"
            }`}>
              발급 완료
            </span>
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </button>

          <div className="relative py-[14px] px-[2px] opacity-50 cursor-not-allowed">
            <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[#666] text-[15px]">
              거래소 등록
            </span>
          </div>
        </div>
      </div>

      {/* 스크롤 가능 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[24px] pt-[20px] pb-[80px]">
          <div className="flex items-center justify-between mb-[16px]">
            <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[13px] text-[#020202]">
              총 {filteredTickets.length}개
            </p>
          </div>
          
          <div className="flex flex-col gap-[12px]">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-[60px]">
                <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#999]">
                  {activeTab === 'pending' ? '발급 전 티켓이 없습니다' : '발급 완료된 티켓이 없습니다'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 - 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white w-full max-w-[480px] h-[64px] flex items-center justify-around border-t border-[#eaeaea] z-50">
        <Link to="/" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11a5580} fill="#DDDDDD" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            홈
          </span>
        </Link>

        <div className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p25895e80} fill="black" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-black mt-[4px]">
            당첨 티켓
          </span>
        </div>

        <Link to="/exchange" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11d16a80} fill="#DDDDDD" />
            <path d={svgPaths.p27aa6df0} fill="white" />
            <path d={svgPaths.p32251f80} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            거래소
          </span>
        </Link>

        <Link to="/points" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.pace200} fill="#DDDDDD" />
            <path d={svgPaths.p3b299900} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            포인트 충전
          </span>
        </Link>

        <Link to="/lucky-draw" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p1b936200} fill="#DDDDDD" />
            <path d={svgPaths.p32c2ee80} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            럭키드로우
          </span>
        </Link>
      </div>
    </div>
  );
}