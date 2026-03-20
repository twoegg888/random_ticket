import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiBase, publicAnonKey } from '../../../utils/supabase/info';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const login = async () => {
      try {
        const response = await fetch(
          `${apiBase}/admin/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ password }),
          },
        );

        const result = await response.json();
        if (!response.ok || !result.success || !result.token) {
          throw new Error(result.error || '관리자 로그인에 실패했습니다');
        }

        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_login_time', Date.now().toString());
        sessionStorage.setItem('admin_expires_at', String(Date.now() + (result.expiresInMs || 0)));
        sessionStorage.setItem('admin_secret', result.token);
        navigate('/admin');
      } catch (error) {
        setError(error instanceof Error ? error.message : '관리자 로그인에 실패했습니다');
        setPassword('');
      }
    };

    login();
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
