import svgPaths from "../../imports/svg-vzn95yzv5e";
import { Link, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { WinningTicket } from "../types";
import ShippingRequestModal from "./ShippingRequestModal";

// 임시 당첨 티켓 데이터
const ticketData = {
  id: 1,
  productName: "Product_Name",
  productDescription: "[아토반이젠] 반영구 천연화학석 500g+피톤치드 스프레이 500ml+ 편백 큐브2개 탈취/제습[실물포장]",
  productPrice: "49,390P",
  productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
  wonAt: "26. 02. 04. 21:10",
  category: "플래티넘",
  status: "pending" // pending, converted, traded, delivered
};

function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="absolute bg-white h-[56px] left-0 right-0 top-0 border-b border-[#eaeaea]">
      <button 
        onClick={() => navigate(-1)}
        className="absolute left-[16px] top-1/2 -translate-y-1/2 p-2 bg-transparent border-0 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>
      <div className="absolute left-[60px] top-1/2 -translate-y-1/2">
        <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-black">
          당첨 상품 상세 보기
        </p>
      </div>
    </div>
  );
}

function ProductCard() {
  const { id } = useParams();
  const { userData } = useApp();
  const ticket = userData.winningTickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="px-[24px] pt-[80px] text-center">
        <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-[#666]">
          티켓을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="px-[24px] pt-[80px]">
      {/* 원형 상품 이미지 */}
      <div className="flex justify-center mb-[32px]">
        <div className="w-[200px] h-[200px] rounded-full bg-[#96a8a0] overflow-hidden">
          <img 
            src={ticket.productImage} 
            alt={ticket.productName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="text-center mb-[40px]">
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#333] mb-[16px] leading-[1.6] px-[20px]">
          {ticket.productBrand} - {ticket.productName}
        </p>
        <p className="font-['Pretendard:Bold',sans-serif] text-[32px] text-black">
          {ticket.points.toLocaleString()}P
        </p>
      </div>
    </div>
  );
}

function ActionButtons({ ticket }: { ticket: WinningTicket }) {
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const { id } = useParams();
  const { userData, addExchangeTicket } = useApp();
  const [tradePrice, setTradePrice] = useState("");
  
  if (!ticket) return null;

  const handleTradeSubmit = () => {
    const price = parseInt(tradePrice);
    if (!price || price <= 0) {
      alert('올바른 가격을 입력해주세요.');
      return;
    }

    addExchangeTicket({
      ticketId: ticket.id,
      ticketType: ticket.ticketType,
      productName: ticket.productName,
      productBrand: ticket.productBrand,
      productImage: ticket.productImage,
      points: ticket.points,
      price: price,
      sellerId: userData.userId,
      sellerName: userData.userName,
    });

    alert(`${price.toLocaleString()}P에 거래소에 등록되었습니다!`);
    setShowTradeModal(false);
    navigate('/exchange');
  };

  return (
    <>
      {/* 3개 버튼 영역 */}
      <div className="absolute flex gap-[16px] items-start justify-between left-[32px] right-[32px] top-[620px]">
        {/* 합성하기 */}
        <button 
          onClick={() => setShowSynthesisModal(true)}
          className="flex flex-col items-center flex-1 gap-[8px] cursor-pointer bg-transparent border-0"
        >
          <div className="w-[72px] h-[72px] rounded-[16px] bg-[#d4dde4] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm2 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#718290"/>
            </svg>
          </div>
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] text-[#020202]">합성하기</p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[12px] text-[#ff6b6b]">래핑</p>
        </button>

        {/* 거래하기 */}
        <button 
          onClick={() => setShowTradeModal(true)}
          className="flex flex-col items-center flex-1 gap-[8px] cursor-pointer bg-transparent border-0"
        >
          <div className="w-[72px] h-[72px] rounded-[16px] bg-[#d4dde4] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" fill="#718290"/>
            </svg>
          </div>
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] text-[#020202]">거래하기</p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[12px] text-[#4a90e2]">Event</p>
        </button>

        {/* 포인트 전환 */}
        <button 
          onClick={() => setShowRouletteModal(true)}
          className="flex flex-col items-center flex-1 gap-[8px] cursor-pointer bg-transparent border-0"
        >
          <div className="w-[72px] h-[72px] rounded-[16px] bg-[#f4d35e] flex items-center justify-center">
            <p className="font-['Pretendard:ExtraBold',sans-serif] text-[36px] text-white leading-none">P</p>
          </div>
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] text-[#020202]">포인트 전환</p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[12px] text-[#ff6b6b]">최대x10</p>
        </button>
      </div>

      {/* 합성 모달 */}
      {showSynthesisModal && (
        <Modal 
          title="합성하기" 
          onClose={() => setShowSynthesisModal(false)}
          content={
            <div className="text-center p-[20px]">
              <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#666] mb-[20px]">
                여러 티켓을 조합하여 더 높은 등급의 상품으로 업그레이드할 수 있습니다.
              </p>
              <button className="w-full bg-black text-white rounded-[8px] h-[48px] font-['Pretendard:Bold',sans-serif] text-[16px]">
                합성 시작하기
              </button>
            </div>
          }
        />
      )}

      {/* 거래 모달 */}
      {showTradeModal && (
        <Modal 
          title="거래소에 등록" 
          onClose={() => setShowTradeModal(false)}
          content={
            <div className="text-center p-[20px]">
              <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#666] mb-[20px]">
                판매 가격을 설정해주세요
              </p>
              <input 
                type="number" 
                placeholder="가격 입력 (포인트)"
                value={tradePrice}
                onChange={(e) => setTradePrice(e.target.value)}
                className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] mb-[16px] font-['Pretendard:Regular',sans-serif] text-[14px]"
              />
              <button 
                onClick={handleTradeSubmit}
                className="w-full bg-black text-white rounded-[8px] h-[48px] font-['Pretendard:Bold',sans-serif] text-[16px]"
              >
                등록하기
              </button>
            </div>
          }
        />
      )}

      {/* 포인트 전환 룰렛 모달 */}
      {showRouletteModal && (
        <RouletteModal 
          key={`roulette-${ticket.id}-${Date.now()}`}
          ticketId={ticket.id}
          originalPoints={ticket.points}
          onClose={() => setShowRouletteModal(false)}
        />
      )}
    </>
  );
}

