import { TicketType } from "../types";
import { TICKET_PRICES } from "../constants/ticketPrices";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useApp } from "../context/AppContext";
import svgPaths from "../../imports/svg-mj58s0kgwi";
import imgRectangle38 from "figma:asset/5997db99783f6b6d17b11391a0bd72794b3ffc4c.png";
import imgImgLuckTemperatureMiddle1LkHcMg1 from "figma:asset/8194a183fe83df0233723d20d08193625bcaef4e.png";
import WinningAnimation from "../../imports/Group45";
import DrawingAnimation from "../../imports/Group45-15-407"; // 🎬 원본 뽑기 애니메이션 - "두근두근 선물을 뽑아요"

interface TicketDetailTemplateProps {
  ticketName: string;
  ticketPrice: string;
  mainImage: string;
  drawAnimationImage: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  ticketType?: TicketType;
}

// 티켓 이름을 TicketType으로 매핑
const TICKET_NAME_TO_TYPE: Record<string, keyof typeof TICKET_PRICES> = {
  '주얼리 티켓': 'jewelry',
  '미트 티켓': 'meat',
  '뷰티 티켓': 'beauty',
  '플래티넘 티켓': 'platinum',
  '다이아 티켓': 'diamond',
  '골드 티켓': 'gold',
  '루비 티켓': 'ruby',
};

// 🎲 가중치 기반 랜덤 선택 (확률 합계가 100%일 필요 없음!)
function selectRandomProduct(products: Array<{
  name: string;
  brand: string;
  points: number;
  probability: number; // 이제 가중치로 사용됩니다
  imageUrl: string;
}>) {
  // 전체 가중치 합계 계산
  const totalWeight = products.reduce((sum, p) => sum + p.probability, 0);
  
  // 0 ~ totalWeight 사이의 랜덤 값
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const product of products) {
    cumulative += product.probability;
    if (random <= cumulative) {
      return product;
    }
  }
  
  // Fallback (부동소수점 오차 방지)
  return products[products.length - 1];
}

