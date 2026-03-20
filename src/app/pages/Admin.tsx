import { useState, useEffect } from "react";
import { apiBase, projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Link, useNavigate } from "react-router";
import ShippingTab from "../components/ShippingTab";
import HomeProductsTab from "../components/HomeProductsTab";
import { useApp } from "../context/AppContext";
import * as XLSX from 'xlsx';

type Tab = 'dashboard' | 'users' | 'products' | 'luckydraws' | 'shipping' | 'homeproducts';
type TicketType = 'diamond' | 'gold' | 'platinum' | 'ruby';

const TICKET_TYPE_NAMES: Record<TicketType, string> = {
  diamond: '?¤ì´??ë°•ìŠ¤',
  gold: 'ê³¨ë“œ ë°•ìŠ¤',
  platinum: '?Œë˜?°ë„˜ ë°•ìŠ¤',
  ruby: 'ë£¨ë¹„ ë°•ìŠ¤',
};

// ?” ê´€ë¦¬ì API ?¸ì¶œ ?¤ë” (ëª¨ë“  ì»´í¬?ŒíŠ¸?ì„œ ?¬ìš© ê°€??
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
  
  // ?”¥ ê´€ë¦¬ì ?¸ì¦ ì²´í¬
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = sessionStorage.getItem('admin_authenticated');
      const loginTime = sessionStorage.getItem('admin_login_time');
      const expiresAt = sessionStorage.getItem('admin_expires_at');
      const adminSecret = sessionStorage.getItem('admin_secret');

      if (!authenticated || authenticated !== 'true') {
        navigate('/admin/login');
        return;
      }

      if (expiresAt && Date.now() >= Number(expiresAt)) {
        sessionStorage.clear();
        navigate('/admin/login');
        return;
      }
      
        sessionStorage.clear();
        navigate('/admin/login');
        sessionStorage.clear(); // ?¸ì…˜ ?´ë¦¬??        navigate('/admin/login');
        return;
      }
      
        const elapsed = Date.now() - parseInt(loginTime, 10);
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (elapsed > twoHours) {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          sessionStorage.removeItem('admin_expires_at');
          sessionStorage.removeItem('admin_secret');
          navigate('/admin/login');
          return;
        }
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    };
    
    void checkAuth();
  }, [navigate]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    sessionStorage.removeItem('admin_expires_at');
    sessionStorage.removeItem('admin_secret');
    navigate('/');
  };
  
  // ?¸ì¦ ì²´í¬ ì¤?  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ê¶Œí•œ???•ì¸?˜ëŠ” ì¤?..</p>
        </div>
      </div>
    );
  }
  
  // ?¸ì¦?˜ì? ?ŠìŒ
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ?¤ë” */}
      <div className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#6b7280] hover:text-[#111827] transition-colors font-['Pretendard:Medium',sans-serif] text-[14px]">
                ???ˆìœ¼ë¡?              </Link>
              <div className="w-[1px] h-[20px] bg-[#e5e7eb]" />
              <h1 className="text-[24px] font-['Pretendard:Bold',sans-serif] text-[#111827]">ê´€ë¦¬ì ?€?œë³´??/h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-[16px] py-[10px] text-[14px] text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-[8px] font-['Pretendard:Medium',sans-serif] transition-all"
            >
              ë¡œê·¸?„ì›ƒ
            </button>
          </div>
        </div>
      </div>

      {/* ???¤ë¹„ê²Œì´??*/}
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
              ?“Š ?€?œë³´??            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'users'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              ?‘¥ ?Œì› ê´€ë¦?            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'products'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              ? ?í’ˆ ê´€ë¦?            </button>
            <button
              onClick={() => setActiveTab('luckydraws')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'luckydraws'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              ?² ??‚¤?œë¡œ??            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'shipping'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              ?“¦ ë°°ì†¡ ê´€ë¦?            </button>
            <button
              onClick={() => setActiveTab('homeproducts')}
              className={`py-[16px] px-[4px] border-b-[3px] font-['Pretendard:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === 'homeproducts'
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-[#d1d5db]'
              }`}
            >
              ?  ??ë©”ì¸ ?í’ˆ
            </button>
          </nav>
        </div>
      </div>

      {/* ??ì»¨í…ì¸?*/}
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
// ?€?œë³´????// ============================================
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
      if (!headers) return; // ?š¨ ?¤ë”ê°€ null?´ë©´ ì¢…ë£Œ
      console.log('?“Š [fetchStats] Calling /admin/stats...');
      const response = await fetch(
        `${apiBase}/admin/stats`,
        {
          method: 'GET',
          headers,
          mode: 'cors',
          cache: 'no-cache',
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        console.error('??[fetchStats] Error:', data);
        alert(`??ê´€ë¦¬ì ê¶Œí•œ???†ìŠµ?ˆë‹¤: ${data.error || response.statusText}`);
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
    return <div className="text-center py-12">ë¡œë”© ì¤?..</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">?„ì²´ ?µê³„</h2>
      
      <div className="flex flex-col gap-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">?‘¥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">?„ì²´ ?Œì› ??/dt>
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
                <span className="text-3xl">?’°</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ì´??¬ì¸??ì¶©ì „??/dt>
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
                <span className="text-3xl">?«</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ë°•ìŠ¤ ?ë§¤ ??/dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats?.totalTicketsSold || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">? ï¸ ê´€ë¦¬ì ?Œë¦¼</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>???í’ˆ ê´€ë¦???—??ë°•ìŠ¤ë³??¹ì²¨ ?í’ˆ??ì¶”ê?/?˜ì •?????ˆìŠµ?ˆë‹¤.</p>
          <p>???Œì› ï¿½ï¿½ï¿½ë¦¬ ??—???¬ì¸?¸ë? ì§ì ‘ ì¶©ì „/ì°¨ê°?????ˆìŠµ?ˆë‹¤.</p>
          <p>????‚¤?œë¡œ????—???´ë²¤?¸ë? ?ì„±?˜ê³  ?¹ì²¨?ë? ? ì •?????ˆìŠµ?ˆë‹¤.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ?Œì› ê´€ë¦???// ============================================
function UsersTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pointAmount, setPointAmount] = useState(100000);
  const [pointDescription, setPointDescription] = useState('ê´€ë¦¬ì ?¬ì¸??ì¶©ì „');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return; // ?š¨ ?¤ë”ê°€ null?´ë©´ ì¢…ë£Œ
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/users`,
        {
          headers,
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Admin API error:', data);
        alert(`??ê´€ë¦¬ì ê¶Œí•œ???†ìŠµ?ˆë‹¤: ${data.error || response.statusText}`);
        return;
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(`???ëŸ¬: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (kakaoId: string) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert(`???±ê³µ! ?„ì¬ ?¬ì¸?? ${data.points.toLocaleString()}P\n\n?’¡ ?? ?±ì—???¬ì¸?¸ê? ??ë³´ì´ë©??¬ì¸???˜ì´ì§€ ?°ì¸¡ ?ë‹¨???ˆë¡œê³ ì¹¨ ë²„íŠ¼(?”„)???ŒëŸ¬ì£¼ì„¸??`);
        fetchUsers(); // ëª©ë¡ ?ˆë¡œê³ ì¹¨
        setSelectedUser(null);
      } else {
        alert(`???¤íŒ¨: ${data.error}`);
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  // ?”¥ ?Œì› ?? œ ?¨ìˆ˜
  const handleDeleteUser = async (kakaoId: string, userName: string) => {
    if (!confirm(`?•ë§ë¡?"${userName}" (ID: ${kakaoId})??ëª¨ë“  ?°ì´?°ë? ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤!`)) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert(`??${userName}??ëª¨ë“  ?°ì´?°ê? ?? œ?˜ì—ˆ?µë‹ˆ??\n\n?’¡ ë¡œê·¸?„ì›ƒ ???¤ì‹œ ë¡œê·¸?¸í•˜ë©???ê³„ì •???ì„±?©ë‹ˆ??`);
        fetchUsers(); // ëª©ë¡ ?ˆë¡œê³ ì¹¨
      } else {
        alert(`???¤íŒ¨: ${data.error}`);
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">ë¡œë”© ì¤?..</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">?Œì› ëª©ë¡ ({users.length}ëª?</h2>
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
                    <span className="text-xs text-gray-400">ì¹´ì¹´??ID: {user.kakaoId}</span>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                      <span>?’° {user.points?.toLocaleString() || 0}P</span>
                      <span>?« ?¹ì²¨ {user.winningTicketsCount || 0}ê°?/span>
                      <span>?“ ê±°ë˜ {user.transactionsCount || 0}ê±?/span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="ml-4 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                    >
                      ?¬ì¸??ì¶©ì „
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.kakaoId, user.userName)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      ?? œ
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ?¬ì¸??ì¶©ì „ ëª¨ë‹¬ */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">?¬ì¸??ì¶©ì „ - {selectedUser.userName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ì¶©ì „ ê¸ˆì•¡</label>
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
                      {(amount / 10000).toFixed(0)}ë§?                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">?¤ëª…</label>
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
                  ì¶©ì „
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                  ?«ê¸°
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
// ?í’ˆ ê´€ë¦???// ============================================
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
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert(`??ê´€ë¦¬ì ê¶Œí•œ???†ìŠµ?ˆë‹¤: ${data.error || response.statusText}`);
        return;
      }
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert(`???ëŸ¬: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert('???? œ?˜ì—ˆ?µë‹ˆ??');
        fetchProducts();
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  // ?“¥ ?‘ì? ?œí”Œë¦??¤ìš´ë¡œë“œ
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'ë°•ìŠ¤?€??: 'diamond',
        '?í’ˆëª?: 'iPhone 15 Pro Max',
        'ë¸Œëœ??: 'Apple',
        '?¬ì¸??: 50000,
        'ê°€ì¤‘ì¹˜': 5,
        '?¬ê³ ': 10,
        '?´ë?ì§€URL': 'https://images.unsplash.com/photo-1632633728024-e1fd4bef561a',
      },
      {
        'ë°•ìŠ¤?€??: 'gold',
        '?í’ˆëª?: 'AirPods Pro',
        'ë¸Œëœ??: 'Apple',
        '?¬ì¸??: 15000,
        'ê°€ì¤‘ì¹˜': 10,
        '?¬ê³ ': 50,
        '?´ë?ì§€URL': 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7',
      },
      {
        'ë°•ìŠ¤?€??: 'ruby',
        '?í’ˆëª?: 'CU ëª¨ë°”???í’ˆê¶?3ë§Œì›',
        'ë¸Œëœ??: 'CU',
        '?¬ì¸??: 10000,
        'ê°€ì¤‘ì¹˜': 15,
        '?¬ê³ ': 100,
        '?´ë?ì§€URL': 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '?í’ˆëª©ë¡');
    
    // ???ˆë¹„ ?¤ì •
    ws['!cols'] = [
      { wch: 12 }, // ë°•ìŠ¤?€??      { wch: 25 }, // ?í’ˆëª?      { wch: 15 }, // ë¸Œëœ??      { wch: 10 }, // ?¬ì¸??      { wch: 10 }, // ê°€ì¤‘ì¹˜
      { wch: 8 },  // ?¬ê³ 
      { wch: 60 }, // ?´ë?ì§€URL
    ];

    XLSX.writeFile(wb, '?í’ˆ?±ë¡_?œí”Œë¦?xlsx');
  };

  // ?“¤ ?‘ì? ?Œì¼ ?…ë¡œ??ë°??¼ê´„ ?±ë¡
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('?“Š ?‘ì? ?°ì´??', jsonData);

      if (jsonData.length === 0) {
        alert('???‘ì? ?Œì¼???°ì´?°ê? ?†ìŠµ?ˆë‹¤.');
        return;
      }

      // ?°ì´??ê²€ì¦?ë°?ë³€??      const productsToAdd: any[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowNum = index + 2; // ?‘ì? ??ë²ˆí˜¸ (?¤ë” ?¬í•¨)
        
        // ?„ìˆ˜ ?„ë“œ ?•ì¸
        if (!row['ë°•ìŠ¤?€??]) {
          errors.push(`${rowNum}?? ë°•ìŠ¤?€?…ì´ ?†ìŠµ?ˆë‹¤.`);
          return;
        }
        if (!row['?í’ˆëª?]) {
          errors.push(`${rowNum}?? ?í’ˆëª…ì´ ?†ìŠµ?ˆë‹¤.`);
          return;
        }
        if (!row['ë¸Œëœ??]) {
          errors.push(`${rowNum}?? ë¸Œëœ?œê? ?†ìŠµ?ˆë‹¤.`);
          return;
        }
        if (!row['?´ë?ì§€URL']) {
          errors.push(`${rowNum}?? ?´ë?ì§€URL???†ìŠµ?ˆë‹¤.`);
          return;
        }

        // ?°ì¼“ ?€??ê²€ì¦?        const ticketType = String(row['ë°•ìŠ¤?€??]).toLowerCase();
        const validTicketTypes = ['diamond', 'gold', 'platinum', 'ruby'];
        if (!validTicketTypes.includes(ticketType)) {
          errors.push(`${rowNum}?? ?˜ëª»??ë°•ìŠ¤?€??(${row['ë°•ìŠ¤?€??]}). ê°€?¥í•œ ê°? ${validTicketTypes.join(', ')}`);
          return;
        }

        productsToAdd.push({
          ticketType,
          name: String(row['?í’ˆëª?]),
          brand: String(row['ë¸Œëœ??]),
          points: Number(row['?¬ì¸??]) || 1000,
          probability: Number(row['ê°€ì¤‘ì¹˜']) || 5,
          stock: Number(row['?¬ê³ ']) || 999,
          imageUrl: String(row['?´ë?ì§€URL']),
        });
      });

      if (errors.length > 0) {
        alert(`???°ì´??ê²€ì¦??¤íŒ¨:\n\n${errors.join('\n')}`);
        setUploading(false);
        return;
      }

      if (productsToAdd.length === 0) {
        alert('???±ë¡???í’ˆ???†ìŠµ?ˆë‹¤.');
        setUploading(false);
        return;
      }

      // ?¼ê´„ ?±ë¡ ?•ì¸
      if (!confirm(`ì´?${productsToAdd.length}ê°œì˜ ?í’ˆ???±ë¡?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
        setUploading(false);
        return;
      }

      // ë°±ì—”??API ?¸ì¶œ (ê°??í’ˆë³„ë¡œ ?±ë¡)
      let successCount = 0;
      let failCount = 0;
      const failedProducts: string[] = [];

      for (const product of productsToAdd) {
        try {
          const headers = getAuthHeaders();
          if (!headers) {
            alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
          failedProducts.push(`${product.name} (?¤íŠ¸?Œí¬ ?ëŸ¬)`);
        }
      }

      // ê²°ê³¼ ?Œë¦¼
      let message = `???±ë¡ ?„ë£Œ!\n\n?±ê³µ: ${successCount}ê°?n?¤íŒ¨: ${failCount}ê°?;
      if (failedProducts.length > 0) {
        message += `\n\n?¤íŒ¨???í’ˆ:\n${failedProducts.join('\n')}`;
      }
      alert(message);

      // ëª©ë¡ ?ˆë¡œê³ ì¹¨
      fetchProducts();

      // ?Œì¼ ?…ë ¥ ì´ˆê¸°??      e.target.value = '';
    } catch (error) {
      alert(`???‘ì? ?Œì¼ ì²˜ë¦¬ ì¤??¤ë¥˜: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">?í’ˆ ê´€ë¦?/h2>
        <div className="flex gap-2">
          {/* ?‘ì? ?œí”Œë¦??¤ìš´ë¡œë“œ ë²„íŠ¼ */}
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
          >
            ?“¥ ?œí”Œë¦??¤ìš´ë¡œë“œ
          </button>
          
          {/* ?‘ì? ?…ë¡œ??ë²„íŠ¼ */}
          <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer flex items-center gap-2">
            {uploading ? '?…ë¡œ??ì¤?..' : '?“¤ ?‘ì? ?¼ê´„?±ë¡'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* ê°œë³„ ?í’ˆ ì¶”ê? ë²„íŠ¼ */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            + ?í’ˆ ì¶”ê?
          </button>
        </div>
      </div>

      {/* ?‘ì? ?…ë¡œ???ˆë‚´ */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">?’¡ ?‘ì? ?¼ê´„ ?±ë¡ ?¬ìš© ë°©ë²•</h3>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li><strong>?œí”Œë¦??¤ìš´ë¡œë“œ</strong> ë²„íŠ¼???´ë¦­?˜ì—¬ ?‘ì? ?œí”Œë¦¿ì„ ?¤ìš´ë¡œë“œ?©ë‹ˆ??</li>
          <li>?œí”Œë¦¿ì— ?í’ˆ ?•ë³´ë¥??…ë ¥?©ë‹ˆ?? (ë°•ìŠ¤?€?? ?í’ˆëª? ë¸Œëœ?? ?¬ì¸?? ê°€ì¤‘ì¹˜, ?¬ê³ , ?´ë?ì§€URL)</li>
          <li><strong>?‘ì? ?¼ê´„?±ë¡</strong> ë²„íŠ¼???´ë¦­?˜ì—¬ ?‘ì„±???Œì¼???…ë¡œ?œí•©?ˆë‹¤.</li>
          <li>ê²€ì¦????¼ê´„ ?±ë¡?©ë‹ˆ??</li>
        </ol>
        <p className="text-xs text-blue-600 mt-2">
          ? ï¸ ë°•ìŠ¤?€?? diamond, gold, platinum, ruby ì¤??˜ë‚˜?¬ì•¼ ?©ë‹ˆ??
        </p>
      </div>

      {/* ë°•ìŠ¤ ?€??? íƒ */}
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

      {/* ?í’ˆ ëª©ë¡ */}
      {loading ? (
        <div className="text-center py-12">ë¡œë”© ì¤?..</div>
      ) : products.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">?“¦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">?±ë¡???í’ˆ???†ìŠµ?ˆë‹¤</h3>
          <p className="text-sm text-gray-500 mb-6">
            {TICKET_TYPE_NAMES[selectedTicketType]}???¹ì²¨ ê°€?¥í•œ ?í’ˆ??ì¶”ê??´ì£¼?¸ìš”.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            ì²??í’ˆ ?±ë¡?˜ê¸°
          </button>
        </div>
      ) : (
        <>
          {/* ?“Š ê°€ì¤‘ì¹˜ ?”ì•½ */}
          {(() => {
            const activeProducts = products.filter(p => p.isActive);
            const totalWeight = activeProducts.reduce((sum, p) => sum + p.probability, 0);
            return activeProducts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">?“Š ?„ì¬ ê°€ì¤‘ì¹˜ ?¤ì •</h3>
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">
                    ???„ì²´ ê°€ì¤‘ì¹˜ ?©ê³„: <strong>{totalWeight}</strong>
                  </p>
                  {activeProducts.map((p) => (
                    <p key={p.id} className="text-xs text-blue-600">
                      ??{p.name}: {p.probability} ({((p.probability / totalWeight) * 100).toFixed(2)}%)
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
                          <span>?’° {product.points.toLocaleString()}P</span>
                          <span>?–ï¸ ê°€ì¤‘ì¹˜ {product.probability}</span>
                          <span>?“¦ ?¬ê³  {product.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        ?˜ì •
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        ?? œ
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

      {/* ì¶”ê?/?˜ì • ëª¨ë‹¬ */}
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

// ?í’ˆ ì¶”ê?/?˜ì • ëª¨ë‹¬
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
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
        return;
      }
      
      console.log('?” [ProductModal] product:', product);
      console.log('?” [ProductModal] product.id:', product?.id);
      console.log('?” [ProductModal] ticketType:', ticketType);
      
      const url = product
        ? `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${ticketType}/${product.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/admin/products/${ticketType}`;

      console.log('?” [ProductModal] Request URL:', url);
      console.log('?” [ProductModal] Request method:', product ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('?” [ProductModal] Response:', data);

      if (data.success) {
        alert(`??${product ? '?˜ì •' : 'ì¶”ê?'}?˜ì—ˆ?µë‹ˆ??`);
        onSuccess();
        onClose();
      } else {
        alert(`???¤íŒ¨: ${data.error}`);
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
        <h3 className="text-lg font-bold mb-4">
          {product ? '?í’ˆ ?˜ì •' : '?í’ˆ ì¶”ê?'} - {TICKET_TYPE_NAMES[ticketType]}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">?í’ˆëª?/label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ë¸Œëœ??/label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">?´ë?ì§€ URL</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">?¬ì¸??/label>
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
                ê°€ì¤‘ì¹˜ (?ë????¹ì²¨ ?•ë¥ )
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
                ?’¡ ?„ì²´ ?©ê³„ê°€ 100???„ìš” ?†ìŠµ?ˆë‹¤. ?? 3, 2, 5 ?…ë ¥ ????30%, 20%, 50% ?•ë¥ 
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">?¬ê³ </label>
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
              {product ? '?˜ì •' : 'ì¶”ê?'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              ?«ê¸°
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// ??‚¤?œë¡œ????// ============================================
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
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert(`??ê´€ë¦¬ì ê¶Œí•œ???†ìŠµ?ˆë‹¤: ${data.error || response.statusText}`);
        return;
      }
      
      setLuckyDraws(data.luckyDraws || []);
    } catch (error) {
      console.error('Error fetching lucky draws:', error);
      alert(`???ëŸ¬: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinner = async (luckyDrawId: string) => {
    if (!confirm('?¹ì²¨?ë? ì¶”ì²¨?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert(`?‰ ?¹ì²¨?? ${data.winner.userName} (ì´?${data.totalParticipants}ëª?ì°¸ì—¬)`);
        fetchLuckyDraws();
      } else {
        alert(`???¤íŒ¨: ${data.error}`);
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">ë¡œë”© ì¤?..</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">??‚¤?œë¡œ??ê´€ë¦?/h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          + ??‚¤?œë¡œ??ì¶”ê?
        </button>
      </div>

      {luckyDraws.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">?²</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">?±ë¡????‚¤?œë¡œ?°ê? ?†ìŠµ?ˆë‹¤</h3>
          <p className="text-sm text-gray-500 mb-6">
            ?ˆë¡œ????‚¤?œë¡œ???´ë²¤?¸ë? ì¶”ê??˜ì—¬ ?¬ìš©?ë“¤?ê²Œ ?‘ëª¨ ê¸°íšŒë¥??œê³µ?˜ì„¸??
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            ì²???‚¤?œë¡œ??ì¶”ê??˜ê¸°
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
                  <p className="text-sm text-gray-500">ì°¸ì—¬: {draw.entryPoints.toLocaleString()}P</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDrawWinner(draw.id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                >
                  ?² ì¶”ì²¨?˜ê¸°
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

// ??‚¤?œë¡œ??ì¶”ê? ëª¨ë‹¬
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
        alert('???¸ì¦ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??');
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
        alert('????‚¤?œë¡œ?°ê? ì¶”ê??˜ì—ˆ?µë‹ˆ??');
        onSuccess();
        onClose();
      } else {
        alert(`???¤íŒ¨: ${data.error}`);
      }
    } catch (error) {
      alert(`???ëŸ¬: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">??‚¤?œë¡œ??ì¶”ê?</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">?í’ˆëª?/label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ë¸Œëœ??/label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">?´ë?ì§€ URL</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ì°¸ì—¬ ?¬ì¸??/label>
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
              ì¶”ê?
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              ?«ê¸°
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
