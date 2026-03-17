import { useState } from "react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 간단한 비밀번호 검증 (프로덕션에서는 환경변수로 관리)
      const ADMIN_PASSWORD = "dleogus23@";
      
      console.log("입력한 비밀번호:", password);
      console.log("정답 비밀번호:", ADMIN_PASSWORD);
      console.log("일치 여부:", password === ADMIN_PASSWORD);
      
      if (password === ADMIN_PASSWORD) {
        // 세션 저장 (24시간 유효)
        const session = {
          isAdmin: true,
          timestamp: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
        };
        localStorage.setItem("admin_session", JSON.stringify(session));
        onSuccess();
      } else {
        setError("❌ 잘못된 비밀번호입니다.");
      }
    } catch (err) {
      setError("❌ 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h1>
          <p className="text-sm text-gray-500">관리자 비밀번호를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="비밀번호 입력"
              required
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
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-medium transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 현재 비밀번호: <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">dleogus23@</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// 관리자 세션 검증 유틸리티
export function checkAdminSession(): boolean {
  const sessionStr = localStorage.getItem("admin_session");
  if (!sessionStr) return false;

  try {
    const session = JSON.parse(sessionStr);
    const now = Date.now();

    // 만료 확인
    if (now > session.expiresAt) {
      localStorage.removeItem("admin_session");
      return false;
    }

    return session.isAdmin === true;
  } catch {
    return false;
  }
}

// 관리자 로그아웃
export function adminLogout() {
  localStorage.removeItem("admin_session");
}
