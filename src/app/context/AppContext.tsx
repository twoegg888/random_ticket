import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, WinningTicket, Transaction, ExchangeTicket } from '../types';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c`;
const ACCESS_TOKEN_KEY = 'kakao_access_token';

export interface AppContextType {
  // 사용자 데이터
  userData: UserData;
  refreshUserData: () => Promise<void>;

  // 포인트 관리
  addPoints: (amount: number, description: string, type?: Transaction['type']) => Promise<boolean>;
  deductPoints: (amount: number, description: string, type: Transaction['type'], relatedId?: string) => Promise<boolean>;

  // 티켓 관리
  buyTicket: (ticket: Omit<WinningTicket, 'id' | 'wonAt' | 'status'>) => Promise<void>;
  purchaseAtomicTicket: (params: {
    ticketData: Omit<WinningTicket, 'id' | 'wonAt' | 'status'>;
    points: number;
  }) => Promise<boolean>;
  updateTicket: (ticketId: string, updates: Partial<WinningTicket>) => Promise<void>;
  convertTicketToPoints: (ticketId: string, finalPoints: number, multiplier: number) => Promise<boolean>;

  // 거래소
  listExchangeTicket: (ticketId: string, ticketType: string, productName: string, productBrand: string, productImage: string, points: number, price: number) => Promise<boolean>;
  purchaseExchangeTicket: (exchangeTicketId: string) => Promise<boolean>;
  fetchExchangeTickets: (status?: string) => Promise<ExchangeTicket[]>;

  // 럭키드로우
  enterLuckyDraw: (productId: number | string, productName: string, entryPoints: number) => Promise<boolean>;
  getLuckyDrawEntries: (productId: number | string) => Promise<number>;

  // 배송 요청
  requestShipping: (ticketId: string, shippingInfo: any) => Promise<boolean>;

  // 카카오 로그인
  isLoggedIn: boolean;
  isInitialized: boolean;
  kakaoAccessToken: string | null;
  login: (kakaoId: string, userName: string, email: string, profileImage: string, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 초기 사용자 데이터
const INITIAL_USER_DATA: UserData = {
  userId: '',
  userName: '',
  points: 0,
  winningTickets: [],
  transactions: [],
  exchangeTickets: [],
  luckyDrawEntries: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [kakaoAccessToken, setKakaoAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 서버에서 사용자 데이터 가져오기
  const fetchUserData = async (kakaoId: string): Promise<UserData> => {
    try {
      console.log('🔍 [fetchUserData] ========== START ==========');
      console.log('🔍 [fetchUserData] KakaoId:', kakaoId);
      
      const url = `${API_BASE}/user/${kakaoId}/data`;
      console.log('🔍 [fetchUserData] Calling API:', url);
      
      // 🔥 Authorization 헤더 추가
      const headers: HeadersInit = {
        'Authorization': `Bearer ${publicAnonKey}`,
      };
      
      const response = await fetch(url, { headers });
      console.log('🔍 [fetchUserData] Response status:', response.status);
      
      const result = await response.json();
      console.log('🔍 [fetchUserData] Response data:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ [fetchUserData] Success! Points:', result.data.points);
        console.log('🔍 [fetchUserData] ========== END ==========');
        return result.data;
      }
      
      // 실패해도 로그아웃하지 않고 초기 데이터 반환
      console.warn('⚠️ [fetchUserData] Failed to fetch user data, using initial data');
      console.log('🔍 [fetchUserData] ========== END ==========');
      return INITIAL_USER_DATA;
    } catch (error) {
      console.error('❌ [fetchUserData] Error:', error);
      console.log('🔍 [fetchUserData] ========== END ==========');
      return INITIAL_USER_DATA;
    }
  };

  // 사용자 데이터 새로고침
  const refreshUserData = async () => {
    try {
      console.log('🔄 [refreshUserData] 시작...');
      
      // 🔥 이미 로그인된 상태이므로 userData.kakaoId 사용
      if (!userData.kakaoId) {
        console.error('❌ [refreshUserData] No kakaoId found in userData');
        return;
      }

      console.log('👤 [refreshUserData] kakaoId:', userData.kakaoId);

      // 🔥 kakaoId로 사용자 데이터 조회
      console.log(`📡 [refreshUserData] Calling /user/${userData.kakaoId}/data...`);
      const data = await fetchUserData(userData.kakaoId);
      console.log('📦 [refreshUserData] User data from API:', data);
      
      // 🔥 기존 정보 유지하면서 업데이트
      const mergedData = {
        ...userData,
        ...data,
      };
      
      console.log('✅ [refreshUserData] 병합된 데이터:', mergedData);
      console.log('💰 [refreshUserData] 포인트:', mergedData.points);
      
      setUserData(mergedData);

      console.log('✅ User data refreshed successfully!');
    } catch (error) {
      console.error('❌ [refreshUserData] Failed to refresh user data:', error);
    }
  };

  // 초기 로그인 상태 확인
  useEffect(() => {
    const checkInitialLogin = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        setKakaoAccessToken(token);
        
        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setIsLoggedIn(true);
              
              // 서버에서 사용자 데이터 로드
              const data = await fetchUserData(result.user.kakaoId);
              setUserData({
                ...data,
                kakaoId: result.user.kakaoId,
                userName: result.user.nickname,
                email: result.user.email,
                profileImage: result.user.profileImage,
              });
            }
          } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
          }
        } catch (error) {
          console.error('Failed to check login status:', error);
        }
      }
      
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    };
    
    checkInitialLogin();
  }, []);

  // 포인트 추가
  const addPoints = async (amount: number, description: string, type: Transaction['type'] = 'charge'): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/points/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ amount, description, type }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add points:', error);
      return false;
    }
  };

  // 포인트 차감
  const deductPoints = async (amount: number, description: string, type: Transaction['type'], relatedId?: string): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/points/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ amount, description, type, relatedId }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to deduct points:', error);
      return false;
    }
  };

  // 티켓 구매
  const buyTicket = async (ticket: Omit<WinningTicket, 'id' | 'wonAt' | 'status'>) => {
    if (!userData.kakaoId) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/tickets/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(ticket),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Failed to buy ticket:', error);
    }
  };

  const purchaseAtomicTicket = async ({
    ticketData,
    points,
  }: {
    ticketData: Omit<WinningTicket, 'id' | 'wonAt' | 'status'>;
    points: number;
  }): Promise<boolean> => {
    if (!userData.kakaoId) return false;

    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/tickets/purchase-atomic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ticketData,
          points,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await refreshUserData();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to purchase ticket atomically:', error);
      return false;
    }
  };

  // 티켓 업데이트
  const updateTicket = async (ticketId: string, updates: Partial<WinningTicket>) => {
    if (!userData.kakaoId) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  // 🎰 티켓 포인트 전환 (서버 API 호출)
  const convertTicketToPoints = async (ticketId: string, finalPoints: number, multiplier: number): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      console.log(`🎰 [convertTicketToPoints] START - ticketId: ${ticketId}, finalPoints: ${finalPoints}, multiplier: ${multiplier}`);
      
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/tickets/${ticketId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ finalPoints, multiplier }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ [convertTicketToPoints] SUCCESS - New points: ${result.points}`);
        await refreshUserData();
        return true;
      } else {
        console.error(`❌ [convertTicketToPoints] FAILED:`, result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ [convertTicketToPoints] Error:', error);
      return false;
    }
  };

  // 거래소 티켓 등록
  const listExchangeTicket = async (
    ticketId: string,
    ticketType: string,
    productName: string,
    productBrand: string,
    productImage: string,
    points: number,
    price: number
  ): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/exchange/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          kakaoId: userData.kakaoId,
          ticketId,
          ticketType,
          productName,
          productBrand,
          productImage,
          points,
          price,
          sellerName: userData.userName,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to list exchange ticket:', error);
      return false;
    }
  };

  // 거래소 티켓 구매
  const purchaseExchangeTicket = async (exchangeTicketId: string): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/exchange/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          buyerKakaoId: userData.kakaoId,
          exchangeTicketId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to purchase exchange ticket:', error);
      return false;
    }
  };

  // 거래소 티켓 목록 조회
  const fetchExchangeTickets = async (status: string = 'selling'): Promise<ExchangeTicket[]> => {
    try {
      const response = await fetch(`${API_BASE}/exchange/tickets?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        return result.tickets;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch exchange tickets:', error);
      return [];
    }
  };

  // 럭키드로우 참여
  const enterLuckyDraw = async (productId: number | string, productName: string, entryPoints: number): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/lucky-draw/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          kakaoId: userData.kakaoId,
          productId,
          productName,
          entryPoints,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to enter lucky draw:', error);
      return false;
    }
  };

  // 럭키드로우 참여자 수 조회
  const getLuckyDrawEntries = async (productId: number | string): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE}/lucky-draw/${productId}/entries`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        return result.count;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get lucky draw entries:', error);
      return 0;
    }
  };

  // 배송 요청
  const requestShipping = async (ticketId: string, shippingInfo: any): Promise<boolean> => {
    if (!userData.kakaoId) return false;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userData.kakaoId}/shipping/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ticketId,
          shippingInfo,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to request shipping:', error);
      return false;
    }
  };

  // 로그인
  const login = async (
    kakaoId: string,
    userName: string,
    email: string,
    profileImage: string,
    accessToken: string
  ) => {
    console.log('🔑 [login] Starting login process...');
    console.log('🔑 [login] kakaoId:', kakaoId);
    console.log('🔑 [login] userName:', userName);
    console.log('🔑 [login] accessToken:', accessToken);
    
    // 로컬 스토리지에 액세스 토큰 저장
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    console.log('✅ [login] Token saved to localStorage');
    
    // 카카오 토큰 상태 저장
    setKakaoAccessToken(accessToken);
    setIsLoggedIn(true);
    console.log('✅ [login] Login state updated');

    // 사용자 데이터 로드
    console.log('📡 [login] Fetching user data...');
    const data = await fetchUserData(kakaoId);
    console.log('📦 [login] User data fetched:', data);
    console.log('💰 [login] Points:', data.points);
    
    // 사용자 데이터 업데이트 (카카오 정보 병합)
    setUserData({
      ...data,
      kakaoId,
      userName: data.userName || userName,
      email: data.email || email,
      profileImage,
    });
    console.log('✅ [login] Login completed successfully!');
  };

  // 로그아웃
  const logout = async () => {
    if (kakaoAccessToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${kakaoAccessToken}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setIsLoggedIn(false);
    setKakaoAccessToken(null);
    setUserData(INITIAL_USER_DATA);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  };

  // 로그인 상태 확인
  const checkLoginStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoggedIn(false);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setIsLoggedIn(false);
        return false;
      }

      const result = await response.json();
      if (result.success) {
        setIsLoggedIn(true);
        return true;
      }

      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error('Failed to check login status:', error);
      setIsLoggedIn(false);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        userData,
        refreshUserData,
        addPoints,
        deductPoints,
        buyTicket,
        purchaseAtomicTicket,
        updateTicket,
        convertTicketToPoints,
        listExchangeTicket,
        purchaseExchangeTicket,
        fetchExchangeTickets,
        enterLuckyDraw,
        getLuckyDrawEntries,
        requestShipping,
        isLoggedIn,
        isInitialized,
        kakaoAccessToken,
        login,
        logout,
        checkLoginStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
