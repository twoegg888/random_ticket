import svgPaths from "../../imports/svg-vzn95yzv5e";
import { Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TICKET_GRADES } from "../types";

function Header() {
  return (
    <div className="absolute bg-white h-[56px] left-0 right-0 top-0 border-b border-[#eaeaea]">
      <div className="absolute left-[24px] top-1/2 -translate-y-1/2">
        <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] text-black">
          거래소
        </p>
      </div>
    </div>
  );
}

function ExchangeTicketCard({ exchangeTicket, onPurchaseComplete }: { exchangeTicket: any; onPurchaseComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { purchaseExchangeTicket, userData } = useApp();
  
  const gradeInfo = TICKET_GRADES[exchangeTicket.ticketType];
  const isOwnTicket = exchangeTicket.sellerId === userData.userId;

  const handlePurchase = async () => {
    if (isLoading) return;
    if (isOwnTicket) {
      alert('본인이 등록한 티켓은 구매할 수 없습니다.');
      return;
    }

    if (userData.points < exchangeTicket.price) {
      alert('포인트가 부족합니다.');
      return;
    }

    if (confirm(`${exchangeTicket.price.toLocaleString()}P로 구매하시겠습니까?`)) {
      setIsLoading(true);
      const success = await purchaseExchangeTicket(exchangeTicket.id);
      setIsLoading(false);

      if (success) {
        alert('구매가 완료되었습니다!\n당첨 티켓 목록에서 확인하세요.');
        onPurchaseComplete(); // 목록 새로고침
      } else {
        alert('구매에 실패했습니다.');
      }
    }
  };

  return (
    <div className="bg-white border border-[#eaeaea] rounded-[12px] p-[16px]">
      <div className="flex gap-[16px]">
        {/* 상품 이미지 */}
        <div className="w-[100px] h-[100px] rounded-[8px] bg-[#f5f5f5] overflow-hidden flex-shrink-0">
          <img 
            src={exchangeTicket.productImage} 
            alt={exchangeTicket.productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <span 
            className="inline-block px-[8px] py-[2px] rounded-full text-[11px] font-['Pretendard:Medium',sans-serif] mb-[6px]"
            style={{ 
              backgroundColor: `${gradeInfo.color}20`, 
              color: gradeInfo.color 
            }}
          >
            {gradeInfo.name}
          </span>
          
          <h3 className="font-['Pretendard:SemiBold',sans-serif] text-[15px] text-[#020202] mb-[4px] line-clamp-1">
            {exchangeTicket.productBrand}
          </h3>
          
          <p className="font-['Pretendard:Regular',sans-serif] text-[13px] text-[#666] mb-[8px] line-clamp-1">
            {exchangeTicket.productName}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Pretendard:Medium',sans-serif] text-[11px] text-[#999] mb-[2px]">
                원가: {exchangeTicket.points.toLocaleString()}P
              </p>
              <p className="font-['Pretendard:Bold',sans-serif] text-[20px] text-[#ff4444]">
                {exchangeTicket.price.toLocaleString()}P
              </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isLoading || isOwnTicket || exchangeTicket.status !== 'selling'}
              className={`px-[20px] h-[36px] rounded-[8px] font-['Pretendard:SemiBold',sans-serif] text-[14px] ${ 
                isOwnTicket 
                  ? 'bg-[#eaeaea] text-[#999] cursor-not-allowed'
                  : exchangeTicket.status !== 'selling'
                    ? 'bg-[#eaeaea] text-[#999] cursor-not-allowed'
                    : 'bg-[#020202] text-white hover:bg-[#333] active:scale-95'
              } transition-all disabled:opacity-50`}
            >
              {isOwnTicket ? '본인 등록' : exchangeTicket.status === 'sold' ? '판매완료' : '구매하기'}
            </button>
          </div>

          <p className="font-['Pretendard:Regular',sans-serif] text-[11px] text-[#999] mt-[8px]">
            판매자: {exchangeTicket.sellerName} | {new Date(exchangeTicket.listedAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <div className="fixed bottom-0 bg-white content-stretch flex h-[64px] items-center justify-center left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#eaeaea] z-50">
      <Link to="/" className="flex-1 flex flex-col items-center justify-center">
        <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p11a5580} fill="#DDDDDD" />
        </svg>
        <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#aeaeae] mt-[8px]">
          홈
        </p>
      </Link>

      <Link to="/winning-tickets" className="flex-1 flex flex-col items-center justify-center">
        <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p25895e80} fill="#DDDDDD" />
        </svg>
        <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#ddd] mt-[8px]">
          당첨 티켓
        </p>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p11d16a80} fill="#020202" />
          <path clipRule="evenodd" d={svgPaths.p27aa6df0} fill="white" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p32251f80} fill="white" fillRule="evenodd" />
        </svg>
        <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#020202] mt-[8px]">
          거래소
        </p>
      </div>

      <Link to="/points" className="flex-1 flex flex-col items-center justify-center">
        <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.pace200} fill="#DDDDDD" />
          <path d={svgPaths.p3b299900} fill="white" />
        </svg>
        <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae] mt-[8px]">
          포인트 충전
        </p>
      </Link>

      <Link to="/lucky-draw" className="flex-1 flex flex-col items-center justify-center">
        <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1b936200} fill="#AEAEAE" />
          <path d={svgPaths.p32c2ee80} fill="white" />
        </svg>
        <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae] mt-[8px]">
          럭키드로우
        </p>
      </Link>
    </div>
  );
}

