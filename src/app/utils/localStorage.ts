import { UserData, WinningTicket, Transaction, ExchangeTicket, LuckyDrawEntry } from '../types';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const STORAGE_KEY = 'lottery_app_data';
const ACCESS_TOKEN_KEY = 'kakao_access_token';

// 초기 데이터
const INITIAL_USER_DATA: UserData = {
  userId: 'user_demo_001',
  userName: '테스트 사용자',
  points: 0, // 초기 포인트 0원으로 변경
  winningTickets: [],
  transactions: [],
  exchangeTickets: [],
  luckyDrawEntries: [],
};

// LocalStorage에서 데이터 가져오기
export function getUserData(): UserData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 초기 데이터 저장
    saveUserData(INITIAL_USER_DATA);
    return INITIAL_USER_DATA;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return INITIAL_USER_DATA;
  }
}

// LocalStorage에 데이터 저장
export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

// 포인트 추가
export function addPoints(amount: number, description: string, type: Transaction['type'] = 'charge'): void {
  const data = getUserData();
  data.points += amount;
  data.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount,
    description,
    createdAt: new Date().toISOString(),
  });
  saveUserData(data);
}

// 포인트 차감
export function deductPoints(amount: number, description: string, type: Transaction['type'], relatedId?: string): boolean {
  const data = getUserData();
  if (data.points < amount) {
    return false; // 포인트 부족
  }
  data.points -= amount;
  data.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount: -amount,
    description,
    createdAt: new Date().toISOString(),
    relatedId,
  });
  saveUserData(data);
  return true;
}

// 당첨 티켓 추가
export function addWinningTicket(ticket: Omit<WinningTicket, 'id' | 'wonAt' | 'status'>): WinningTicket {
  const data = getUserData();
  const newTicket: WinningTicket = {
    ...ticket,
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wonAt: new Date().toISOString(),
    status: 'active',
  };
  data.winningTickets.unshift(newTicket);
  saveUserData(data);
  return newTicket;
}

// buyTicket은 addWinningTicket의 별칭
export const buyTicket = addWinningTicket;

// 당첨 티켓 조회
export function getWinningTicket(id: string): WinningTicket | null {
  const data = getUserData();
  return data.winningTickets.find(t => t.id === id) || null;
}

// 당첨 티켓 업데이트
export function updateWinningTicket(id: string, updates: Partial<WinningTicket>): void {
  const data = getUserData();
  const index = data.winningTickets.findIndex(t => t.id === id);
  if (index !== -1) {
    data.winningTickets[index] = { ...data.winningTickets[index], ...updates };
    saveUserData(data);
  }
}

// 당첨 티켓 삭제
export function deleteWinningTicket(id: string): void {
  const data = getUserData();
  data.winningTickets = data.winningTickets.filter(t => t.id !== id);
  saveUserData(data);
}

// 거래소 티켓 등록
export function addExchangeTicket(ticket: Omit<ExchangeTicket, 'id' | 'listedAt' | 'status'>): ExchangeTicket {
  const data = getUserData();
  const newTicket: ExchangeTicket = {
    ...ticket,
    id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    listedAt: new Date().toISOString(),
    status: 'selling',
  };
  data.exchangeTickets.unshift(newTicket);
  saveUserData(data);
  return newTicket;
}

// 거래소 티켓 구매
export function purchaseExchangeTicket(exchangeTicketId: string): boolean {
  const data = getUserData();
  const ticket = data.exchangeTickets.find(t => t.id === exchangeTicketId);
  
  if (!ticket || ticket.status !== 'selling') {
    return false;
  }
  
  // 포인트 차감
  if (data.points < ticket.price) {
    return false;
  }
  
  data.points -= ticket.price;
  
  // 거래 내역 추가
  data.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'exchange_buy',
    amount: -ticket.price,
    description: `${ticket.productName} 구매`,
    createdAt: new Date().toISOString(),
    relatedId: exchangeTicketId,
  });
  
  // 당첨 티켓에 추가
  const winningTicket: WinningTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ticketType: ticket.ticketType,
    productName: ticket.productName,
    productBrand: ticket.productBrand,
    productImage: ticket.productImage,
    points: ticket.points,
    wonAt: new Date().toISOString(),
    status: 'active',
  };
  data.winningTickets.unshift(winningTicket);
  
  // 거래소 티켓 상태 변경
  ticket.status = 'sold';
  ticket.soldAt = new Date().toISOString();
  
  saveUserData(data);
  return true;
}

// 럭키드로우 참여
export function enterLuckyDraw(productId: number, productName: string, entryPoints: number): boolean {
  const data = getUserData();
  
  // 이미 참여했는지 확인
  const alreadyEntered = data.luckyDrawEntries.some(
    e => e.productId === productId && e.status === 'pending'
  );
  
  if (alreadyEntered) {
    return false;
  }
  
  // 포인트 차감
  if (data.points < entryPoints) {
    return false;
  }
  
  data.points -= entryPoints;
  
  // 참여 내역 추가
  data.luckyDrawEntries.unshift({
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productId,
    productName,
    entryPoints,
    enteredAt: new Date().toISOString(),
    status: 'pending',
  });
  
  // 거래 내역 추가
  data.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'lucky_draw',
    amount: -entryPoints,
    description: `${productName} 럭키드로우 참여`,
    createdAt: new Date().toISOString(),
  });
  
  saveUserData(data);
  return true;
}

// 로그인
export function login(kakaoId: string, nickname: string, email: string, profileImage: string): void {
  const data = getUserData();
  data.kakaoId = kakaoId;
  data.userName = nickname;
  data.email = email;
  data.profileImage = profileImage;
  data.userId = `kakao_${kakaoId}`;
  saveUserData(data);
}

// 로그아웃
export function logout(): void {
  const data = getUserData();
  delete data.kakaoId;
  delete data.email;
  delete data.profileImage;
  data.userId = 'user_demo_001';
  data.userName = '테스트 사용자';
  saveUserData(data);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// 로그인 상태 확인
export async function checkLoginStatus(): Promise<boolean> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/auth/session/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return false;
    }

    const result = await response.json();
    if (result.success) {
      // 사용자 정보 업데이트
      const data = getUserData();
      data.kakaoId = result.user.kakaoId;
      data.userName = result.user.nickname;
      data.email = result.user.email;
      data.profileImage = result.user.profileImage;
      data.userId = `kakao_${result.user.kakaoId}`;
      saveUserData(data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to check login status:', error);
    return false;
  }
}

// 액세스 토큰 저장
export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

// 액세스 토큰 가져오기
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// 데이터 초기화 (테스트용)
export function resetUserData(): void {
  saveUserData(INITIAL_USER_DATA);
}