function ShippingButton({ ticket }: { ticket: WinningTicket }) {
  const [showModal, setShowModal] = useState(false);

  const handleShippingRequest = async () => {
    if (!recipientName || !recipientPhone || !recipientAddress) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    const shippingInfo = {
      name: recipientName,
      phone: recipientPhone,
      address: recipientAddress,
    };

    const success = await requestShipping(ticket.id, shippingInfo);

    if (success) {
      alert('발급 요청이 완료되었습니다!\n관리자 확인 후 카카오톡으로 배송 정보가 전달됩니다.');
      setShowModal(false);
      navigate('/winning-tickets');
    } else {
      alert('발급 요청에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="px-[24px] pb-[24px]">
        <button 
          onClick={() => setShowModal(true)}
          disabled={ticket.shippingRequested}
          className="w-full bg-transparent h-[52px] flex items-center justify-between px-[4px] cursor-pointer border-0 active:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-['Pretendard:Regular',sans-serif] text-[15px] text-black">
            {ticket.shippingRequested ? '배송 요청 완료' : '배송 요청'}
          </span>
          <ChevronLeft className="w-5 h-5 text-[#999] rotate-180" />
        </button>
      </div>

      {showModal && (
        <ShippingRequestModal 
          ticketId={ticket.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function Modal({ title, content, onClose }: { title: string; content: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-[90%] max-w-[400px] mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-[20px] border-b border-[#eaeaea]">
          <h3 className="font-['Pretendard:Bold',sans-serif] text-[18px] text-black">{title}</h3>
          <button onClick={onClose} className="text-[24px] text-[#666] bg-transparent border-0 cursor-pointer">×</button>
        </div>
        {content}
      </div>
    </div>
  );
}

function RouletteModal({ ticketId, originalPoints, onClose }: { ticketId: string; originalPoints: number; onClose: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isConverting, setIsConverting] = useState(false); // 🔥 중복 클릭 방지
  const { convertTicketToPoints } = useApp();
  const navigate = useNavigate();

  // 룰렛 배수 (8개 섹션)
  const multipliers = [2, 0.5, 1.5, 1, 3, 5, 7, 10];
  const basePoints = Math.floor(originalPoints / 2);

  const spinRoulette = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setHasSpun(true);
    setResult(null);

    // 랜덤 결과 선택
    const randomIndex = Math.floor(Math.random() * multipliers.length);
    const selectedMultiplier = multipliers[randomIndex];
    
    // 각 섹션은 45도 (360 / 8)
    const sectionAngle = 45;
    const targetAngle = randomIndex * sectionAngle;
    
    // 5바퀴 + 타겟 각도
    const finalRotation = 360 * 5 + (360 - targetAngle);
    
    setRotation(finalRotation);

    // 애니메이션 완료 후
    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedMultiplier);
    }, 4000);
  };

  const finalPoints = result ? Math.floor(basePoints * result) : 0;

  const handleConvert = async () => {
    // 🔥 중복 클릭 방지
    if (!result || isConverting) return;
    
    setIsConverting(true);
    
    try {
      console.log(`🎰 [handleConvert] Converting ticket ${ticketId} with ${finalPoints}P (x${result})`);
      
      // 🔥 서버 API를 통한 원자적 트랜잭션 처리
      const success = await convertTicketToPoints(ticketId, finalPoints, result);
      
      if (success) {
        // 모달 즉시 닫기
        onClose();
        
        alert(`${finalPoints.toLocaleString()}P가 충전되었습니다!`);
        
        // 당첨 티켓 목록으로 이동
        navigate('/winning-tickets');
      } else {
        throw new Error('Server returned failure');
      }
    } catch (error) {
      console.error('❌ 포인트 전환 실패:', error);
      alert('포인트 전환 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col max-w-[480px] mx-auto">
      {/* 헤더 */}
      <div className="h-[56px] flex items-center px-[16px] border-b border-[#333]">
        <button 
          onClick={onClose}
          className="p-2 bg-transparent border-0 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-white ml-[8px]">
          당첨 상품 상세 보기
        </p>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-[24px] py-[40px]">
        {!result && (
          <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-white mb-[48px] text-center">
            룰렛을 돌려보세요!
          </h2>
        )}

        {result && (
          <div className="mb-[48px] text-center">
            <h2 className="font-['Pretendard:Bold',sans-serif] text-[24px] text-white mb-[16px]">
              축하합니다!
            </h2>
            <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-[#ff6b6b] mb-[8px]">
              x{result} 당첨!
            </p>
            <p className="font-['Pretendard:Bold',sans-serif] text-[28px] text-white">
              {finalPoints.toLocaleString()}P
            </p>
            <p className="font-['Pretendard:Regular',sans-serif] text-[13px] text-[#999] mt-[8px]">
              (기본 {basePoints.toLocaleString()}P × {result})
            </p>
          </div>
        )}

        {/* 룰렛 */}
        <div className="relative mb-[48px]">
          {/* 상단 포인터 */}
          <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#f4d35e]" />
          </div>

          {/* 룰렛 원판 */}
          <div className="relative">
            <div 
              className="w-[280px] h-[280px] rounded-full relative transition-transform duration-[4000ms] ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* SVG 배경 섹션 */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                {multipliers.map((_, index) => {
                  const startAngle = (360 / 8) * index;
                  const endAngle = startAngle + (360 / 8);
                  
                  const x1 = 50 + 48 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 48 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 48 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 48 * Math.sin((endAngle * Math.PI) / 180);
                  
                  return (
                    <path
                      key={index}
                      d={`M 50 50 L ${x1} ${y1} A 48 48 0 0 1 ${x2} ${y2} Z`}
                      fill={index % 2 === 0 ? '#ffffff' : '#fff5eb'}
                      stroke="#ff6b6b"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* 외부 테두리 */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="#ff6b6b" strokeWidth="4" />
              </svg>

              {/* 배수 텍스트 */}
              {multipliers.map((mult, index) => {
                const angle = (360 / 8) * index + (360 / 16); // 중앙 정렬
                const radius = 32;
                const x = 50 + radius * Math.cos(((angle - 90) * Math.PI) / 180);
                const y = 50 + radius * Math.sin(((angle - 90) * Math.PI) / 180);
                
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    }}
                  >
                    <p className="font-['Pretendard:Bold',sans-serif] text-[20px] text-[#ff6b6b]">
                      x{mult}
                    </p>
                  </div>
                );
              })}

              {/* 중앙 버튼 */}
              <button 
                onClick={spinRoulette}
                disabled={isSpinning || hasSpun}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full bg-[#ff6b6b] text-white font-['Pretendard:ExtraBold',sans-serif] text-[24px] shadow-lg border-4 border-white z-20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Go!
              </button>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        {result && (
          <button 
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full bg-[#ff6b6b] text-white rounded-[12px] h-[52px] font-['Pretendard:Bold',sans-serif] text-[16px] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? '처리 중...' : '전환 완료'}
          </button>
        )}
      </div>

      {/* 발급 요청 버튼 */}
      {!result && (
        <div className="px-[24px] pb-[24px]">
          <button 
            className="w-full bg-transparent h-[52px] flex items-center justify-between px-[4px] cursor-pointer border-0 active:opacity-70 transition-opacity"
          >
            <span className="font-['Pretendard:Regular',sans-serif] text-[15px] text-white">
              발급 요청
            </span>
            <ChevronLeft className="w-5 h-5 text-[#999] rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11a5580} fill="var(--fill-0, #DDDDDD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[10px] whitespace-nowrap">
        <p className="leading-[13px]">홈</p>
      </div>
    </div>
  );
}

function LinkHome() {
  return (
    <Link to="/" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg />
      <Margin1 />
    </Link>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <LinkHome />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p25895e80} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[9.375px] text-black whitespace-nowrap">
        <p className="leading-[13px]">당첨 티켓</p>
      </div>
    </div>
  );
}

function LinkWinning() {
  return (
    <Link to="/winning-tickets" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg1 />
      <Margin2 />
    </Link>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <LinkWinning />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11d16a80} fill="var(--fill-0, #DDDDDD)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p27aa6df0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p32251f80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">거래소</p>
      </div>
    </div>
  );
}

function LinkExchange() {
  return (
    <Link to="/exchange" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg2 />
      <Margin3 />
    </Link>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <LinkExchange />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.pace200} fill="var(--fill-0, #DDDDDD)" id="Vector" />
          <path d={svgPaths.p3b299900} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">포인트 충전</p>
      </div>
    </div>
  );
}

function LinkPoints() {
  return (
    <Link to="/points" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg3 />
      <Margin4 />
    </Link>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <LinkPoints />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p1b936200} fill="var(--fill-0, #AEAEAE)" id="Vector" />
          <path d={svgPaths.p32c2ee80} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">럭키드로우</p>
      </div>
    </div>
  );
}

function LinkLucky() {
  return (
    <Link to="/lucky-draw" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg4 />
      <Margin5 />
    </Link>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <LinkLucky />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="fixed bottom-0 bg-white content-stretch flex h-[64px] items-center justify-center left-1/2 -translate-x-1/2 w-[480px] z-50" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-solid border-t inset-0 pointer-events-none" />
      <Container2 />
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
    </div>
  );
}

export default function WinningTicketDetail() {
  const navigate = useNavigate();
  const { isLoggedIn, userData } = useApp();
  const { id } = useParams();

  // 🔥 티켓 조회
  const ticket = userData.winningTickets.find(t => t.id === id);

  // 로그인 가드
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 🔥 티켓이 없으면 에러 메시지 표시
  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="font-['Pretendard:Medium',sans-serif] text-[16px] text-[#666] mb-4">
            티켓을 찾을 수 없습니다.
          </p>
          <button
            onClick={() => navigate('/winning-tickets')}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white relative w-[480px] min-h-screen mx-auto overflow-y-auto">
      <Header />
      <ProductCard />
      <ActionButtons ticket={ticket} />
      <ShippingButton ticket={ticket} />
      <BackgroundHorizontalBorder />
    </div>
  );
}