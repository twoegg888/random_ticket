import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TICKET_PRICES } from "../constants/ticketPrices";
import svgPaths from "../../imports/svg-mj58s0kgwi";
import imgRubyDetail1 from "figma:asset/02a9a581d7e7cf5847a4d891be812058ce8409af.png";
import imgRectangle38 from "figma:asset/5997db99783f6b6d17b11391a0bd72794b3ffc4c.png";
import imgImgLuckTemperatureMiddle1LkHcMg1 from "figma:asset/8194a183fe83df0233723d20d08193625bcaef4e.png";
import imgDrawAnimation from "figma:asset/5dd5b6d9deb6da70894c80f1209708fe090aee36.png";

function Group() {
  return (
    <div className="absolute contents left-[23px] top-[58px]">
      <div className="absolute h-[272px] left-[23px] rounded-[18px] top-[58px] w-[434px]" data-name="ruby-detail 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[18px]">
          <img alt="" className="absolute h-[113.6%] left-[-0.06%] max-w-none top-[-1.47%] w-[100.12%]" src={imgRubyDetail1} />
        </div>
      </div>
      <div className="absolute bg-gradient-to-t from-white h-[79px] left-[23px] to-[#fffbfb] top-[317px] w-[434px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents leading-[0] left-[192px] not-italic text-[#020202] top-[365px] whitespace-nowrap">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center left-[206px] text-[18px] top-[375.5px]">
        <p className="leading-[normal]">루비 티켓</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center left-[192px] text-[28px] top-[410.5px]">
        <p className="leading-[normal]">9,900P</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute left-[200px] size-[20px] top-[635px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group 30">
          <circle cx="10" cy="10" fill="url(#paint0_linear_10_576)" id="Ellipse 1" r="10" />
          <path d={svgPaths.p26ccbbc0} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_10_576" x1="10" x2="10" y1="0" y2="20">
            <stop stopColor="#FFCD4A" />
            <stop offset="1" stopColor="#FFAD4A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[44px] top-[635px]">
      <div className="absolute h-[8px] left-[44px] rounded-[4px] top-[641px] w-[168px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle38} />
      </div>
      <Group2 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[23px] top-[801px]">
      <div className="absolute bg-[#fcfdfd] border border-[#eaeaea] border-solid h-[115px] left-[23px] rounded-[15px] top-[801px] w-[433px]" />
      <div className="absolute bg-[#d9d9d9] left-[39px] rounded-[13px] size-[81px] top-[820px]" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] left-[136px] not-italic text-[#020202] text-[14px] top-[848.5px] whitespace-nowrap">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] left-[136px] not-italic text-[#aeaeae] text-[14px] top-[872.5px] tracking-[-0.28px] whitespace-nowrap">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[normal] line-through">C_Price</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] left-[190px] not-italic text-[#020202] text-[14px] top-[872.5px] tracking-[-0.14px] whitespace-nowrap">
        <p className="leading-[normal]">Product_Point</p>
      </div>
    </div>
  );
}

export default function RubyTicketDetail() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const navigate = useNavigate();
  const { userData, deductPoints, buyTicket } = useApp();

  const ticketPrice = TICKET_PRICES.ruby;
  const maxTickets = Math.floor(userData.points / ticketPrice);

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handleIncrease = () => {
    if (ticketCount < maxTickets) {
      setTicketCount(ticketCount + 1);
    }
  };

  const handleOpenModal = () => {
    // 포인트 체크
    if (userData.points < ticketPrice) {
      alert(`포인트가 부족합니다.\n필요 포인트: ${ticketPrice.toLocaleString()}P\n보유 포인트: ${userData.points.toLocaleString()}P`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleDraw = () => {
    const totalCost = ticketPrice * ticketCount;
    
    // 포인트 차감
    const success = deductPoints(
      totalCost,
      `루비 티켓 ${ticketCount}장 뽑기`,
      'ticket_draw',
      'ruby'
    );

    if (!success) {
      alert('포인트가 부족합니다.');
      return;
    }

    setIsModalOpen(false);
    setIsDrawing(true);
    
    // 3초 후 당첨 티켓 추가 및 홈으로 이동
    setTimeout(() => {
      // 간단한 루비 티켓 상품 예시
      const rubyProducts = [
        { name: '스타벅스 아메리카노', brand: 'Starbucks', points: 1500, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop' },
        { name: '편의점 스낵', brand: 'GS25', points: 800, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop' },
        { name: '과자 세트', brand: '오리온', points: 500, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop' },
      ];
      
      // 랜덤 상품 선택
      const randomProduct = rubyProducts[Math.floor(Math.random() * rubyProducts.length)];
      
      // 당첨 티켓 추가
      buyTicket({
        ticketType: 'ruby',
        productName: randomProduct.name,
        productBrand: randomProduct.brand,
        productImage: randomProduct.image,
        points: randomProduct.points,
      });
      
      setIsDrawing(false);
      alert(`${ticketCount}장의 티켓을 뽑았습니다!\n당첨 상품: ${randomProduct.name}\n당첨 티켓은 보관함에서 확인하세요.`);
      navigate('/');
    }, 3000);
  };

  return (
    <div className="bg-white relative w-[480px] mx-auto min-h-screen pb-[80px]">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white h-[56px] flex items-center px-[24px] border-b border-[#eaeaea] z-20">
        <Link to="/" className="mr-auto">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[20px] text-black">루비 티켓</h1>
        </div>
        <div className="w-[24px]" />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative h-[953px]">
        <div className="absolute bg-white h-[953px] left-0 top-0 w-[480px]" />
        <Group />
        <Group1 />
        <div className="absolute bg-[#f5f5f5] h-[98px] left-[24px] rounded-[17px] top-[446px] w-[432px]" />
        <div className="absolute bg-gradient-to-b border border-[#fff6e2] border-solid from-[#fffbf1] h-[111px] left-[24px] rounded-[17px] to-white top-[556px] w-[432px]" />
        <div className="absolute bg-[#eaeaea] h-[8px] left-[44px] rounded-[4px] top-[641px] w-[391px]" />
        <Group3 />
        <div className="absolute bg-[#eaeaea] h-[7px] left-0 top-[711px] w-[480px]" />
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[23px] not-italic text-[#020202] text-[20px] top-[772px] whitespace-nowrap">
          <p className="leading-[normal]">당첨 가능 티켓</p>
        </div>
        <div className="absolute bg-white h-[69px] left-0 top-[953px] w-[480px]" />
        
        {/* 선물하기 버튼 */}
        <button className="absolute bg-white border border-[#e5e5e5] border-solid h-[40px] left-[23px] rounded-[6px] top-[962px] w-[106px] cursor-pointer">
          <div className="absolute left-[15px] top-[12.5px] w-[14px] h-[15px]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
              <path clipRule="evenodd" d={svgPaths.p33f6ad00} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
          <span className="absolute font-['Pretendard:Bold',sans-serif] text-[14px] text-[#020202] tracking-[-0.42px] left-[42px] top-[50%] -translate-y-1/2">
            선물하기
          </span>
        </button>

        {/* 도전하기 버튼 */}
        <button onClick={handleOpenModal} className="absolute bg-[#171717] h-[40px] left-[137px] rounded-[6px] top-[962px] w-[319px] cursor-pointer">
          <span className="absolute font-['Pretendard:Bold',sans-serif] text-[14px] text-white tracking-[-0.42px] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
            도전하기
          </span>
        </button>

        <div className="absolute left-[384px] size-[51px] top-[573px]" data-name="img-luck-temperature-middle--1LKHcMG 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImgLuckTemperatureMiddle1LkHcMg1} />
        </div>
        <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[48px] not-italic text-[#747473] text-[12px] top-[583px] tracking-[-0.6px]">행운 온도</p>
        <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[normal] left-[48px] not-italic text-[#020202] text-[12px] top-[463px] tracking-[-0.6px]">당첨 티켓</p>
        <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[112px] not-italic text-[#747473] text-[12px] top-[463px] tracking-[-0.6px]">뽑기 후 즉시 보관함에서 확인 가능</p>
        <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[normal] left-[48px] not-italic text-[#020202] text-[12px] top-[485px] tracking-[-0.6px]">실물 티켓</p>
        <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[112px] not-italic text-[#747473] text-[12px] top-[485px] tracking-[-0.6px]">보관함에서 발송 요청 후 카카오톡으로 수령</p>
        <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[normal] left-[48px] not-italic text-[#020202] text-[12px] top-[507px] tracking-[-0.6px]">확률 고지</p>
        <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[112px] not-italic text-[#747473] text-[12px] top-[507px] tracking-[-0.6px]">확률 확인</p>
        <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[48px] not-italic text-[#020202] text-[16px] top-[604px] tracking-[-0.8px]">오늘의 행운 온도는 미지근해요</p>
        <Group4 />
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 w-[480px] mx-auto">
          <div className="bg-white rounded-t-[20px] w-full px-[16px] pt-[24px] pb-[32px]">
            <h2 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[18px] text-[#020202] mb-[8px] text-center">
              몇 장 뽑을까요?
            </h2>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#666] mb-[32px] text-center">
              보유 포인트로 최대 {maxTickets}장 뽑을 수 있습니다.
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

      {/* 뽑기 애니메이션 */}
      {isDrawing && (
        <div className="fixed inset-0 z-50 w-[480px] mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#2d0a0a] to-[#8b1a1a] flex flex-col items-center justify-center">
            <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[28px] text-white mb-[8px] tracking-[-0.5px]">
              두근두근
            </h1>
            <h2 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[28px] text-white mb-[80px] tracking-[-0.5px]">
              선물을 뽑아요
            </h2>
            <div className="relative w-full h-[500px] flex items-center justify-center">
              <img 
                alt="선물 상자" 
                className="w-auto h-full object-contain animate-pulse" 
                src={imgDrawAnimation} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}