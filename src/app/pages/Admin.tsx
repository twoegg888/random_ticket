import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Link, useNavigate } from "react-router";
import ShippingTab from "../components/ShippingTab";
import HomeProductsTab from "../components/HomeProductsTab";
import { useApp } from "../context/AppContext";
import * as XLSX from 'xlsx';

type Tab = 'dashboard' | 'users' | 'products' | 'luckydraws' | 'shipping' | 'homeproducts';
type TicketType = 'diamond' | 'gold' | 'platinum' | 'ruby';

const TICKET_TYPE_NAMES: Record<TicketType, string> = {
  diamond: '다이아 박스',
  gold: '골드 박스',
  platinum: '플래티넘 박스',
  ruby: '루비 박스',
};

// 🔐 관리자 API 호출 헤더 (모든 컴포넌트에서 사용 가능)
const getAuthHeaders = () => {
  const adminSecret = sessionStorage.getItem('admin_secret');
  
  if (!adminSecret) {
    return null;
  }
  
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Admin-Secret': adminSecret,
  };
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // 🔥 관리자 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = sessionStorage.getItem('admin_authenticated');
      const loginTime = sessionStorage.getItem('admin_login_time');
      const adminSecret = sessionStorage.getItem('admin_secret');

      if (!authenticated || authenticated !== 'true') {
        navigate('/admin/login');
        return;
      }
      
      if (!adminSecret) {
        sessionStorage.clear(); // 세션 클리어
        navigate('/admin/login');
        return;
      }
      
      // 세션 유효 시간 체크 (2시간)
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (elapsed > twoHours) {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          sessionStorage.removeItem('admin_secret');
          navigate('/admin/login');
          return;
        }
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    sessionStorage.removeItem('admin_secret');
    navigate('/');
  };
  
  // 인증 체크 중
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }
  
  // 인증되지 않음
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#6b7280] hover:text-[#111827] transition-colors font-['Pretendard:Medium',sans-serif] text-[14px]">
                ← 홈으로
              </Link>
              <div className="w-[1px] h-[20px] bg-[#e5e7eb]" />
              <h1 className="text-[24px] font-['Pretendard:Bold',sans-serif] text-[#111827]">관리자 대시보드</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-[16px] py-[10px] text-[14px] text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-[8px] font-['Pretendard:Medium',sans-serif] transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex gap-[32px]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'dashboard'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              📊 대시보드
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'users'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              👥 회원 관리
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'products'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              🎁 상품 관리
            </button>
            <button
              onClick={() => setActiveTab('luckydraws')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'luckydraws'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              🎲 럭키드로우
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'shipping'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              📦 배송 관리
            </button>
            <button
              onClick={() => setActiveTab('homeproducts')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'homeproducts'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              🏠 홈 메인 상품
            </button>
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-[1400px] mx-auto px-6 py-[32px]">
        {activeTab === 'dashboard' && <DashboardTab isAuthenticated={isAuthenticated} />}
        {activeTab === 'users' && <UsersTab isAuthenticated={isAuthenticated} />}
        {activeTab === 'products' && <ProductsTab isAuthenticated={isAuthenticated} />}
        {activeTab === 'luckydraws' && <LuckyDrawsTab isAuthenticated={isAuthenticated} />}
        {activeTab === 'shipping' && <ShippingTab isAuthenticated={isAuthenticated} />}
        {activeTab === 'homeproducts' && <HomeProductsTab isAuthenticated={isAuthenticated} />}
      </div>
    </div>
  );
}

