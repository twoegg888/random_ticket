import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

type TicketType = 'diamond' | 'gold' | 'platinum' | 'ruby';

const TICKET_TYPE_NAMES: Record<TicketType, string> = {
  diamond: '다이아 박스',
  gold: '골드 박스',
  platinum: '플래티넘 박스',
  ruby: '루비 박스',
};

interface Product {
  id: string;
  name: string;
  brand: string;
  points: number;
  imageUrl: string;
  ticketType: string;
}

export default function HomeProductsTab({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType>('diamond');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔐 관리자 API 호출 헤더
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

  // 홈 메인 상품 목록 로드
  const loadHomeProducts = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      alert('인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/home-products`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setHomeProducts(data.products || []);
      } else {
        console.error('Failed to load home products:', await response.text());
      }
    } catch (error) {
      console.error('Error loading home products:', error);
    }
  };

  // 티켓 타입의 상품 목록 로드
  const loadTicketProducts = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${selectedTicketType}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading ticket products:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHomeProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTicketProducts();
    }
  }, [isAuthenticated, selectedTicketType]);

  // 상품 추가
  const handleAddProduct = async (productId: string) => {
    const headers = getAuthHeaders();
    if (!headers) {
      alert('인증 정보가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/home-products`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketType: selectedTicketType,
            productId,
          }),
        }
      );

      if (response.ok) {
        alert('홈 메인 상품에 추가되었습니다!');
        loadHomeProducts();
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Product already added') {
          alert('이미 추가된 상품입니다.');
        } else {
          alert(`추가 실패: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('상품 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상품 삭제
  const handleRemoveProduct = async (ticketType: string, productId: string) => {
    if (!confirm('이 상품을 홈 메인에서 제거하시겠습니까?')) return;

    const headers = getAuthHeaders();
    if (!headers) {
      alert('인증 정보가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/home-products/${ticketType}/${productId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (response.ok) {
        alert('홈 메인에서 제거되었습니다!');
        loadHomeProducts();
      } else {
        const errorData = await response.json();
        alert(`제거 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('상품 제거 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">홈 메인 상품 관리</h1>
      <p className="text-gray-600 mb-4">
        홈 화면의 "박스에서 어떤 상품이 나왔을까요?" 섹션에 표시될 상품을 선택하세요.
        <br />
        클릭하면 해당 박스 페이지로 이동합니다.
      </p>

      {/* 현재 등록된 홈 메인 상품 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">현재 홈 메인 상품 ({homeProducts.length}개)</h2>
        {homeProducts.length === 0 ? (
          <p className="text-gray-500">등록된 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeProducts.map((product) => (
              <div key={`${product.ticketType}-${product.id}`} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-blue-600 font-semibold mb-1">
                      {TICKET_TYPE_NAMES[product.ticketType as TicketType]}
                    </div>
                    <div className="font-semibold text-sm truncate">{product.name}</div>
                    <div className="text-xs text-gray-600">{product.brand}</div>
                    <div className="text-sm font-bold mt-1">{product.points.toLocaleString()}P</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.ticketType, product.id)}
                  disabled={loading}
                  className="mt-3 w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  제거
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상품 추가 섹션 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">상품 추가</h2>
        
        {/* 박스 타입 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">박스 타입 선택</label>
          <select
            value={selectedTicketType}
            onChange={(e) => setSelectedTicketType(e.target.value as TicketType)}
            className="w-full md:w-64 px-3 py-2 border rounded"
          >
            {Object.entries(TICKET_TYPE_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 상품 목록 */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            {TICKET_TYPE_NAMES[selectedTicketType]} 상품 ({availableProducts.length}개)
          </h3>
          {availableProducts.length === 0 ? (
            <p className="text-gray-500">상품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableProducts.map((product) => {
                const isAdded = homeProducts.some(
                  (hp) => hp.id === product.id && hp.ticketType === selectedTicketType
                );
                
                return (
                  <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-start gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{product.name}</div>
                        <div className="text-xs text-gray-600">{product.brand}</div>
                        <div className="text-sm font-bold mt-1">{product.points.toLocaleString()}P</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product.id)}
                      disabled={loading || isAdded}
                      className={`mt-3 w-full px-3 py-2 rounded text-sm ${
                        isAdded
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:opacity-50`}
                    >
                      {isAdded ? '이미 추가됨' : '홈에 추가'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
