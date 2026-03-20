import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { TicketType, WinningTicket } from "../types";
import { TICKET_PRICES } from "../constants/ticketPrices";
import { getApiBase, publicAnonKey } from "../../../utils/supabase/info";
import { useApp } from "../context/AppContext";
import svgPaths from "../../imports/svg-mj58s0kgwi";
import imgRectangle38 from "figma:asset/5997db99783f6b6d17b11391a0bd72794b3ffc4c.png";
import imgLuckTemperature from "figma:asset/8194a183fe83df0233723d20d08193625bcaef4e.png";
import WinningAnimation from "../../imports/Group45";

const API_BASE = getApiBase();
const DRAW_ANIMATION_URL =
  "https://res.cloudinary.com/dznubvml4/video/upload/v1772365174/grok-video-6b567bbd-14bc-4897-b1bb-43f044287617_rqx09n.mp4";

interface TicketDetailTemplateProps {
  ticketName: string;
  mainImage: string;
  drawAnimationImage?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  ticketType: TicketType;
}

type ProductSummary = {
  id: string;
  name: string;
  brand: string;
  points: number;
  probability: number;
  imageUrl: string;
};

export default function TicketDetailTemplate({
  ticketName,
  mainImage,
  ticketType,
}: TicketDetailTemplateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, drawTickets, isLoggedIn } = useApp();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [wonTickets, setWonTickets] = useState<WinningTicket[]>([]);
  const [currentWonIndex, setCurrentWonIndex] = useState(0);

  const ticketPrice = TICKET_PRICES[ticketType];
  const ticketPriceLabel = `${ticketPrice.toLocaleString()}P`;
  const maxTickets = Math.max(1, Math.floor(userData.points / ticketPrice));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/products/${ticketType}`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    void fetchProducts();
  }, [ticketType]);

  const handleOpenModal = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (userData.points < ticketPrice) {
      alert("포인트가 부족합니다.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleDraw = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }

    const totalCost = ticketPrice * ticketCount;
    if (userData.points < totalCost) {
      alert("포인트가 부족합니다.");
      return;
    }

    setIsModalOpen(false);
    setShowVideo(true);

    const startTime = Date.now();
    const result = await drawTickets({
      ticketType,
      count: ticketCount,
    });

    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(0, 3000 - elapsed);
    if (remainingMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
    }

    setShowVideo(false);

    if (!result || result.length === 0) {
      alert("티켓 처리에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setWonTickets(result);
    setCurrentWonIndex(0);
  };

  const handleCloseWinning = () => {
    if (currentWonIndex < wonTickets.length - 1) {
      setCurrentWonIndex((prev) => prev + 1);
      return;
    }

    setWonTickets([]);
    setCurrentWonIndex(0);
    navigate("/winning-tickets");
  };

  return (
    <div className="bg-white w-full max-w-[480px] mx-auto h-screen flex flex-col">
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

      <div className="flex-1 overflow-y-auto pb-[80px]">
        <div className="px-[23px] pt-[32px]">
          <div className="w-full aspect-[434/272] rounded-[18px] overflow-hidden mb-[33px]">
            <img alt={ticketName} className="w-full h-full object-cover" src={mainImage} />
          </div>

          <div className="flex flex-col items-center mb-[16px]">
            <div className="font-['Pretendard:Regular',sans-serif] text-[18px] text-[#020202] mb-[8px]">
              {ticketName}
            </div>
            <div className="font-['Pretendard:SemiBold',sans-serif] text-[28px] text-[#020202]">
              {ticketPriceLabel}
            </div>
          </div>

          <div className="bg-[#f5f5f5] rounded-[17px] p-[24px] mb-[12px]">
            <div className="space-y-[10px]">
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">당첨 박스</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">뽑기 후 즉시 보관함에서 확인 가능합니다.</p>
              </div>
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">실물 상품</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">보관함에서 배송 요청 후 수령할 수 있습니다.</p>
              </div>
              <div>
                <p className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[#020202] text-[12px] mb-[4px]">확률 고지</p>
                <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[#747473] text-[12px]">상품 목록과 가중치는 서버 기준으로 관리됩니다.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#fffbf1] to-white border border-[#fff6e2] rounded-[17px] p-[20px] mb-[24px] relative">
            <img src={imgLuckTemperature} alt="" className="absolute right-[16px] top-[16px] w-[51px] h-[51px]" />
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
            <p className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[#020202] text-[16px]">오늘도 행운을 시험해보세요.</p>
          </div>

          <div className="bg-[#eaeaea] h-[7px] -mx-[23px] mb-[32px]" />

          <h2 className="font-['Pretendard:Bold',sans-serif] text-[#020202] text-[20px] mb-[20px]">당첨 가능 상품</h2>

          <div className="space-y-[16px]">
            {loadingProducts ? (
              <div className="bg-[#fcfdfd] border border-[#eaeaea] rounded-[15px] p-[20px] text-center">
                <p className="text-[#666] text-[14px]">상품을 불러오는 중...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#fcfdfd] border border-[#eaeaea] rounded-[15px] p-[20px] text-center">
                <p className="text-[#666] text-[14px]">등록된 상품이 없습니다.</p>
                <p className="text-[#999] text-[12px] mt-[8px]">관리자 페이지에서 상품을 추가해주세요.</p>
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
                      e.currentTarget.src = "https://via.placeholder.com/81x81?text=No+Image";
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
                        {ticketPriceLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {!isModalOpen && wonTickets.length === 0 && !showVideo && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#eaeaea] px-[23px] py-[12px] flex gap-[8px] z-50">
          <button className="bg-white border border-[#e5e5e5] h-[40px] px-[16px] rounded-[6px] flex items-center gap-[8px]" type="button">
            <svg className="w-[14px] h-[15px]" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
              <path clipRule="evenodd" d={svgPaths.p33f6ad00} fill="black" fillRule="evenodd" />
            </svg>
            <span className="font-['Pretendard:Bold',sans-serif] text-[14px] text-[#020202]">선물하기</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex-1 bg-[#171717] h-[40px] rounded-[6px] font-['Pretendard:Bold',sans-serif] text-[14px] text-white"
            type="button"
          >
            도전하기
          </button>
        </div>
      )}

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
              최대 {maxTickets}장 뽑을 수 있습니다.
            </p>

            <div className="flex items-center justify-center gap-[24px] mb-[24px]">
              <button
                onClick={() => setTicketCount((prev) => Math.max(1, prev - 1))}
                disabled={ticketCount <= 1}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#eaeaea] rounded-[8px] disabled:opacity-30"
                type="button"
              >
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                  <path d="M0 1H16" stroke="#020202" strokeWidth="2" />
                </svg>
              </button>

              <span className="font-['Noto_Sans_KR:Bold',sans-serif] text-[28px] text-[#020202] min-w-[60px] text-center">
                {ticketCount}
              </span>

              <button
                onClick={() => setTicketCount((prev) => Math.min(maxTickets, prev + 1))}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#eaeaea] rounded-[8px]"
                disabled={ticketCount >= maxTickets}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0V16M0 8H16" stroke="#020202" strokeWidth="2" />
                </svg>
              </button>
            </div>

            <div className="space-y-[12px]">
              <button
                onClick={handleDraw}
                className="w-full h-[52px] bg-[#171717] rounded-[8px] font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] text-white"
                type="button"
              >
                뽑기
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full h-[52px] bg-white border border-[#eaeaea] rounded-[8px] font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] text-[#020202]"
                type="button"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <div className="fixed inset-0 z-[100] w-[480px] h-screen mx-auto bg-[#280600]">
          <video autoPlay playsInline muted className="absolute max-w-none object-cover w-full h-full" src={DRAW_ANIMATION_URL} />
        </div>
      )}

      {wonTickets.length > 0 && (
        <div className="fixed inset-0 z-[100] w-[480px] h-screen mx-auto">
          <WinningAnimation
            onClose={handleCloseWinning}
            productName={wonTickets[currentWonIndex].productName}
            productPrice={`${wonTickets[currentWonIndex].points.toLocaleString()}P`}
            productImage={wonTickets[currentWonIndex].productImage}
          />
        </div>
      )}
    </div>
  );
}
