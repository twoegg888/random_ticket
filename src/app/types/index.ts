// 티켓 타입
export type TicketType = 'jewelry' | 'meat' | 'beauty' | 'platinum' | 'diamond' | 'gold' | 'ruby';

// 티켓 등급 정보
export const TICKET_GRADES = {
  ruby: { name: '루비', color: '#FF0000', points: 100, order: 1 },
  gold: { name: '골드', color: '#FFD700', points: 500, order: 2 },
  diamond: { name: '다이아', color: '#B9F2FF', points: 1000, order: 3 },
  platinum: { name: '플래티넘', color: '#E5E4E2', points: 3000, order: 4 },
  beauty: { name: '뷰티', color: '#FF69B4', points: 5000, order: 5 },
  meat: { name: '미트', color: '#8B4513', points: 10000, order: 6 },
  jewelry: { name: '주얼리', color: '#9B59B6', points: 50000, order: 7 },
};

// 당첨 티켓
export interface WinningTicket {
  id: string;
  ticketType: TicketType;
  productName: string;
  productBrand: string;
  productImage: string;
  points: number;
  wonAt: string; // ISO date string
  status: 'active' | 'converted' | 'exchanged' | 'shipped' | 'delivered';
  convertedPoints?: number;
  rouletteUsed?: boolean;
  shippingRequested?: boolean;
  shippingInfo?: {
    name: string;
    phone: string;
    address: string;
    requestedAt: string;
  };
}

// 거래소 티켓
export interface ExchangeTicket {
  id: string;
  ticketId: string;
  ticketType: TicketType;
  productName: string;
  productBrand: string;
  productImage: string;
  points: number;
  price: number; // 판매가 (포인트)
  sellerId: string;
  sellerName: string;
  status: 'selling' | 'sold' | 'cancelled';
  listedAt: string;
  soldAt?: string;
}

// 포인트 거래 내역
export type TransactionType = 'charge' | 'ticket_purchase' | 'ticket_convert' | 'exchange_sell' | 'exchange_buy' | 'lucky_draw';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  relatedId?: string; // 티켓 ID 또는 거래 ID
}

// 럭키드로우 상품
export interface LuckyDrawProduct {
  id: number;
  brand: string;
  name: string;
  image: string;
  status: 'ongoing' | 'closed';
  entryPoints: number; // 참여 비용 포인트
  startDate: string;
  endDate: string;
  winnerCount: number;
  currentEntries: number;
  description?: string;
}

// 럭키드로우 참여 내역
export interface LuckyDrawEntry {
  id: string;
  productId: number;
  productName: string;
  entryPoints: number;
  enteredAt: string;
  status: 'pending' | 'won' | 'lost';
}

// 사용자 데이터
export interface UserData {
  userId: string;
  userName: string;
  points: number;
  winningTickets: WinningTicket[];
  transactions: Transaction[];
  exchangeTickets: ExchangeTicket[];
  luckyDrawEntries: LuckyDrawEntry[];
  // 카카오 로그인 정보
  kakaoId?: string;
  email?: string;
  profileImage?: string;
}

// 배송 정보
export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  memo?: string;
}