export default function TicketDetailTemplate({
  ticketName,
  ticketPrice,
  mainImage,
  drawAnimationImage,
  gradientFrom,
  gradientVia,
  gradientTo,
  ticketType,
}: TicketDetailTemplateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWinning, setShowWinning] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData, purchaseAtomicTicket, isLoggedIn, isInitialized } = useApp();
  
  // 🔥 백엔드에서 상품 데이터 가져오기
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    brand: string;
    points: number;
    probability: number;
    imageUrl: string;
  }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // 당첨 상품 데이터 (여러 개 지원)
  const [wonProducts, setWonProducts] = useState<Array<{
    name: string;
    brand: string;
    points: number;
    image: string;
  }>>([]);
  
  const [currentWonIndex, setCurrentWonIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // 🔥 상품 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const ticketTypeKey = TICKET_NAME_TO_TYPE[ticketName];
        if (!ticketTypeKey) {
          console.error('Unknown ticket type:', ticketName);
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/products/${ticketTypeKey}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log(`✅ Loaded ${data.products.length} products for ${ticketTypeKey}`);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [ticketName]);

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handleIncrease = () => {
    const ticketPriceNum = TICKET_PRICES[TICKET_NAME_TO_TYPE[ticketName]] || 0;
    const maxTickets = Math.floor(userData.points / ticketPriceNum);
    
    if (ticketCount < maxTickets) {
      setTicketCount(ticketCount + 1);
    }
  };
  
  const handleOpenModal = () => {
    // 로그인 체크
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleDraw = async () => {
    // 로그인 체크
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login', { state: { from: location } });
      return;
    }

    // 포인트 확인
    const ticketPriceNum = TICKET_PRICES[TICKET_NAME_TO_TYPE[ticketName]] || 0;
    const totalCost = ticketPriceNum * ticketCount;
    
    if (userData.points < totalCost) {
      alert('포인트가 부족합니다.');
      return;
    }

    console.log('🎬 [handleDraw] 뽑기 시작!');
    console.log('   티켓 개수:', ticketCount);
    console.log('   총 비용:', totalCost);
    console.log('   등록된 상품 수:', products.length);

    // 🔥 여러 개 뽑기: ticketCount만큼 반복
    const selectedProducts = [];
    for (let i = 0; i < ticketCount; i++) {
      // ⚠️ 상품이 없으면 더미 데이터 사용 (테스트용)
      if (products.length === 0) {
        selectedProducts.push({
          name: '테스트 상품',
          brand: '테스트 브랜드',
          points: ticketPriceNum,
          image: 'https://via.placeholder.com/200x200?text=Test+Product',
        });
      } else {
        const selected = selectRandomProduct(products);
        selectedProducts.push({
          name: selected.name,
          brand: selected.brand,
          points: selected.points,
          image: selected.imageUrl,
        });
      }
    }
    
    console.log('🎁 [handleDraw] 당첨 상품:', selectedProducts);
    
    // 🔥 State 업데이트를 먼저!
    setWonProducts(selectedProducts);
    setCurrentWonIndex(0);
    setIsModalOpen(false);
    
    console.log('🎬 [handleDraw] 애니메이션 재생 시작!');
    // 🎬 애니메이션 재생
    setShowVideo(true);
    
    // ⏱️ 3초 후 자동으로 당첨 화면으로 이동
    setTimeout(() => {
      console.log('🎬 [setTimeout] 비디오 종료! 당첨 화면 표시');
      setShowVideo(false);
      setShowWinning(true);
    }, 3000);
  };

  const handleCloseWinning = async () => {
    console.log('✅ [handleCloseWinning] 당첨 확인 버튼 클릭!');
    console.log('   현재 인덱스:', currentWonIndex);
    console.log('   전체 상품 수:', wonProducts.length);
    
    const ticketTypeMap: Record<string, TicketType> = {
      '주얼리 티켓': 'jewelry',
      '미트 티켓': 'meat',
      '뷰티 티켓': 'beauty',
      '플래티넘 티켓': 'platinum',
      '다이아 티켓': 'diamond',
      '골드 티켓': 'gold',
      '루비 티켓': 'ruby',
    };
    
    // 현재 당첨 상품 저장
    const currentProduct = wonProducts[currentWonIndex];
    console.log('💾 [handleCloseWinning] 상품 저장 중:', currentProduct);

    const ticketTypeValue = ticketTypeMap[ticketName] || 'ruby';
    const ticketPriceNum = TICKET_PRICES[TICKET_NAME_TO_TYPE[ticketName]] || 0;
    const success = await purchaseAtomicTicket({
      ticketData: {
        ticketType: ticketTypeValue,
        productName: currentProduct.name,
        productBrand: currentProduct.brand,
        productImage: currentProduct.image,
        points: currentProduct.points,
      },
      points: ticketPriceNum,
    });

    if (!success) {
      alert('티켓 저장에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    // 다음 상품이 있으면 다음 상품 표시
    if (currentWonIndex < wonProducts.length - 1) {
      console.log('➡️ [handleCloseWinning] 다음 상품 표시:', currentWonIndex + 1);
      setCurrentWonIndex(currentWonIndex + 1);
    } else {
      // 모두 끝났으면 당첨 티켓 목록으로 이동
      console.log('🏁 [handleCloseWinning] 모든 상품 확인 완료! 당첨 티켓 목록으로 이동');
      setShowWinning(false);
      setTimeout(() => {
        navigate('/winning-tickets');
      }, 500);
    }
  };

  return (
    <div className="bg-white w-full max-w-[480px] mx-auto h-screen flex flex-col">
      {/* 헤더 - 고정 */}
      <div className="sticky top-0 bg-white h-[56px] flex items-center px-[24px] border-b border-[#eaeaea] z-20 flex-shrink-0">
        <Link to="/" className="mr-auto">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[20px] text-black">{ticketName}</h1>
        </div>
        <div className="w-[24px]" />
      </div>

      {/* 스크롤 가능 컨텐츠 */}
      <div className="flex-1 overflow-y-auto pb-[80px]">
        <div className="px-[23px] pt-[32px]">
          {/* 메인 이미지 */}
          <div className="w-full aspect-[434/272] rounded-[18px] overflow-hidden mb-[33px]">
            <img alt={ticketName} className="w-full h-full object-cover" src={mainImage} />
          </div>
          
          {/* 티켓 정보 */}
          <div className="flex flex-col items-center mb-[16px]">
            <div className="font-['Pretendard:Regular',sans-serif] text-[18px] text-[#020202] mb-[8px]">
              {ticketName}
            </div>
            <div className="font-['Pretendard:SemiBold',sans-serif] text-[28px] text-[#020202]">
              {ticketPrice}
            </div>
          </div>
          
          {/* 안내 박스 */}
          <div className="bg-[#f5f5f5] rounded-[17px] p-[24px] mb-[12px]">
            <div className="space-y-[10px]">
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">당첨 티켓</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">뽑기 후 즉시 보관함에서 확인 가능</p>
              </div>
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">실물 티켓</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">보관함에서 발송 요청 후 카카오톡으로 수령</p>
              </div>
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">확률 고지</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">률 확인</p>
              </div>
            </div>
          </div>
          
          {/* 행운 온도 박스 */}
          <div className="bg-gradient-to-b from-[#fffbf1] to-white border border-[#fff6e2] rounded-[17px] p-[20px] mb-[24px] relative">
            <img src={imgImgLuckTemperatureMiddle1LkHcMg1} alt="" className="absolute right-[16px] top-[16px] w-[51px] h-[51px]" />
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px] mb-[12px]">행운 온도</p>
            <div className="bg-[#eaeaea] h-[8px] rounded-[4px] w-full mb-[8px] relative">
              <div className="absolute left-0 top-0 h-full w-[168px] rounded-[4px] overflow-hidden">
                <img src={imgRectangle38} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-[160px] top-1/2 -translate-y-1/2 w-[20px] h-[20px]">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" fill="url(#paint0_linear)" r="10" />
                  <path d={svgPaths.p26ccbbc0} fill="white" />
                  <defs>
                    <linearGradient id="paint0_linear" x1="10" x2="10" y1="0" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFCD4A" />
                      <stop offset="1" stopColor="#FFAD4A" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <p className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[#020202] text-[16px]">오늘의 행운 온도는 미지근해요</p>
          </div>
          
          {/* 구분선 */}
          <div className="bg-[#eaeaea] h-[7px] -mx-[23px] mb-[32px]" />
          
          {/* 당첨 가능 티켓 */}
          <h2 className="font-['Pretendard:Bold',sans-serif] text-[#020202] text-[20px] mb-[20px]">당첨 가능 티켓</h2>
          
          <div className="space-y-[16px]">
            {loadingProducts ? (
              <div className="bg-[#fcfdfd] border border-[#eaeaea] rounded-[15px] p-[20px] text-center">
                <p className="text-[#666] text-[14px]">상품을 불러오는 중...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#fcfdfd] border border-[#eaeaea] rounded-[15px] p-[20px] text-center">
                <p className="text-[#666] text-[14px]">등록된 상품이 없습니다</p>
                <p className="text-[#999] text-[12px] mt-[8px]">관리자 페이지에서 상품을 추가해주세요</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#fcfdfd] border border-[#eaeaea] rounded-[15px] p-[17px] flex items-center gap-[16px]"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-[81px] h-[81px] object-cover rounded-[13px] flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/81x81?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#020202] mb-[4px] truncate">
                      {product.name}
                    </p>
                    <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#999] mb-[8px] truncate">
                      {product.brand}
                    </p>
                    <div className="flex items-center gap-[8px]">
                      <span className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#aeaeae] line-through">
                        {product.points.toLocaleString()}P
                      </span>
                      <span className="font-['Pretendard:SemiBold',sans-serif] text-[14px] text-[#020202]">
                        {ticketPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 하단 버튼 - 고정 */}
      {!isModalOpen && !showWinning && !showVideo && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#eaeaea] px-[23px] py-[12px] flex gap-[8px] z-50">
          <button className="bg-white border border-[#e5e5e5] h-[40px] px-[16px] rounded-[6px] flex items-center gap-[8px]">
            <svg className="w-[14px] h-[15px]" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
              <path clipRule="evenodd" d={svgPaths.p33f6ad00} fill="black" fillRule="evenodd" />
            </svg>
            <span className="font-['Pretendard:Bold',sans-serif] text-[14px] text-[#020202]">선물하기</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex-1 bg-[#171717] h-[40px] rounded-[6px] font-['Pretendard:Bold',sans-serif] text-[14px] text-white"
          >
            도전하기
          </button>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 w-full max-w-[480px] mx-auto">
          <div className="bg-white rounded-t-[20px] w-full px-[16px] pt-[24px] pb-[32px]">
            <h2 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[18px] text-[#020202] mb-[8px] text-center">
              몇 장 뽑을까요?
            </h2>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#666] mb-[8px] text-center">
              현재 보유 포인트: <span className="font-['Noto_Sans_KR:Bold',sans-serif] text-[#020202]">{userData.points.toLocaleString()}P</span>
            </p>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#666] mb-[32px] text-center">
              최대 {Math.floor(userData.points / (TICKET_PRICES[TICKET_NAME_TO_TYPE[ticketName]] || 1))}장 뽑을 수 있습니다.
            </p>

            {/* 수량 조절 */}
            <div className="flex items-center justify-center gap-[24px] mb-[24px]">
              <button
                onClick={handleDecrease}
                disabled={ticketCount <= 1}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#eaeaea] rounded-[8px] disabled:opacity-30"
              >
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                  <path d="M0 1H16" stroke="#020202" strokeWidth="2"/>
                </svg>
              </button>
              
              <span className="font-['Noto_Sans_KR:Bold',sans-serif] text-[28px] text-[#020202] min-w-[60px] text-center">
                {ticketCount}
              </span>
              
              <button
                onClick={handleIncrease}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#eaeaea] rounded-[8px]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0V16M0 8H16" stroke="#020202" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {/* 버튼 */}
            <div className="space-y-[12px]">
              <button
                onClick={handleDraw}
                className="w-full h-[52px] bg-[#171717] rounded-[8px] font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] text-white"
              >
                뽑기
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full h-[52px] bg-white border border-[#eaeaea] rounded-[8px] font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] text-[#020202]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뽑기 비디오 */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] w-[480px] h-screen mx-auto bg-[#280600]">
          {/* 비디오 */}
          <video
            autoPlay
            playsInline
            muted
            className="absolute max-w-none object-cover w-full h-full"
            src="https://res.cloudinary.com/dznubvml4/video/upload/v1772365174/grok-video-6b567bbd-14bc-4897-b1bb-43f044287617_rqx09n.mp4"
          />
        </div>
      )}

      {/* 당첨 화면 - 원래 Figma 디자인 사용 */}
      {showWinning && wonProducts.length > 0 && (
        <div className="fixed inset-0 z-[100] w-[480px] h-screen mx-auto">
          <WinningAnimation
            onClose={handleCloseWinning}
            productName={wonProducts[currentWonIndex].name}
            productPrice={`${wonProducts[currentWonIndex].points.toLocaleString()}P`}
            productImage={wonProducts[currentWonIndex].image}
          />
        </div>
      )}
    </div>
  );
}
