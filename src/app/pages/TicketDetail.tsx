import { Link, useParams, useNavigate, useLocation } from "react-router";
import TicketDetailTemplate from "../components/TicketDetailTemplate";
import { useState, useEffect } from "react";
import fallbackTicketImage from "../../assets/7448817f6bb8739bc4187d6209b1a0c3fb4bcad6.png";

// 티켓 타입별 데이터
const ticketData: Record<string, {
  name: string;
  price: string;
  image: string;
  products: Array<{
    id: number;
    brand: string;
    name: string;
    probability: string;
    image: string;
  }>;
}> = {
  jewelry: {
    name: "주얼리 티켓",
    price: "19,900P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "샤넬", name: "CHANEL 클래식 플랩백 미디엄", probability: "0.5%", image: "" },
      { id: 2, brand: "루이비통", name: "LOUIS VUITTON 네버풀 MM", probability: "0.8%", image: "" },
      { id: 3, brand: "에르메스", name: "HERMES 버킨 30", probability: "0.3%", image: "" },
      { id: 4, brand: "구찌", name: "GUCCI 마몬트 숄더백", probability: "1.2%", image: "" },
      { id: 5, brand: "디올", name: "DIOR 레이디 디올 미디엄", probability: "0.7%", image: "" },
      { id: 6, brand: "프라다", name: "PRADA 레더 토트백", probability: "1.5%", image: "" },
      { id: 7, brand: "발렌시아가", name: "BALENCIAGA 시티백", probability: "1.0%", image: "" },
      { id: 8, brand: "생로랑", name: "SAINT LAURENT 루루백", probability: "1.3%", image: "" },
      { id: 9, brand: "펜디", name: "FENDI 피카부 미디엄", probability: "0.9%", image: "" },
      { id: 10, brand: "보테가 베네타", name: "BOTTEGA VENETA 조디백", probability: "1.1%", image: "" },
      { id: 11, brand: "롤렉스", name: "ROLEX 서브마리너", probability: "0.2%", image: "" },
      { id: 12, brand: "오메가", name: "OMEGA 스피드마스터", probability: "0.6%", image: "" },
      { id: 13, brand: "까르띠에", name: "CARTIER 탱크 워치", probability: "0.4%", image: "" },
      { id: 14, brand: "티파니", name: "TIFFANY & CO. 다이아 반지", probability: "0.8%", image: "" },
      { id: 15, brand: "불가리", name: "BVLGARI 세르펜티 워치", probability: "0.7%", image: "" },
    ],
  },
  meat: {
    name: "미트 티켓",
    price: "39,900P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "한우", name: "1++ 한우 등심 세트 5kg", probability: "2.0%", image: "" },
      { id: 2, brand: "한우", name: "1++ 한우 안심 세트 3kg", probability: "1.5%", image: "" },
      { id: 3, brand: "돼지고기", name: "프리미엄 삼겹살 세트 5kg", probability: "3.0%", image: "" },
      { id: 4, brand: "소고기", name: "미국산 프라임 립아이 3kg", probability: "2.5%", image: "" },
      { id: 5, brand: "한우", name: "1+ 한우 갈비 세트 5kg", probability: "2.2%", image: "" },
    ],
  },
  beauty: {
    name: "뷰티 티켓",
    price: "24,900P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "설화수", name: "자음생 크림 세트", probability: "1.8%", image: "" },
      { id: 2, brand: "후", name: "천기단 화현 크림 세트", probability: "1.5%", image: "" },
      { id: 3, brand: "에스티로더", name: "어드밴스드 나이트 리페어", probability: "2.0%", image: "" },
      { id: 4, brand: "랑콤", name: "제니피크 세럼 세트", probability: "1.9%", image: "" },
      { id: 5, brand: "SK-II", name: "페이셜 트리트먼트 에센스", probability: "1.7%", image: "" },
    ],
  },
  platinum: {
    name: "플래티넘 티켓",
    price: "99,000P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "애플", name: "MacBook Pro 16인치", probability: "0.5%", image: "" },
      { id: 2, brand: "애플", name: "iPhone 15 Pro Max 1TB", probability: "0.8%", image: "" },
      { id: 3, brand: "삼성", name: "갤럭시 Z Fold5 1TB", probability: "0.9%", image: "" },
      { id: 4, brand: "LG", name: "LG 그램 17인치", probability: "0.7%", image: "" },
      { id: 5, brand: "다이슨", name: "에어랩 스타일러 컴플리트", probability: "1.2%", image: "" },
    ],
  },
  diamond: {
    name: "다이아 티켓",
    price: "49,000P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "나이키", name: "에어조던 1 레트로 하이", probability: "1.5%", image: "" },
      { id: 2, brand: "아디다스", name: "이지 부스트 350 V2", probability: "1.3%", image: "" },
      { id: 3, brand: "뉴발란스", name: "990v6 그레이", probability: "2.0%", image: "" },
      { id: 4, brand: "나이키", name: "덩크 로우 판다", probability: "1.8%", image: "" },
      { id: 5, brand: "컨버스", name: "척 70 하이 블랙", probability: "2.5%", image: "" },
    ],
  },
  gold: {
    name: "골드 티켓",
    price: "14,900P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "스타벅스", name: "아메리카노 Tall 30잔", probability: "5.0%", image: "" },
      { id: 2, brand: "투썸플레이스", name: "음료 교환권 20매", probability: "4.5%", image: "" },
      { id: 3, brand: "배스킨라빈스", name: "파인트 아이스크림 10개", probability: "4.0%", image: "" },
      { id: 4, brand: "CGV", name: "영화 관람권 10매", probability: "3.5%", image: "" },
      { id: 5, brand: "올리브영", name: "5만원 상품권", probability: "3.0%", image: "" },
    ],
  },
  ruby: {
    name: "루비 티켓",
    price: "9,900P",
    image: fallbackTicketImage,
    products: [
      { id: 1, brand: "CU", name: "편의점 상품권 3만원", probability: "8.0%", image: "" },
      { id: 2, brand: "GS25", name: "편의점 상품권 3만원", probability: "7.5%", image: "" },
      { id: 3, brand: "세븐일레븐", name: "편의점 상품권 3만원", probability: "7.0%", image: "" },
      { id: 4, brand: "이마트24", name: "편의점 상품권 3만원", probability: "6.5%", image: "" },
      { id: 5, brand: "미니스톱", name: "편의점 상품권 2만원", probability: "6.0%", image: "" },
    ],
  },
};

export default function TicketDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const { ticketType } = useParams<{ ticketType: string }>();
  const ticket = ticketType ? ticketData[ticketType] : null;

  // 로그인 가드
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
    }
  }, [isLoggedIn, navigate, location]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white relative w-[480px] mx-auto min-h-screen flex items-center justify-center">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[16px] text-black">티켓을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <TicketDetailTemplate
      ticket={ticket}
      onDraw={() => {
        // 티켓 뽑기 로직 구현
      }}
    />
  );
}
