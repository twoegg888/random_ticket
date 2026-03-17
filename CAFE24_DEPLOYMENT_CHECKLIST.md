# 카페24 배포 체크리스트 ✅

> 하이브리드 방식 (프론트엔드만 카페24로 이전)

---

## 📋 사전 준비 체크리스트

### 1️⃣ 카페24 호스팅 준비
```
□ 카페24 호스팅 가입 완료
  - 추천: 스탠다드 이상 요금제
  - URL: https://www.cafe24.com

□ 호스팅 정보 확인
  - FTP 호스트: ftp.your-id.cafe24.com
  - FTP 계정: your-id
  - FTP 비밀번호: ********
  - 도메인: your-id.cafe24.com (또는 연결한 도메인)

□ SSL 인증서 설치 완료 (무료 Let's Encrypt)
  - 카페24 관리자 → 호스팅 관리 → SSL 인증서
```

### 2️⃣ Supabase 준비
```
□ Supabase 프로젝트 정보 확인
  - Project ID: _______________
  - Anon Key: _______________
  - 현재 URL: https://___.supabase.co

□ CORS 설정 준비
  - 배포할 카페24 도메인 확인
  - https://your-id.cafe24.com
```

### 3️⃣ 외부 API 준비
```
□ 카카오 개발자 계정 접근 가능
  - https://developers.kakao.com
  - REST API Key: f1f1ee7feb6098a7bc74cd41e7d787cc

□ 토스페이먼츠 계정 접근 가능
  - https://developers.tosspayments.com
  - Client Key 확인
```

---

## 🚀 단계별 배포 가이드

### Step 1: 프로젝트 빌드 (10분)

#### 1-1. 빌드 실행
```bash
# Figma Make 환경에서는 이미 빌드된 상태
# 로컬이라면:
npm run build
```

#### 1-2. 빌드 결과 확인
```bash
# dist/ 폴더 구조 확인
ls dist/

# 예상 결과:
# index.html
# assets/
#   - index-abc123.js
#   - index-def456.css
#   - ... (이미지 파일들)
```

#### 1-3. 빌드 파일 다운로드
```
Figma Make에서:
1. 우측 상단 "Export" 버튼 클릭
2. "Download Build Files" 선택
3. dist.zip 다운로드
4. 압축 해제
```

---

### Step 2: 카페24 FTP 업로드 (30분)

#### 2-1. FTP 클라이언트 설치
```
추천: FileZilla
- Windows: https://filezilla-project.org/download.php?type=client
- Mac: Homebrew로 설치 또는 직접 다운로드

또는 카페24 웹FTP 사용:
- 카페24 관리자 → 호스팅 관리 → 웹FTP
```

#### 2-2. FTP 연결
```
호스트: ftp.your-id.cafe24.com
포트: 21
프로토콜: FTP
암호화: 명시적 FTP over TLS 사용 (권장)
사용자명: your-id
비밀번호: your-password
```

#### 2-3. 파일 업로드
```
중요! 업로드 위치: /www/

업로드할 파일:
□ index.html → /www/index.html
□ assets/ 폴더 전체 → /www/assets/
□ 기타 모든 파일 → /www/

❌ 주의: 루트(/)가 아닌 /www/ 에 업로드!
```

#### 2-4. .htaccess 파일 생성
```
파일 경로: /www/.htaccess

내용:
```

---

### Step 3: .htaccess 파일 생성 (5분)

FTP로 `/www/.htaccess` 파일을 만들고 다음 내용을 붙여넣으세요:

```apache
# SPA 라우팅 지원
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # index.html 자체는 리다이렉트 안 함
  RewriteRule ^index\.html$ - [L]
  
  # 실제 파일/폴더가 아니면 index.html로
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# HTTPS 강제 리다이렉트 (SSL 있는 경우)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Gzip 압축 활성화 (성능 향상)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 브라우저 캐싱 설정
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### Step 4: Supabase CORS 설정 (5분)

#### 4-1. Supabase 대시보드 접속
```
1. https://supabase.com 로그인
2. 프로젝트 선택
3. Settings → API
```

#### 4-2. CORS 도메인 추가
```
"Additional Allowed Origins" 섹션에 추가:

https://your-id.cafe24.com
https://www.your-id.cafe24.com (www 있는 경우)

