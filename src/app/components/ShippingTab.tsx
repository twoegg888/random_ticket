import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// 🔐 관리자 API 호출 헤더 생성
const getAuthHeaders = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 [ShippingTab getAuthHeaders] Checking sessionStorage...');
  console.log('   sessionStorage.length:', sessionStorage.length);
  console.log('   sessionStorage keys:', Object.keys(sessionStorage));
  
  const adminSecret = sessionStorage.getItem('admin_secret');
  
  console.log('   admin_secret from storage:', adminSecret ? `${adminSecret.substring(0, 3)}***` : 'NOT FOUND!');
  
  if (!adminSecret) {
    console.error('❌ [ShippingTab getAuthHeaders] No admin_secret in sessionStorage!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 🚨 에러를 던지지 않고 null 반환
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Admin-Secret': adminSecret,
  };
  
  console.log('✅ [ShippingTab getAuthHeaders] Headers created successfully');
  console.log('   Authorization:', `Bearer ${publicAnonKey.substring(0, 10)}...`);
  console.log('   X-Admin-Secret:', `${adminSecret.substring(0, 3)}***`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return headers;
};

export default function ShippingTab({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const [shippingRequests, setShippingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchShippingRequests();
    }
  }, [isAuthenticated]);

  const fetchShippingRequests = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        console.error('❌ [fetchShippingRequests] No auth headers available!');
        return; // 🚨 헤더가 없으면 종료
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/shipping`,
        {
          headers,
        }
      );
      const data = await response.json();
      setShippingRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching shipping requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('❌ 인증 정보가 없습니다. 다시 로그인해주세요.');
        return; // 🚨 헤더가 없으면 종료
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/shipping/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ 배송 상태가 "${status}"로 변경되었습니다.`);
        fetchShippingRequests();
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

  const filteredRequests = filter === 'all' 
    ? shippingRequests 
    : shippingRequests.filter(req => req.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">배송 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({shippingRequests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            대기중 ({shippingRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'shipped' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            배송중 ({shippingRequests.filter(r => r.status === 'shipped').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'delivered' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            배송완료 ({shippingRequests.filter(r => r.status === 'delivered').length})
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">배송 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.ticketId} className="bg-white shadow rounded-lg p-6">
              <div className="flex gap-4">
                <img
                  src={request.ticket.productImage}
                  alt={request.ticket.productName}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{request.ticket.productBrand}</h3>
                      <p className="text-sm text-gray-600">{request.ticket.productName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status === 'pending' && '대기중'}
                      {request.status === 'shipped' && '배송중'}
                      {request.status === 'delivered' && '배송완료'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">받는 사람</p>
                      <p className="text-sm font-medium">{request.shippingInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">연락처</p>
                      <p className="text-sm font-medium">{request.shippingInfo.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">배송 주소</p>
                      <p className="text-sm font-medium">
                        [{request.shippingInfo.zipCode}] {request.shippingInfo.address}<br />
                        {request.shippingInfo.detailAddress}
                      </p>
                    </div>
                    {request.shippingInfo.memo && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">배송 메모</p>
                        <p className="text-sm text-gray-700">{request.shippingInfo.memo}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">회원 정보</p>
                      <p className="text-sm">{request.userName} (ID: {request.kakaoId})</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">요청 시간</p>
                      <p className="text-sm">{new Date(request.requestedAt).toLocaleString('ko-KR')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(request.ticketId, 'shipped')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        📦 배송 시작
                      </button>
                    )}
                    {request.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(request.ticketId, 'delivered')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                      >
                        ✅ 배송 완료
                      </button>
                    )}
                    {request.status === 'delivered' && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded text-sm">
                        배송이 완료되었습니다
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}