// ============================================
// 대시보드 탭
// ============================================
function DashboardTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return; // 🚨 헤더가 null이면 종료
      console.log('📊 [fetchStats] Calling /admin/stats...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/stats`,
        {
          method: 'GET',
          headers,
          mode: 'cors',
          cache: 'no-cache',
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        console.error('❌ [fetchStats] Error:', data);
        alert(`❌ 관리자 권한이 없습니다: ${data.error || response.statusText}`);
        return;
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">전체 통계</h2>
      
      <div className="flex flex-col gap-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">전체 회원 수</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 포인트 충전액</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{(stats?.totalPointsCharged || 0).toLocaleString()}P</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🎫</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">박스 판매 수</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats?.totalTicketsSold || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⚠️ 관리자 알림</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 상품 관리 탭에서 박스별 당첨 상품을 추가/수정할 수 있습니다.</p>
          <p>• 회원 ���리 탭에서 포인트를 직접 충전/차감할 수 있습니다.</p>
          <p>• 럭키드로우 탭에서 이벤트를 생성하고 당첨자를 선정할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 회원 관리 탭
// ============================================
function UsersTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pointAmount, setPointAmount] = useState(100000);
  const [pointDescription, setPointDescription] = useState('관리자 포인트 충전');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return; // 🚨 헤더가 null이면 종료
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/users`,
        {
          headers,
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Admin API error:', data);
        alert(`❌ 관리자 권한이 없습니다: ${data.error || response.statusText}`);
        return;
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(`❌ 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (kakaoId: string) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/user/${kakaoId}/points/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            amount: pointAmount,
            description: pointDescription,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ 성공! 현재 포인트: ${data.points.toLocaleString()}P\n\n💡 팁: 앱에서 포인트가 안 보이면 포인트 페이지 우측 상단의 새로고침 버튼(🔄)을 눌러주세요!`);
        fetchUsers(); // 목록 새로고침
        setSelectedUser(null);
      } else {
        alert(`❌ 실패: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  // 🔥 회원 삭제 함수
  const handleDeleteUser = async (kakaoId: string, userName: string) => {
    if (!confirm(`정말로 "${userName}" (ID: ${kakaoId})의 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!`)) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/users/${kakaoId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${userName}의 모든 데이터가 삭제되었습니다.\n\n💡 로그아웃 후 다시 로그인하면 새 계정이 생성됩니다.`);
        fetchUsers(); // 목록 새로고침
      } else {
        alert(`❌ 실패: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">회원 목록 ({users.length}명)</h2>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.kakaoId}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                      {user.email && (
                        <span className="text-xs text-gray-500">{user.email}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">카카오 ID: {user.kakaoId}</span>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                      <span>💰 {user.points?.toLocaleString() || 0}P</span>
                      <span>🎫 당첨 {user.winningTicketsCount || 0}개</span>
                      <span>📝 거래 {user.transactionsCount || 0}건</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="ml-4 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                    >
                      포인트 충전
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.kakaoId, user.userName)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 포인트 충전 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">포인트 충전 - {selectedUser.userName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">충전 금액</label>
                <input
                  type="number"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="mt-2 flex gap-2">
                  {[10000, 50000, 100000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPointAmount(amount)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {(amount / 10000).toFixed(0)}만
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <input
                  type="text"
                  value={pointDescription}
                  onChange={(e) => setPointDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddPoints(selectedUser.kakaoId)}
                  className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  충전
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 상품 관리 탭
// ============================================
function ProductsTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType>('diamond');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, selectedTicketType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${selectedTicketType}`,
        {
          headers,
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Admin API error:', data);
        alert(`❌ 관리자 권한이 없습니다: ${data.error || response.statusText}`);
        return;
      }
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert(`❌ 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${selectedTicketType}/${productId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (response.ok) {
        alert('✅ 삭제되었습니다.');
        fetchProducts();
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  // 📥 엑셀 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '박스타입': 'diamond',
        '상품명': 'iPhone 15 Pro Max',
        '브랜드': 'Apple',
        '포인트': 50000,
        '가중치': 5,
        '재고': 10,
        '이미지URL': 'https://images.unsplash.com/photo-1632633728024-e1fd4bef561a',
      },
      {
        '박스타입': 'gold',
        '상품명': 'AirPods Pro',
        '브랜드': 'Apple',
        '포인트': 15000,
        '가중치': 10,
        '재고': 50,
        '이미지URL': 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7',
      },
      {
        '박스타입': 'ruby',
        '상품명': 'CU 모바일 상품권 3만원',
        '브랜드': 'CU',
        '포인트': 10000,
        '가중치': 15,
        '재고': 100,
        '이미지URL': 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '상품목록');
    
    // 열 너비 설정
    ws['!cols'] = [
      { wch: 12 }, // 박스타입
      { wch: 25 }, // 상품명
      { wch: 15 }, // 브랜드
      { wch: 10 }, // 포인트
      { wch: 10 }, // 가중치
      { wch: 8 },  // 재고
      { wch: 60 }, // 이미지URL
    ];

    XLSX.writeFile(wb, '상품등록_템플릿.xlsx');
  };

  // 📤 엑셀 파일 업로드 및 일괄 등록
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('📊 엑셀 데이터:', jsonData);

      if (jsonData.length === 0) {
        alert('❌ 엑셀 파일에 데이터가 없습니다.');
        return;
      }

      // 데이터 검증 및 변환
      const productsToAdd: any[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowNum = index + 2; // 엑셀 행 번호 (헤더 포함)
        
        // 필수 필드 확인
        if (!row['박스타입']) {
          errors.push(`${rowNum}행: 박스타입이 없습니다.`);
          return;
        }
        if (!row['상품명']) {
          errors.push(`${rowNum}행: 상품명이 없습니다.`);
          return;
        }
        if (!row['브랜드']) {
          errors.push(`${rowNum}행: 브랜드가 없습니다.`);
          return;
        }
        if (!row['이미지URL']) {
          errors.push(`${rowNum}행: 이미지URL이 없습니다.`);
          return;
        }

        // 티켓 타입 검증
        const ticketType = String(row['박스타입']).toLowerCase();
        const validTicketTypes = ['diamond', 'gold', 'platinum', 'ruby'];
        if (!validTicketTypes.includes(ticketType)) {
          errors.push(`${rowNum}행: 잘못된 박스타입 (${row['박스타입']}). 가능한 값: ${validTicketTypes.join(', ')}`);
          return;
        }

        productsToAdd.push({
          ticketType,
          name: String(row['상품명']),
          brand: String(row['브랜드']),
          points: Number(row['포인트']) || 1000,
          probability: Number(row['가중치']) || 5,
          stock: Number(row['재고']) || 999,
          imageUrl: String(row['이미지URL']),
        });
      });

      if (errors.length > 0) {
        alert(`❌ 데이터 검증 실패:\n\n${errors.join('\n')}`);
        setUploading(false);
        return;
      }

      if (productsToAdd.length === 0) {
        alert('❌ 등록할 상품이 없습니다.');
        setUploading(false);
        return;
      }

      // 일괄 등록 확인
      if (!confirm(`총 ${productsToAdd.length}개의 상품을 등록하시겠습니까?`)) {
        setUploading(false);
        return;
      }

      // 백엔드 API 호출 (각 상품별로 등록)
      let successCount = 0;
      let failCount = 0;
      const failedProducts: string[] = [];

      for (const product of productsToAdd) {
        try {
          const headers = getAuthHeaders();
          if (!headers) {
            alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
            break;
          }
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${product.ticketType}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: JSON.stringify({
                name: product.name,
                brand: product.brand,
                imageUrl: product.imageUrl,
                points: product.points,
                probability: product.probability,
                stock: product.stock,
              }),
            }
          );

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            failCount++;
            failedProducts.push(`${product.name} (${data.error})`);
          }
        } catch (error) {
          failCount++;
          failedProducts.push(`${product.name} (네트워크 에러)`);
        }
      }

      // 결과 알림
      let message = `✅ 등록 완료!\n\n성공: ${successCount}개\n실패: ${failCount}개`;
      if (failedProducts.length > 0) {
        message += `\n\n실패한 상품:\n${failedProducts.join('\n')}`;
      }
      alert(message);

      // 목록 새로고침
      fetchProducts();

      // 파일 입력 초기화
      e.target.value = '';
    } catch (error) {
      alert(`❌ 엑셀 파일 처리 중 오류: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">상품 관리</h2>
        <div className="flex gap-2">
          {/* 엑셀 템플릿 다운로드 버튼 */}
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
          >
            📥 템플릿 다운로드
          </button>
          
          {/* 엑셀 업로드 버튼 */}
          <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer flex items-center gap-2">
            {uploading ? '업로드 중...' : '📤 엑셀 일괄등록'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* 개별 상품 추가 버튼 */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            + 상품 추가
          </button>
        </div>
      </div>

      {/* 엑셀 업로드 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 엑셀 일괄 등록 사용 방법</h3>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li><strong>템플릿 다운로드</strong> 버튼을 클릭하여 엑셀 템플릿을 다운로드합니다.</li>
          <li>템플릿에 상품 정보를 입력합니다. (박스타입, 상품명, 브랜드, 포인트, 가중치, 재고, 이미지URL)</li>
          <li><strong>엑셀 일괄등록</strong> 버튼을 클릭하여 작성한 파일을 업로드합니다.</li>
          <li>검증 후 일괄 등록됩니다.</li>
        </ol>
        <p className="text-xs text-blue-600 mt-2">
          ⚠️ 박스타입: diamond, gold, platinum, ruby 중 하나여야 합니다.
        </p>
      </div>

      {/* 박스 타입 선택 */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(TICKET_TYPE_NAMES) as TicketType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedTicketType(type)}
            className={`px-4 py-2 rounded ${
              selectedTicketType === type
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {TICKET_TYPE_NAMES[type]}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : products.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 상품이 없습니다</h3>
          <p className="text-sm text-gray-500 mb-6">
            {TICKET_TYPE_NAMES[selectedTicketType]}에 당첨 가능한 상품을 추가해주세요.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            첫 상품 등록하기
          </button>
        </div>
      ) : (
        <>
          {/* 📊 가중치 요약 */}
          {(() => {
            const activeProducts = products.filter(p => p.isActive);
            const totalWeight = activeProducts.reduce((sum, p) => sum + p.probability, 0);
            return activeProducts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📊 현재 가중치 설정</h3>
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">
                    • 전체 가중치 합계: <strong>{totalWeight}</strong>
                  </p>
                  {activeProducts.map((p) => (
                    <p key={p.id} className="text-xs text-blue-600">
                      • {p.name}: {p.probability} ({((p.probability / totalWeight) * 100).toFixed(2)}%)
                    </p>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <div className="mt-1 flex gap-3 text-xs text-gray-500">
                          <span>💰 {product.points.toLocaleString()}P</span>
                          <span>⚖️ 가중치 {product.probability}</span>
                          <span>📦 재고 {product.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        </>
      )}

      {/* 추가/수정 모달 */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          ticketType={selectedTicketType}
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}

// 상품 추가/수정 모달
function ProductModal({
  ticketType,
  product,
  onClose,
  onSuccess,
}: {
  ticketType: TicketType;
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    imageUrl: product?.imageUrl || '',
    points: product?.points || 1000,
    probability: product?.probability || 5,
    stock: product?.stock || 999,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      console.log('🔍 [ProductModal] product:', product);
      console.log('🔍 [ProductModal] product.id:', product?.id);
      console.log('🔍 [ProductModal] ticketType:', ticketType);
      
      const url = product
        ? `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${ticketType}/${product.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${ticketType}`;

      console.log('🔍 [ProductModal] Request URL:', url);
      console.log('🔍 [ProductModal] Request method:', product ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('🔍 [ProductModal] Response:', data);

      if (data.success) {
        alert(`✅ ${product ? '수정' : '추가'}되었습니다.`);
        onSuccess();
        onClose();
      } else {
        alert(`❌ 실패: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
        <h3 className="text-lg font-bold mb-4">
          {product ? '상품 수정' : '상품 추가'} - {TICKET_TYPE_NAMES[ticketType]}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://images.unsplash.com/..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">포인트</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가중치 (상대적 당첨 확률)
              </label>
              <input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 전체 합계가 100일 필요 없습니다. 예: 3, 2, 5 입력 시 → 30%, 20%, 50% 확률
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              {product ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// 럭키드로우 탭
// ============================================
function LuckyDrawsTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [luckyDraws, setLuckyDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLuckyDraws();
    }
  }, [isAuthenticated]);

  const fetchLuckyDraws = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/lucky-draws`,
        {
          headers,
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Admin API error:', data);
        alert(`❌ 관리자 권한이 없습니다: ${data.error || response.statusText}`);
        return;
      }
      
      setLuckyDraws(data.luckyDraws || []);
    } catch (error) {
      console.error('Error fetching lucky draws:', error);
      alert(`❌ 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinner = async (luckyDrawId: string) => {
    if (!confirm('당첨자를 추첨하시겠습니까?')) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/lucky-draws/${luckyDrawId}/draw-winner`,
        {
          method: 'POST',
          headers,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`🎉 당첨자: ${data.winner.userName} (총 ${data.totalParticipants}명 참여)`);
        fetchLuckyDraws();
      } else {
        alert(`❌ 실패: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">럭키드로우 관리</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          + 럭키드로우 추가
        </button>
      </div>

      {luckyDraws.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 럭키드로우가 없습니다</h3>
          <p className="text-sm text-gray-500 mb-6">
            새로운 럭키드로우 이벤트를 추가하여 사용자들에게 응모 기회를 제공하세요.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            첫 럭키드로우 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {luckyDraws.map((draw) => (
            <div key={draw.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={draw.imageUrl}
                  alt={draw.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{draw.name}</h3>
                  <p className="text-sm text-gray-500">{draw.brand}</p>
                  <p className="text-sm text-gray-500">참여: {draw.entryPoints.toLocaleString()}P</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDrawWinner(draw.id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                >
                  🎲 추첨하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <LuckyDrawModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchLuckyDraws}
        />
      )}
    </div>
  );
}

// 럭키드로우 추가 모달
function LuckyDrawModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    imageUrl: '',
    entryPoints: 10000,
    endDate: '',
    maxParticipants: 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/lucky-draws`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ 럭키드로우가 추가되었습니다.');
        onSuccess();
        onClose();
      } else {
        alert(`❌ 실패: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 에러: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">럭키드로우 추가</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">참여 포인트</label>
            <input
              type="number"
              value={formData.entryPoints}
              onChange={(e) => setFormData({ ...formData, entryPoints: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              추가
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