※ 주의: http:// 가 아닌 https:// 로 입력!
```

#### 4-3. 저장
```
"Save" 버튼 클릭
1~2분 후 적용됨
```

---

### Step 5: 카카오 개발자 설정 (10분)

#### 5-1. 카카오 개발자 콘솔 접속
```
1. https://developers.kakao.com
2. 내 애플리케이션
3. 현재 사용 중인 앱 선택
```

#### 5-2. 플랫폼 설정
```
1. 좌측 메뉴 → 플랫폼
2. "Web 플랫폼 추가" (또는 수정)
3. 사이트 도메인:
   https://your-id.cafe24.com
4. 저장
```

#### 5-3. Redirect URI 설정
```
1. 좌측 메뉴 → 카카오 로그인
2. Redirect URI 등록
3. 추가:
   https://your-id.cafe24.com/login/callback
4. 저장

※ 기존 localhost URI는 유지 (개발용)
```

---

### Step 6: 토스페이먼츠 설정 (10분)

#### 6-1. 토스페이먼츠 개발자센터 접속
```
1. https://developers.tosspayments.com
2. 로그인
3. 내 개발 정보
```

#### 6-2. 결제 URL 설정
```
결제 성공 URL:
https://your-id.cafe24.com/payment/success

결제 실패 URL:
https://your-id.cafe24.com/payment/fail

※ 기존 localhost URL은 유지 (개발용)
```

---

### Step 7: 첫 테스트 (10분)

#### 7-1. 브라우저에서 접속
```
https://your-id.cafe24.com

예상 결과:
✅ 홈 화면이 정상적으로 보임
✅ 디자인이 깨지지 않음
✅ 이미지가 모두 로드됨
```

#### 7-2. 개발자 도구로 에러 체크
```
F12 → Console 탭

예상 에러:
❌ CORS 에러 → Step 4 다시 확인
❌ 404 에러 → .htaccess 확인
❌ 이미지 로딩 실패 → FTP 업로드 확인
```

#### 7-3. 기본 네비게이션 테스트
```
□ 홈 화면 로드
□ 상품 카드 클릭 → 티켓 상세 페이지
□ 하단 네비게이션 클릭
□ 브라우저 뒤로가기/앞으로가기
```

---

### Step 8: 전체 기능 테스트 (60분)

#### 8-1. 카카오 로그인 테스트
```
□ "카카오로 시작하기" 버튼 클릭
□ 카카오 로그인 페이지로 이동
□ 로그인 후 콜백 페이지로 리다이렉트
□ 홈 화면으로 정상 이동
□ 포인트가 표시됨
□ 프로필 정보 확인

❌ 실패 시:
- 카카오 개발자 콘솔 → Redirect URI 확인
- 브라우저 Console 에러 확인
```

#### 8-2. 포인트 충전 테스트
```
□ 마이페이지 → 포인트 충전
□ 금액 선택
□ 토스 결제창 뜸
□ 테스트 카드 정보 입력
□ 결제 성공 페이지로 이동
□ 포인트 증가 확인

※ 테스트 카드 번호:
- 카드번호: 아무거나 (16자리)
- 유효기간: 미래 날짜
- CVC: 아무거나 (3자리)

❌ 실패 시:
- 토스페이먼츠 설정 → Success URL 확인
- 브라우저 Network 탭에서 API 호출 확인
```

#### 8-3. 티켓 구매 테스트
```
□ 홈 화면에서 상품 카드 클릭
□ 티켓 상세 페이지 로드
□ "구매하기" 버튼 클릭
□ 포인트 차감 확인
□ 애니메이션 재생
□ 당첨 결과 표시
□ 당첨 티켓 목록에 추가 (당첨 시)

❌ 실패 시:
- 브라우저 Console에서 API 에러 확인
- Supabase Dashboard → Logs 확인
```

#### 8-4. 당첨 티켓 관리 테스트
```
□ 하단 네비 → 당첨 티켓
□ 당첨 목록 표시
□ 티켓 클릭 → 상세 보기
□ "배송 요청" 버튼 클릭
□ 주소 입력 폼
□ 제출 완료
□ 상태가 "배송 요청됨"으로 변경
```

#### 8-5. 관리자 페이지 테스트
```
□ /admin-login 접속
□ 비밀번호 입력 (dleogus23@)
□ 관리자 페이지 로드
□ 각 탭 클릭해보기
  - 홈 메인 상품
  - 상품 관리
  - 회원 관리
  - 배송 관리
  - 럭키드로우
  - 통계

