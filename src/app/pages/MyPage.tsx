import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { projectId } from '../../../utils/supabase/info';
import { TICKET_GRADES } from '../types';

type TabType = 'profile' | 'transactions' | 'tickets' | 'exchange' | 'luckydraw';

export default function MyPage() {
  const navigate = useNavigate();
  const { userData, isLoggedIn, logout, kakaoAccessToken } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [nightMarketingAgree, setNightMarketingAgree] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // 로그인 체크
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        navigate('/login');
      } else {
        setName(userData.userName || "");
        setEmail(userData.email || "");
        setShouldRender(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate, userData]);

  const handleSave = () => {
    // 나중에 API 연결 시 저장 로직 구현
    console.log("저장:", { name, email, phone, marketingAgree, nightMarketingAgree });
  };

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) {
      return;
    }

    try {
      if (kakaoAccessToken) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/auth/logout`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${kakaoAccessToken}`,
            },
          }
        );

        console.log('로그아웃 응답:', response.ok);
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      // 카카오 API 호출 성공 여부와 관계없이 로컬에서는 로그아웃
      logout();
      navigate('/login');
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('정말로 회원탈퇴 하시겠습니까?\n모든 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      // 로컬 데이터 초기화
      logout();
      localStorage.clear();
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error('회원탈퇴 에러:', error);
      alert('회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  if (!isLoggedIn || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 포인트 포맷팅
  const formatPoints = (points: number) => points.toLocaleString('ko-KR');
  
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white relative w-full max-w-[480px] mx-auto min-h-screen pb-[64px]">
      {/* 헤더 */}
      <div className="absolute bg-white h-[56px] left-0 top-0 right-0 flex items-center px-[24px] border-b border-[#eaeaea] z-20">
        <Link to="/" className="mr-auto">
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="font-['Noto_Sans_KR:Bold',sans-serif] text-[20px] text-black">마이페이지</h1>
        </div>
        <div className="w-[24px]" /> {/* 공간 확보용 */}
      </div>

      {/* 포인트 카드 */}
      <div className="pt-[72px] px-[24px] pb-[16px]">
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-[16px] p-[24px] text-white">
          <div className="flex items-center mb-[8px]">
            {userData.profileImage && (
              <img 
                src={userData.profileImage} 
                alt="프로필" 
                className="w-[48px] h-[48px] rounded-full mr-[12px]"
              />
            )}
            <div>
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[16px]">{userData.userName}</p>
              <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-gray-300">{userData.email}</p>
            </div>
          </div>
          <div className="mt-[16px] pt-[16px] border-t border-gray-600">
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-gray-300 mb-[4px]">보유 포인트</p>
            <p className="font-['Noto_Sans_KR:Bold',sans-serif] text-[32px]">{formatPoints(userData.points)}P</p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="sticky top-[56px] bg-white z-10 border-b border-[#eaeaea] px-[24px]">
        <div className="flex gap-[8px]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-[12px] font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] border-b-2 transition-colors ${
              activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-400'
            }`}
          >
            내 정보
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-[12px] font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] border-b-2 transition-colors ${
              activeTab === 'transactions' ? 'border-black text-black' : 'border-transparent text-gray-400'
            }`}
          >
            포인트 내역
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-[12px] font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] border-b-2 transition-colors ${
              activeTab === 'tickets' ? 'border-black text-black' : 'border-transparent text-gray-400'
            }`}
          >
            당첨 티켓
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="pt-[16px] px-[24px] pb-[100px]">
        {/* 내 정보 탭 */}
        {activeTab === 'profile' && (
          <div>

            {/* 이름 */}
            <div className="mb-[24px]">
              <label className="block mb-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[48px] px-[16px] border border-[#eaeaea] rounded-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black focus:outline-none focus:border-[#666]"
              />
            </div>

            {/* 이메일 */}
            <div className="mb-[24px]">
              <label className="block mb-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[48px] px-[16px] border border-[#eaeaea] rounded-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black focus:outline-none focus:border-[#666] bg-gray-100"
                readOnly
              />
            </div>

            {/* 휴대폰 */}
            <div className="mb-[24px]">
              <label className="block mb-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black">
                휴대폰
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="휴대폰 번호를 입력하세요"
                className="w-full h-[48px] px-[16px] border border-[#eaeaea] rounded-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black focus:outline-none focus:border-[#666]"
              />
            </div>

            {/* 마케팅 정보 수신 동의 */}
            <div className="mb-[12px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingAgree}
                  onChange={(e) => setMarketingAgree(e.target.checked)}
                  className="w-[20px] h-[20px] mr-[8px] accent-black cursor-pointer"
                />
                <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black">
                  마케팅 정보 수신 동의
                </span>
              </label>
            </div>

            {/* 마케팅 메시지 야간 수신 동의 */}
            <div className="mb-[32px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nightMarketingAgree}
                  onChange={(e) => setNightMarketingAgree(e.target.checked)}
                  className="w-[20px] h-[20px] mr-[8px] accent-black cursor-pointer"
                />
                <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black">
                  마케팅 메시지 야간 수신 동의 (21:00~08:00)
                </span>
              </label>
            </div>

            {/* 로그아웃 / 회원탈퇴 */}
            <div className="flex gap-[24px] mb-[48px]">
              <button 
                onClick={handleLogout}
                className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#666] underline"
              >
                로그아웃
              </button>
              <button 
                onClick={handleWithdraw}
                className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#666] underline"
              >
                회원탈퇴
              </button>
            </div>
          </div>
        )}

        {/* 포인트 내역 탭 */}
        {activeTab === 'transactions' && (
          <div>
            {userData.transactions.length === 0 ? (
              <div className="py-[80px] text-center">
                <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-400">포인트 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-[12px]">
                {userData.transactions.map((tx) => (
                  <div key={tx.id} className="bg-gray-50 rounded-[12px] p-[16px]">
                    <div className="flex justify-between items-start mb-[8px]">
                      <div className="flex-1">
                        <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] text-black mb-[4px]">
                          {tx.description}
                        </p>
                        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-gray-500">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <p className={`font-['Noto_Sans_KR:Bold',sans-serif] text-[16px] ${
                        tx.amount > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{formatPoints(tx.amount)}P
                      </p>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className="inline-block px-[8px] py-[2px] bg-white rounded-[4px] font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] text-gray-600">
                        {tx.type === 'charge' && '충전'}
                        {tx.type === 'ticket_purchase' && '티켓구매'}
                        {tx.type === 'ticket_convert' && '포인트전환'}
                        {tx.type === 'exchange_sell' && '거래소판매'}
                        {tx.type === 'exchange_buy' && '거래소구매'}
                        {tx.type === 'lucky_draw' && '럭키드로우'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 당첨 티켓 탭 */}
        {activeTab === 'tickets' && (
          <div>
            {userData.winningTickets.length === 0 ? (
              <div className="py-[80px] text-center">
                <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-400">당첨된 티켓이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-[12px]">
                {userData.winningTickets.map((ticket) => {
                  const ticketGrade = TICKET_GRADES[ticket.ticketType];
                  return (
                    <div key={ticket.id} className="bg-gray-50 rounded-[12px] p-[16px]">
                      <div className="flex gap-[12px]">
                        <img 
                          src={ticket.productImage} 
                          alt={ticket.productName}
                          className="w-[80px] h-[80px] rounded-[8px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-[8px] mb-[4px]">
                            <span 
                              className="inline-block px-[8px] py-[2px] rounded-[4px] font-['Noto_Sans_KR:Bold',sans-serif] text-[11px] text-white"
                              style={{ backgroundColor: ticketGrade.color }}
                            >
                              {ticketGrade.name}
                            </span>
                            <span className={`inline-block px-[8px] py-[2px] rounded-[4px] font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] ${
                              ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                              ticket.status === 'converted' ? 'bg-blue-100 text-blue-700' :
                              ticket.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {ticket.status === 'active' && '사용가능'}
                              {ticket.status === 'converted' && '포인트전환'}
                              {ticket.status === 'shipped' && '배송요청'}
                              {ticket.status === 'delivered' && '배송완료'}
                              {ticket.status === 'exchanged' && '거래소등록'}
                            </span>
                          </div>
                          <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] text-black mb-[2px]">
                            {ticket.productBrand}
                          </p>
                          <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-gray-600 mb-[4px]">
                            {ticket.productName}
                          </p>
                          <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-gray-500">
                            {formatDate(ticket.wonAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 bg-white h-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#eaeaea] flex items-center justify-around z-50">
        <Link to="/" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px] mb-[4px]" fill="none" viewBox="0 0 24 24">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#DDDDDD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#aeaeae]">홈</span>
        </Link>

        <Link to="/winning-tickets" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px] mb-[4px]" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="8" width="18" height="12" rx="2" stroke="#DDDDDD" strokeWidth="2"/>
            <path d="M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="#DDDDDD" strokeWidth="2"/>
          </svg>
          <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae]">당첨 티켓</span>
        </Link>

        <Link to="/exchange" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px] mb-[4px]" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke="#DDDDDD" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae]">거래소</span>
        </Link>

        <Link to="/points" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px] mb-[4px]" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke="#DDDDDD" strokeWidth="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae]">포인트 충전</span>
        </Link>

        <Link to="/lucky-draw" className="flex flex-col items-center justify-center flex-1">
          <svg className="w-[24px] h-[24px] mb-[4px]" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke="#DDDDDD" strokeWidth="2"/>
            <path d="M12 6L14 10H18L15 13L16 17L12 14L8 17L9 13L6 10H10L12 6Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[9.375px] text-[#aeaeae]">럭키드로우</span>
        </Link>
      </div>
    </div>
  );
}