export default function Exchange() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState<'all' | 'selling' | 'sold'>('selling');
  const { userData, isLoggedIn, isInitialized, fetchExchangeTickets, purchaseExchangeTicket } = useApp();
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 가드 - 초기화가 완료된 후에만 체크
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate, location]);

  // 거래소 티켓 불러오기
  useEffect(() => {
    const loadTickets = async () => {
      if (isLoggedIn) {
        setIsLoading(true);
        const tickets = await fetchExchangeTickets('all');
        setAllTickets(tickets);
        setIsLoading(false);
      }
    };
    
    loadTickets();
  }, [isLoggedIn, fetchExchangeTickets]);

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

  // 거래소 티켓 필터링
  const filteredTickets = allTickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const handlePurchaseComplete = () => {
    setAllTickets([]);
  };

  return (
    <div className="bg-white relative w-full max-w-[480px] min-h-screen mx-auto">
      <Header />
      
      {/* 필터 탭 */}
      <div className="absolute top-[56px] left-0 right-0 bg-white border-b border-[#eaeaea] h-[48px] flex px-[24px]">
        <button
          onClick={() => setFilter('selling')}
          className={`flex-1 font-['Pretendard:Medium',sans-serif] text-[15px] border-b-2 transition-colors ${
            filter === 'selling' 
              ? 'text-[#020202] border-[#020202]' 
              : 'text-[#666] border-transparent'
          }`}
        >
          판매중
        </button>
        <button
          onClick={() => setFilter('sold')}
          className={`flex-1 font-['Pretendard:Medium',sans-serif] text-[15px] border-b-2 transition-colors ${
            filter === 'sold' 
              ? 'text-[#020202] border-[#020202]' 
              : 'text-[#666] border-transparent'
          }`}
        >
          판매완료
        </button>
      </div>

      {/* 포인트 표시 */}
      <div className="absolute top-[120px] left-[24px] right-[24px]">
        <div className="bg-[#f8f9fa] rounded-[12px] p-[16px] mb-[20px]">
          <p className="font-['Pretendard:Regular',sans-serif] text-[13px] text-[#666] mb-[4px]">
            보유 포인트
          </p>
          <p className="font-['Pretendard:Bold',sans-serif] text-[24px] text-[#020202]">
            {userData.points.toLocaleString()}P
          </p>
        </div>
      </div>

      {/* 티켓 목록 */}
      <div className="absolute top-[220px] left-[24px] right-[24px] bottom-[80px] overflow-y-auto">
        <div className="space-y-[12px] pb-[20px]">
          {isLoading ? (
            <div className="text-center py-[60px]">
              <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#999]">
                티켓을 불러오는 중입니다...
              </p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-[60px]">
              <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#999]">
                {filter === 'selling' ? '판매 중인 티켓이 없습니다' : '판매 완료된 티켓이 없습니다'}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <ExchangeTicketCard key={ticket.id} exchangeTicket={ticket} onPurchaseComplete={handlePurchaseComplete} />
            ))
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}