❌ 실패 시:
- LocalStorage에 admin_secret 확인
- 브라우저 Console에서 X-Admin-Secret 헤더 확인
```

#### 8-6. 모바일 테스트
```
□ 브라우저 개발자도구 → 디바이스 모드
□ 테스트할 화면 크기:
  - 320px (iPhone SE)
  - 375px (iPhone 12)
  - 414px (iPhone 12 Pro Max)
  - 768px (iPad)
□ 모든 화면에서 정상 작동 확인
□ 하단 네비게이션 정상 작동
```

---

## 🐛 문제 해결 가이드

### 문제 1: "페이지를 찾을 수 없습니다" (404)
```
원인: .htaccess 미설정 또는 오류

해결:
1. FTP로 /www/.htaccess 파일 존재 확인
2. 파일 내용이 올바른지 확인
3. 카페24 관리자 → 호스팅 설정 → .htaccess 활성화 확인
4. 브라우저 캐시 삭제 후 재시도
```

### 문제 2: "CORS policy" 에러
```
증상:
Access to fetch at 'https://xxx.supabase.co' from origin 
'https://your-id.cafe24.com' has been blocked by CORS policy

해결:
1. Supabase Dashboard → Settings → API
2. "Additional Allowed Origins"에 도메인 추가
3. https:// 프로토콜 확인 (http 아님!)
4. 1~2분 대기 후 재시도
5. 브라우저 캐시 삭제
```

### 문제 3: 카카오 로그인 "redirect_uri mismatch"
```
증상:
KOE006: redirect_uri mismatch. 
redirect_uri을 확인해주세요.

해결:
1. 카카오 개발자 콘솔 → Redirect URI 확인
2. 정확히 일치해야 함:
   ✅ https://your-id.cafe24.com/login/callback
   ❌ https://your-id.cafe24.com/login/callback/
   (마지막 슬래시 주의!)
3. http vs https 확인
4. www 있음/없음 확인
```

### 문제 4: 이미지가 안 보임
```
증상:
이미지 영역이 비어있거나 깨진 이미지 아이콘

해결:
1. FTP에서 /www/assets/ 폴더 확인
2. 이미지 파일들이 모두 업로드되었는지 확인
3. 파일 권한 확인 (644)
4. 브라우저 개발자도구 → Network 탭
   - 어떤 이미지가 404인지 확인
5. 해당 이미지 파일 재업로드
```

### 문제 5: 포인트 충전 실패
```
증상:
결제는 되는데 포인트가 안 들어옴

해결:
1. 토스페이먼츠 Success URL 확인
2. Supabase Functions 로그 확인
   - Supabase Dashboard → Functions → Logs
3. 결제 승인 API 에러 확인
4. TOSS_SECRET_KEY 환경변수 확인
```

### 문제 6: 관리자 페이지 401 Unauthorized
```
증상:
관리자 로그인은 되는데 API 호출 시 401 에러

해결:
1. 브라우저 개발자도구 → Application → LocalStorage
2. admin_secret 값이 저장되어 있는지 확인
3. 값이 "dleogus23@"와 정확히 일치하는지 확인
4. 브라우저 개발자도구 → Network 탭
5. API 요청 헤더에 X-Admin-Secret 있는지 확인
6. 없다면 로그아웃 후 재로그인
```

### 문제 7: 화면이 깨져보임 (반응형)
```
증상:
모바일에서 좌우 스크롤 생김 또는 요소가 잘림

해결:
1. 브라우저 개발자도구로 화면 크기 확인
2. 480px 미만 화면에서 테스트
3. 최신 코드로 다시 빌드
   (responsive-summary.md의 수정사항 반영)
