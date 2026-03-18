import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useApp } from "../context/AppContext";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import svgPaths from "../../imports/svg-vzn95yzv5e";

// 🔥 백엔드에서 럭키드로우 데이터 가져오기
type LuckyDrawProduct = {
  id: string;
  brand: string;
  name: string;
  imageUrl: string;
  entryPoints: number;
  status: 'active' | 'ended';
  winnerId?: string;
};

export default function LuckyDraw() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isLoggedIn, isInitialized, enterLuckyDraw } = useApp();
  const [luckyDraws, setLuckyDraws] = useState<LuckyDrawProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 로그인 가드
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate, location]);

  // 🔥 백엔드에서 럭키드로우 목록 가져오기
  useEffect(() => {
    const fetchLuckyDraws = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/lucky-draws`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }
        );
        const data = await response.json();
        
        if (data.success) {
          const draws = data.luckyDraws.map((draw: any) => ({
            id: draw.id,
            brand: draw.brand,
            name: draw.name,
            imageUrl: draw.imageUrl,
            entryPoints: draw.entryPoints,
            status: draw.winnerId ? 'ended' : 'active',
            winnerId: draw.winnerId,
          }));
          setLuckyDraws(draws);
        }
      } catch (error) {
        console.error('Error fetching lucky draws:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchLuckyDraws();
    }
  }, [isLoggedIn]);

  // 참여하기
  const handleEnter = async (draw: LuckyDrawProduct) => {
    if (userData.points < draw.entryPoints) {
      alert('포인트가 부족합니다.');
      return;
    }

    if (!confirm(`${draw.entryPoints.toLocaleString()}P로 참여하시겠습니까?`)) {
      return;
    }

    try {
      const success = await enterLuckyDraw(draw.id, draw.name, draw.entryPoints);

      if (success) {
        alert('럭키드로우에 참여했습니다!');
      } else {
        alert('참여에 실패했습니다.');
      }
    } catch (error) {
      alert('참여 중 오류가 발생했습니다.');
    }
  };

  if (!isInitialized || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-[480px] mx-auto h-screen flex flex-col">
      {/* 헤더 - 고정 */}
      <div className="bg-white h-[56px] flex items-center px-[24px] border-b border-[#eaeaea] flex-shrink-0">
        <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] text-black">
          럭키드로우
        </p>
      </div>

      {/* 스크롤 가능 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[24px] pt-[24px] pb-[80px]">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
          </div>
        ) : luckyDraws.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎲</div>
            <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-[#999] mb-2">
              진행 중인 럭키드로우가 없습니다
            </p>
            <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#ccc]">
              관리자 페이지에서 럭키드로우를 추가해주세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[16px]">
            {luckyDraws.map((draw) => (
              <div key={draw.id} className="bg-white border border-[#eaeaea] rounded-[12px] p-[12px]">
                <div className="bg-[#f5f5f5] rounded-[8px] h-[140px] mb-[12px] overflow-hidden relative">
                  <img
                    src={draw.imageUrl}
                    alt={draw.name}
                    className="w-full h-full object-contain"
                  />
                  {draw.status === 'ended' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="font-['Pretendard:Bold',sans-serif] text-white text-[14px]">
                        마감
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-['Pretendard:Medium',sans-serif] text-[13px] text-black mb-[2px]">
                  {draw.brand}
                </h3>
                <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#666] mb-[8px] line-clamp-1">
                  {draw.name}
                </p>
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="font-['Pretendard:Regular',sans-serif] text-[11px] text-[#999]">
                    참여 포인트
                  </span>
                  <span className="font-['Pretendard:Bold',sans-serif] text-[13px] text-black">
                    {draw.entryPoints.toLocaleString()}P
                  </span>
                </div>
                {draw.status === 'active' ? (
                  <button
                    onClick={() => handleEnter(draw)}
                    className="w-full bg-black text-white font-['Pretendard:Medium',sans-serif] text-[13px] rounded-[6px] py-[8px] hover:bg-gray-800"
                  >
                    참여하기
                  </button>
                ) : (
                  <div className="w-full bg-[#eaeaea] text-[#999] font-['Pretendard:Medium',sans-serif] text-[13px] rounded-[6px] py-[8px] text-center">
                    마감
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* 하단 네비게이션 - 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white w-full max-w-[480px] h-[64px] flex items-center justify-around border-t border-[#eaeaea] z-50">
        <Link to="/" className="flex flex-col items-center">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11a5580} fill="#DDDDDD" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            홈
          </span>
        </Link>

        <Link to="/winning-tickets" className="flex flex-col items-center">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p25895e80} fill="#DDDDDD" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            당첨 티켓
          </span>
        </Link>

        <Link to="/exchange" className="flex flex-col items-center">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11d16a80} fill="#DDDDDD" />
            <path d={svgPaths.p27aa6df0} fill="white" />
            <path d={svgPaths.p32251f80} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            거래소
          </span>
        </Link>

        <Link to="/points" className="flex flex-col items-center">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.pace200} fill="#DDDDDD" />
            <path d={svgPaths.p3b299900} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-[#AEAEAE] mt-[4px]">
            포인트 충전
          </span>
        </Link>

        <div className="flex flex-col items-center">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p1b936200} fill="black" />
            <path d={svgPaths.p32c2ee80} fill="white" />
          </svg>
          <span className="font-['Pretendard:Regular',sans-serif] text-[10px] text-black mt-[4px]">
            럭키드로우
          </span>
        </div>
      </div>
    </div>
  );
}
