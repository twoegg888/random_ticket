import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 간단한 비밀번호 체크 (환경에 따라 변경 가능)
    const ADMIN_PASSWORD = 'dleogus23@';
    
    if (password === ADMIN_PASSWORD) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [AdminLogin] Password correct!');
      console.log('   Saving to sessionStorage...');
      
      // 세션 스토리지에 관리자 인증 정보 저장
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      // 🔐 백엔드 API 호출용 관리자 시크릿 저장
      sessionStorage.setItem('admin_secret', ADMIN_PASSWORD);
      
      console.log('   ✅ admin_authenticated:', sessionStorage.getItem('admin_authenticated'));
      console.log('   ✅ admin_login_time:', sessionStorage.getItem('admin_login_time'));
      console.log('   ✅ admin_secret:', sessionStorage.getItem('admin_secret') ? 'SAVED' : 'NOT SAVED!');
      console.log('   sessionStorage keys:', Object.keys(sessionStorage));
      console.log('   Redirecting to /admin...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      navigate('/admin');
    } else {
      setError('잘못된 비밀번호입니다');
      setPassword('');
    }
  };

  return (
    <div className="bg-white relative w-[480px] mx-auto min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">관리자 로그인</h1>
          <p className="text-gray-600">관리자 페이지 접근 권한이 필요합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="관리자 비밀번호를 입력하세요"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 현재 비밀번호: <code className="bg-white px-2 py-1 rounded text-red-600 font-mono">dleogus23@</code>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-black"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}