4. 캐시 삭제 후 재시도
```

---

## ✅ 최종 체크리스트

### 배포 완료 확인
```
□ https://your-id.cafe24.com 접속 가능
□ SSL 인증서 정상 (자물쇠 아이콘)
□ 모든 페이지 접근 가능
□ 카카오 로그인 정상 작동
□ 포인트 충전 정상 작동
□ 티켓 구매/뽑기 정상 작동
□ 당첨 티켓 관리 정상 작동
□ 거래소 정상 작동
□ 럭키드로우 정상 작동
□ 관리자 페이지 정상 작동
□ 모바일 반응형 정상 작동
□ 이미지 모두 로드됨
□ 콘솔 에러 없음
```

### 성능 확인
```
□ 첫 페이지 로딩 3초 이내
□ 페이지 전환 부드러움
□ 애니메이션 끊김 없음
□ 이미지 로딩 빠름
```

### 보안 확인
```
□ HTTPS 강제 리다이렉트 작동
□ Secret Key가 프론트엔드에 노출 안 됨
□ 관리자 페이지 인증 작동
□ API 호출에 권한 검증 있음
```

---

## 📊 예상 소요 시간

| 단계 | 작업 | 소요 시간 | 난이도 |
|------|------|-----------|--------|
| 1 | 빌드 | 10분 | ⭐ 쉬움 |
| 2 | FTP 업로드 | 30분 | ⭐⭐ 보통 |
| 3 | .htaccess 생성 | 5분 | ⭐ 쉬움 |
| 4 | Supabase CORS | 5분 | ⭐ 쉬움 |
| 5 | 카카오 설정 | 10분 | ⭐⭐ 보통 |
| 6 | 토스 설정 | 10분 | ⭐⭐ 보통 |
| 7 | 첫 테스트 | 10분 | ⭐ 쉬움 |
| 8 | 전체 테스트 | 60분 | ⭐⭐⭐ 복잡 |
| 디버깅 | 문제 해결 | 30분 | ⭐⭐ 보통 |

**총 예상 시간: 2.5~3시간**  
(문제 없으면 2시간, 문제 생기면 3~4시간)

---

## 💡 프로 팁

### Tip 1: FTP 업로드 속도 높이기
```
FileZilla 설정:
- 전송 → 동시 전송 수 → 10으로 증가
- 전송 속도 제한 해제
```

### Tip 2: 캐시 문제 피하기
```
브라우저 캐시 강제 새로고침:
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R

또는 시크릿 모드로 테스트
```

### Tip 3: 백업 필수
```
배포 전:
1. 현재 Figma Make 상태 Export
2. dist/ 폴더 압축 보관
3. 카페24 업로드 전 기존 파일 백업
```

### Tip 4: 단계별 진행
```
한 번에 다 하지 말고:
1. 먼저 업로드만
2. 접속 확인
3. 외부 API 설정
4. 기능별 테스트

문제 생기면 어느 단계에서인지 파악 쉬움
```

### Tip 5: 로그 확인 습관
```
항상 3곳 체크:
1. 브라우저 Console
2. 브라우저 Network 탭
3. Supabase Functions Logs

에러 메시지를 정확히 읽자!
```

---

## 🎉 배포 성공 후 할 일

### 1. 도메인 연결 (선택)
```
카페24에서 도메인 구매하거나
기존 도메인 연결:

1. 카페24 관리자 → 도메인 관리
2. 네임서버 설정
3. 1~24시간 대기 (DNS 전파)
4. HTTPS 재설정
```

### 2. 모니터링 설정
```
추천 도구:
- Google Analytics (무료)
- Sentry (에러 추적, 무료 티어)
- UptimeRobot (서버 상태, 무료)
```

### 3. SEO 최적화
```
기본 설정:
- robots.txt 추가
- sitemap.xml 생성
- meta 태그 최적화
- Open Graph 이미지
```

### 4. 백업 자동화
```
주간 백업:
- Supabase 데이터 Export
- 카페24 파일 다운로드
- 환경변수 문서화
```

### 5. 사용자 피드백 수집
```
초기 사용자에게:
- 사용 소감 요청
- 버그 리포트 요청
- 개선 아이디어 수집
```

---

## 📞 도움이 필요하면

### 카페24 지원
- 전화: 1661-0365
- 채팅: 카페24 사이트 우측 하단
- 이메일: help@cafe24.com

### Supabase 지원
- Discord: https://discord.supabase.com
- 문서: https://supabase.com/docs

### 긴급 연락처
- 이메일: twoegg888@gmail.com

---

<div align="center">

**화이팅! 🚀**

배포 완료하면 축하 메시지 기다릴게요!

</div>

---

**작성일:** 2026-03-16  
**버전:** 1.0  
**예상 소요 시간:** 2.5~3시간  
**난이도:** ⭐⭐ 보통
