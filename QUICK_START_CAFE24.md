# 🚀 카페24 배포 빠른 시작 가이드

> **목표:** 2시간 안에 카페24 배포 완료하기!

---

## ⚡ 30초 요약

```
1. npm run build (빌드)
2. FTP로 dist/ 업로드
3. .htaccess 생성
4. Supabase CORS 추가
5. 카카오/토스 URL 변경
6. 테스트!
```

---

## 📝 준비물 체크 (5분)

### 필수 정보 메모하기

```
카페24 정보:
FTP 호스트: __________________.cafe24.com
FTP 계정: __________________
FTP 비밀번호: __________________
도메인: https://__________________.cafe24.com

Supabase 정보:
Project ID: __________________
Anon Key: __________________

카카오:
REST API Key: f1f1ee7feb6098a7bc74cd41e7d787cc

토스:
Client Key: __________________
```

---

## 🎬 실행 순서 (단계별)

### 1단계: 빌드 파일 준비 (10분)

#### Figma Make에서 다운로드
```
1. 우측 상단 "..." 메뉴 클릭
2. "Export Project" 선택
3. "Download Build Files" 클릭
4. dist.zip 저장
5. 압축 해제
```

#### 빌드 내용 확인
```bash
dist/
├── index.html          ✅
├── assets/
│   ├── index-xxx.js   ✅
│   ├── index-xxx.css  ✅
│   └── ... (이미지들)  ✅
```

---

### 2단계: .htaccess 파일 만들기 (3분)

새 텍스트 파일을 만들고 아래 내용을 복사하세요:

**파일명:** `.htaccess` (점 포함!)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

**저장 위치:** dist/ 폴더 안에 저장

```
dist/
├── .htaccess    ← 여기!
├── index.html
└── assets/
```

---

### 3단계: FTP 업로드 (20분)

#### FileZilla 사용

**연결 정보 입력:**
```
호스트: ftp.your-id.cafe24.com
사용자명: your-id
비밀번호: your-password
포트: 21
```

**업로드 방법:**
```
1. 좌측: 컴퓨터의 dist/ 폴더 열기
2. 우측: 서버의 /www/ 폴더로 이동
3. 좌측에서 모든 파일 선택 (Ctrl+A)
4. 우클릭 → "업로드"
5. 완료될 때까지 대기 (5~10분)
```

**업로드 후 확인:**
```
서버의 /www/ 폴더 내용:
□ index.html
□ .htaccess
□ assets/ (폴더)
```

#### 카페24 웹FTP 사용 (대안)

```
1. 카페24 관리자 페이지 로그인
2. 호스팅 관리 → 웹FTP
3. /www/ 폴더로 이동
4. "업로드" 버튼 클릭
5. 파일 선택 → 전체 업로드
```

---

### 4단계: 첫 접속 테스트 (2분)

브라우저에서 접속:
```
https://your-id.cafe24.com
```

**예상 결과:**
- ✅ 홈 화면 보임
- ✅ 디자인 정상
- ⚠️ 로그인 안 될 수 있음 (정상, 아직 설정 안 함)

**문제가 있다면:**
```
F12 → Console 탭 열기
에러 메시지 확인
→ CAFE24_DEPLOYMENT_CHECKLIST.md 참고
```

---

### 5단계: Supabase CORS 설정 (3분)

#### 1. Supabase 대시보드 접속
```
https://supabase.com → 로그인
→ 프로젝트 선택
→ Settings (좌측 하단)
→ API
```

#### 2. CORS 설정
```
"Additional Allowed Origins" 찾기

입력할 내용:
https://your-id.cafe24.com

※ http가 아닌 https!
※ 마지막에 슬래시(/) 없음!
```

#### 3. 저장
```
"Save" 버튼 클릭
1분 대기
```

---

### 6단계: 카카오 로그인 설정 (5분)

#### 1. 카카오 개발자 콘솔
```
https://developers.kakao.com
→ 로그인
→ 내 애플리케이션
→ 앱 선택
```

#### 2. Web 플랫폼 추가/수정
```
플랫폼 → Web 플랫폼 등록

사이트 도메인:
https://your-id.cafe24.com

저장
```

#### 3. Redirect URI 추가
```
제품 설정 → 카카오 로그인
→ Redirect URI 등록

추가:
https://your-id.cafe24.com/login/callback

저장
```

---

### 7단계: 토스페이먼츠 설정 (5분)

#### 1. 개발자 센터 접속
```
https://developers.tosspayments.com
→ 로그인
→ 내 개발 정보
```

#### 2. URL 변경
```
결제 성공 URL:
https://your-id.cafe24.com/payment/success

결제 실패 URL:
https://your-id.cafe24.com/payment/fail

저장
```

---

### 8단계: 전체 테스트 (30분)

#### ✅ 필수 테스트 (10분)
```
□ 홈 화면 접속
□ 카카오 로그인
□ 로그아웃
□ 다시 로그인
□ 프로필 확인
```

#### ✅ 핵심 기능 테스트 (15분)
```
□ 포인트 충전 (소액 테스트)
□ 티켓 구매
□ 티켓 뽑기
□ 당첨 확인
□ 마이페이지
```

#### ✅ 관리자 테스트 (5분)
```
□ /admin-login 접속
□ 비밀번호 입력 (dleogus23@)
□ 각 탭 확인
```

---

## 🎯 빠른 문제 해결

### 문제: 404 Not Found
```
→ .htaccess 파일 확인
→ FTP에 제대로 업로드되었는지
→ 파일명이 정확히 .htaccess 인지
```

### 문제: CORS Error
```
→ Supabase CORS 설정 확인
→ https:// 로 입력했는지
→ 1분 대기 후 재시도
→ 브라우저 캐시 삭제 (Ctrl+Shift+R)
```

### 문제: 카카오 로그인 실패
```
→ Redirect URI 확인
→ 정확히 일치하는지 (슬래시 주의)
→ https:// 인지
→ 카카오 앱 키 확인
```

### 문제: 포인트 충전 안 됨
```
→ 토스 Success URL 확인
→ Supabase Functions 로그 확인
→ 브라우저 Console 에러 확인
```

---

## 📞 긴급 연락처

### 막혔을 때
```
1. CAFE24_DEPLOYMENT_CHECKLIST.md 참고
2. 브라우저 Console 에러 복사
3. 이메일로 문의: twoegg888@gmail.com
```

### 카페24 지원
```
전화: 1661-0365
시간: 평일 09:00~18:00
```

---

## ✅ 완료 체크리스트

```
□ 빌드 파일 다운로드
□ .htaccess 파일 생성
□ FTP 업로드 완료
□ 도메인 접속 확인
□ Supabase CORS 설정
□ 카카오 플랫폼 등록
□ 카카오 Redirect URI 등록
□ 토스 URL 설정
□ 카카오 로그인 테스트
□ 포인트 충전 테스트
□ 티켓 구매 테스트
□ 관리자 페이지 테스트
□ 모바일 반응형 테스트
```

---

## 🎉 완료!

**배포가 완료되었습니다!**

이제 할 일:
1. 실제 사용자에게 테스트 요청
2. 피드백 수집
3. 버그 수정
4. 기능 추가

**축하합니다! 🎊**

---

<div align="center">

**다음 단계:** [CAFE24_DEPLOYMENT_CHECKLIST.md](CAFE24_DEPLOYMENT_CHECKLIST.md)

더 자세한 문제 해결은 위 문서를 참고하세요!

</div>
