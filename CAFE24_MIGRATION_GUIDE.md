# 카페24 마이그레이션 가이드 📦

## 목차
1. [현재 시스템 구조](#현재-시스템-구조)
2. [카페24 이전 가능성 분석](#카페24-이전-가능성-분석)
3. [이전 전략](#이전-전략)
4. [단계별 이전 가이드](#단계별-이전-가이드)
5. [예상 문제점 및 해결방안](#예상-문제점-및-해결방안)
6. [비용 및 시간 추정](#비용-및-시간-추정)

---

## 현재 시스템 구조

### 1. 프론트엔드 (React SPA)
```
기술 스택:
- React 18.3.1
- Vite 6.3.5
- React Router 7.13.0
- Tailwind CSS 4.1.12
- TypeScript (via JSX/TSX)

주요 특징:
- Single Page Application (SPA)
- 모바일 우선 반응형 디자인 (480px 기준)
- Figma 디자인 시스템 직접 import
- 7개 티켓 카테고리 동적 로딩
```

### 2. 백엔드 (Supabase Edge Functions)
```
기술 스택:
- Deno Runtime (Edge Function)
- Hono Web Framework
- Supabase PostgreSQL
- Key-Value Store

주요 기능:
✅ 카카오 로그인 OAuth 2.0
✅ 토스페이먼츠 결제 연동
✅ 상품/회원/티켓 관리 API
✅ 관리자 대시보드 API
✅ 럭키드로우 시스템
✅ 거래소 시스템
```

### 3. 데이터베이스
```
구조:
- kv_store_53dba95c (메인 테이블)
  - key (Primary Key)
  - value (JSONB)
  - created_at
  - updated_at

데이터 타입:
- user:{kakaoId} → 회원 정보
- product:{id} → 상품 정보
- ticket:{id} → 티켓 정보
- transaction:{id} → 거래 내역
- shipping:{id} → 배송 정보
- exchange:{id} → 거래소 정보
- lucky_draw:{id} → 럭키드로우 정보
```

### 4. 외부 API 연동
```
✅ 카카오 OAuth 2.0
   - REST API Key: f1f1ee7feb6098a7bc74cd41e7d787cc
   - Redirect URI 설정 필요

✅ 토스페이먼츠
   - Client Key 필요
   - Secret Key (환경변수)
   - 결제 승인 Webhook

✅ Supabase
   - Project ID
   - Anon Key
   - Service Role Key
```

---

## 카페24 이전 가능성 분석

### ✅ 가능한 부분 (70%)

#### 1. 프론트엔드 전체
```
✅ React 코드 100% 재사용 가능
✅ Tailwind CSS 그대로 사용 가능
✅ Vite 빌드 → 카페24 호스팅 배포
✅ 정적 파일 (images, SVG) 그대로 사용
✅ Figma 디자인 시스템 유지

배포 방법:
1. `npm run build` → dist/ 폴더 생성
2. 카페24 FTP로 dist/ 업로드
3. index.html을 루트에 배치
```

#### 2. 카카오 로그인
```
✅ 카카오 OAuth는 플랫폼 독립적
✅ Redirect URI만 카페24 도메인으로 변경
✅ 프론트엔드 코드 재사용 가능

변경 사항:
- Redirect URI: https://your-cafe24-domain.com/login/callback
- 카카오 개발자 콘솔에서 도메인 등록
```

#### 3. 토스페이먼츠
```
✅ 결제 시스템 플랫폼 독립적
✅ Success/Fail URL만 변경하면 사용 가능

변경 사항:
- Success URL: https://your-cafe24-domain.com/payment/success
- Fail URL: https://your-cafe24-domain.com/payment/fail
```

### ⚠️ 문제가 되는 부분 (30%)

#### 1. 백엔드 서버 (가장 큰 문제)
```
❌ 카페24는 Deno Edge Function 미지원
❌ Supabase 전용 기능 사용 불가

해결 방안:
Option 1) Node.js 서버로 재작성 (권장)
   - Express.js 또는 Fastify
   - 카페24 Node.js 호스팅 사용
   - API 로직 100% 재구현 필요

Option 2) PHP 서버로 재작성
   - 카페24 기본 지원 언어
   - 모든 API를 PHP로 변환
   - 작업량 많음 (비추천)

Option 3) Supabase 그대로 사용 (권장 ⭐)
   - 프론트엔드만 카페24 호스팅
   - 백엔드는 Supabase 계속 사용
   - CORS 설정만 추가
   - 가장 빠르고 안전
```

#### 2. 데이터베이스
```
❌ 카페24는 Supabase PostgreSQL 미제공

해결 방안:
Option 1) MySQL로 마이그레이션
   - 카페24 기본 제공 MySQL 사용
   - KV 구조를 테이블 구조로 변환
   - 스키마 재설계 필요

Option 2) Supabase 계속 사용 (권장 ⭐)
   - Supabase는 독립적인 SaaS
   - 프론트엔드에서 직접 연결 가능
   - 별도 비용 발생 (Free Tier 가능)
```

#### 3. 파일 저장소
```
현재: Supabase Storage
카페24: FTP 또는 별도 CDN

해결 방안:
Option 1) 카페24 FTP 사용
   - 이미지/파일을 FTP에 업로드
   - URL 경로만 변경

Option 2) Cloudinary/AWS S3 사용
   - 전문 이미지 호스팅 서비스
   - 성능 최적화
```

---

## 이전 전략

### 전략 A: 하이브리드 방식 (권장 ⭐⭐⭐)
```
프론트엔드: 카페24 호스팅
백엔드: Supabase 계속 사용
데이터베이스: Supabase PostgreSQL

장점:
✅ 가장 빠른 이전 (1~2일)
✅ 코드 변경 최소화 (5% 미만)
✅ 안정성 보장
✅ Supabase 무료 티어 사용 가능

단점:
⚠️ Supabase 의존성 유지
⚠️ 별도 백엔드 관리 필요

비용:
- 카페24: 월 약 5,000원~
- Supabase: Free Tier (월 50만 Request)
```

### 전략 B: 완전 이전 방식
```
프론트엔드: 카페24 호스팅
백엔드: Node.js (카페24 Node.js 호스팅)
데이터베이스: MySQL (카페24 제공)

장점:
✅ 카페24 생태계에 완전 통합
✅ 단일 플랫폼 관리
✅ 외부 의존성 제거

단점:
❌ 백엔드 100% 재작성 필요 (2~3주)
❌ MySQL 스키마 재설계 필요
❌ 테스트 및 디버깅 시간 소요
❌ 버그 발생 리스크 높음

비용:
- 카페24 프리미엄: 월 약 30,000원~
```

### 전략 C: 클라우드 방식 (프로덕션급)
```
프론트엔드: Vercel/Netlify
백엔드: AWS Lambda/Google Cloud Run
데이터베이스: AWS RDS/Supabase

장점:
✅ 확장성 최고
✅ 글로벌 CDN 제공
✅ 자동 SSL/HTTPS
✅ CI/CD 자동화

단점:
⚠️ 러닝커브 존재
⚠️ 비용 증가 가능성

비용:
- Vercel: Free Tier 가능
- Supabase: Free Tier 가능
- 트래픽 증가 시 월 $20~
```

---

## 단계별 이전 가이드

### 전략 A 기준 (하이브리드 - 권장)

#### Step 1: 환경 준비 (30분)
```bash
# 1. 카페24 호스팅 가입
- 스탠다드 요금제 이상 선택
- FTP 계정 생성
- 도메인 연결

# 2. 프로젝트 빌드
npm run build

# 3. 빌드 결과 확인
ls dist/
# → index.html, assets/, 등
```

#### Step 2: 카페24 배포 (1시간)
```bash
# 1. FTP 연결
호스트: ftp.your-cafe24.com
계정: your-id
비밀번호: your-password

# 2. dist/ 폴더 내용을 /www/ 에 업로드
/www/index.html
/www/assets/
/www/figma:asset/ (이미지들)

# 3. .htaccess 파일 생성 (SPA 라우팅 지원)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Step 3: 환경변수 수정 (30분)
```typescript
// utils/supabase/info.tsx
// 변경 전
export const projectId = "abcd1234";

// 변경 후: 카페24 도메인 체크해서 분기
export const projectId = 
  window.location.hostname.includes('cafe24.com')
    ? "your-project-id"  // 그대로 유지
    : "abcd1234";

// CORS 허용 도메인 추가 필요
// Supabase 대시보드 → Settings → API → CORS
// https://your-cafe24-domain.com 추가
```

#### Step 4: 카카오 로그인 설정 (15분)
```
카카오 개발자 콘솔:
https://developers.kakao.com

1. 내 애플리케이션 선택
2. 플랫폼 설정 → Web 플랫폼 추가
   - 사이트 도메인: https://your-cafe24-domain.com

3. Redirect URI 추가
   - https://your-cafe24-domain.com/login/callback
```

#### Step 5: 토스페이먼츠 설정 (15분)
```
토스페이먼츠 개발자센터:
https://developers.tosspayments.com

1. 내 개발 정보
2. Success URL 변경
   - https://your-cafe24-domain.com/payment/success

3. Fail URL 변경
   - https://your-cafe24-domain.com/payment/fail
```

#### Step 6: 테스트 (2시간)
```
테스트 체크리스트:
□ 홈 화면 로드
□ 카카오 로그인
□ 포인트 충전 (결제)
□ 티켓 뽑기
□ 당첨 티켓 확인
□ 거래소 거래
□ 럭키드로우
□ 마이페이지
□ 관리자 페이지 로그인
□ 관리자 페이지 기능들

모바일 테스트:
□ iOS Safari
□ Android Chrome
□ 480px 미만 화면
```

---

## 예상 문제점 및 해결방안

### 문제 1: CORS 에러
```
증상:
Access to fetch at 'https://xxx.supabase.co' from origin 
'https://your-cafe24.com' has been blocked by CORS policy

해결:
1. Supabase 대시보드 → Settings → API
2. CORS allowed origins에 추가:
   https://your-cafe24-domain.com
   https://www.your-cafe24-domain.com
```

### 문제 2: 이미지 로딩 실패
```
증상:
figma:asset/xxx.png 이미지가 404 에러

해결:
1. Vite 빌드 시 figma:asset 처리 확인
2. 이미지 파일들이 dist/assets/에 복사되었는지 확인
3. 경로를 절대 경로로 변경:
   - /assets/xxx.png
```

### 문제 3: 라우팅 404 에러
```
증상:
/ticket/ruby 같은 경로로 직접 접속 시 404

해결:
.htaccess 파일 확인 (Step 2 참고)
또는 카페24 관리자 → 고급설정 → .htaccess 활성화
```

### 문제 4: 환경변수 노출
```
증상:
브라우저 개발자도구에서 API 키가 보임

해결:
Public API 키만 사용 (현재 설계 OK)
- Supabase Anon Key는 공개 가능
- Service Role Key는 서버에만 존재
- 토스 Client Key는 공개 가능
```

### 문제 5: 속도 저하
```
증상:
페이지 로딩이 느림

해결:
1. 이미지 최적화
   - WebP 포맷 사용
   - 압축 (TinyPNG)

2. 코드 스플리팅
   - React.lazy() 사용
   - 각 티켓 페이지 lazy load

3. CDN 사용
   - Cloudflare 연동
   - 카페24 CDN 옵션 활성화
```

---

## 비용 및 시간 추정

### 전략 A (하이브리드) 
```
총 소요 시간: 5~8시간 (1일)

작업 시간:
- 환경 준비: 30분
- 카페24 배포: 1시간
- 환경변수 수정: 30분
- 외부 API 설정: 30분
- 테스트: 2시간
- 버그 수정: 1시간
- 문서화: 30분

월 비용:
- 카페24 스탠다드: 약 5,000원
- Supabase Free Tier: 0원
- 도메인: 약 15,000원/년 (선택)
─────────────────
합계: 월 약 6,000원
```

### 전략 B (완전 이전)
```
총 소요 시간: 80~120시간 (2~3주)

작업 시간:
- Node.js 서버 재작성: 40시간
- MySQL 스키마 설계: 8시간
- 데이터 마이그레이션: 4시간
- API 테스트: 16시간
- 프론트엔드 수정: 8시간
- 통합 테스트: 8시간
- 버그 수정: 16시간

월 비용:
- 카페24 프리미엄: 약 30,000원
- 도메인: 약 15,000원/년
─────────────────
합계: 월 약 31,000원
```

---

## 권장 사항

### 🎯 최종 권장: 전략 A (하이브리드)

**이유:**
1. ⏱️ **빠른 배포**: 1일 이내 완료 가능
2. 💰 **저비용**: 월 6,000원 수준
3. 🛡️ **안정성**: 검증된 Supabase 인프라 활용
4. 🔧 **유지보수**: 코드 변경 최소화

**적합한 경우:**
- 빠르게 카페24로 이전하고 싶을 때
- 개발 리소스가 제한적일 때
- 초기 MVP 단계일 때
- Supabase 무료 티어로 충분할 때

### 🚀 장기 전략: 전략 C (클라우드)

**이유:**
1. 📈 **확장성**: 트래픽 증가 대응
2. 🌏 **글로벌**: CDN으로 전세계 서비스
3. ⚡ **성능**: 최적화된 인프라
4. 🤖 **자동화**: CI/CD 파이프라인

**적합한 경우:**
- 사용자 급증 예상
- 프로덕션 레벨 서비스
- 개발팀이 있을 때
- 예산이 충분할 때

---

## 체크리스트

### 이전 전 체크리스트
```
□ 카페24 호스팅 가입 완료
□ FTP 접속 정보 확보
□ 도메인 연결 완료
□ SSL 인증서 설치 완료
□ 카카오 개발자 계정 접근 가능
□ 토스페이먼츠 계정 접근 가능
□ Supabase 대시보드 접근 가능
□ 현재 시스템 백업 완료
```

### 이전 후 체크리스트
```
□ 모든 페이지 정상 로드
□ 카카오 로그인 정상 작동
□ 포인트 충전 정상 작동
□ 티켓 뽑기 정상 작동
□ 관리자 페이지 정상 작동
□ 모바일 반응형 정상 작동
□ HTTPS 정상 작동
□ 도메인 정상 연결
□ 성능 테스트 통과 (3초 이내 로드)
□ 크로스 브라우저 테스트 통과
```

---

## 추가 고려사항

### 1. 백업 전략
```
일일 백업:
- Supabase 자동 백업 활성화
- 코드: Git repository
- 이미지: 별도 저장소 보관

재해 복구:
- Supabase Export 기능 활용
- 카페24 자동 백업 옵션
```

### 2. 모니터링
```
추천 도구:
- Sentry: 에러 추적
- Google Analytics: 사용자 분석
- Supabase Dashboard: API 모니터링
- UptimeRobot: 서버 상태 체크 (무료)
```

### 3. 성능 최적화
```
최적화 항목:
□ 이미지 lazy loading
□ Code splitting
□ Tree shaking
□ Gzip 압축 활성화
□ 브라우저 캐싱 설정
□ CDN 사용
```

---

## 결론

✅ **카페24 이전은 충분히 가능합니다!**

**가장 현실적인 방법:**
- 프론트엔드만 카페24로 이전
- 백엔드는 Supabase 계속 사용
- 1일 내 완료 가능
- 월 6,000원 수준 비용

**장기 운영 시:**
- 트래픽 증가하면 Vercel 같은 전문 호스팅 고려
- Supabase 유료 플랜 ($25/월)로 업그레이드
- 또는 AWS/GCP로 완전 이전

---

## 문의 및 지원

추가 질문이나 이전 과정에서 문제가 발생하면:
1. 카페24 고객센터: 1661-0365
2. Supabase Discord: https://discord.supabase.com
3. 현재 개발자에게 문의

---

**작성일:** 2026-03-16  
**버전:** 1.0  
**작성자:** Figma Make AI Assistant
