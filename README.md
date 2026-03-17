# 랜덤티켓 (Random Ticket) 🎫

> 포인트로 티켓을 구매하고 랜덤으로 상품을 받는 럭키드로우 플랫폼

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1.12-cyan.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

---

## 🎯 프로젝트 개요

**랜덤티켓**은 카카오 로그인과 토스페이먼츠 결제를 활용한 럭키드로우 플랫폼입니다.  
사용자는 포인트로 7가지 등급의 티켓을 구매하고, 랜덤으로 상품을 획득할 수 있습니다.

### 주요 기능
- ✅ **카카오 로그인** - 간편한 소셜 로그인
- ✅ **포인트 시스템** - 토스페이먼츠 결제 연동
- ✅ **7가지 티켓** - 다이아, 플래티넘, 골드, 루비, 주얼리, 뷰티, 미트
- ✅ **랜덤 뽑기** - 확률 기반 상품 추첨
- ✅ **당첨 관리** - 배송 요청, 포인트 전환, 거래소 등록
- ✅ **거래소** - 티켓 사고팔기
- ✅ **럭키드로우** - 이벤트 참여
- ✅ **관리자 페이지** - 상품/회원/배송 관리

---

## 📚 문서

### 핵심 문서
- **[프로젝트 전체 문서](PROJECT_DOCUMENTATION.md)** - 기술 스택, 아키텍처, API 명세
- **[카페24 마이그레이션 가이드](CAFE24_MIGRATION_GUIDE.md)** - 카페24로 이전하는 방법
- **[개발 히스토리](DEVELOPMENT_HISTORY.md)** - 개발 과정 및 이슈 해결 기록

### 빠른 링크
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [배포하기](#배포하기)
- [API 문서](#api-문서)
- [FAQ](#faq)

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────┐
│           사용자 (모바일/데스크톱)              │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│        프론트엔드 (React SPA)                 │
│  - Vite 6.3.5                               │
│  - React Router 7.13.0                      │
│  - Tailwind CSS 4.1.12                      │
└──────────┬─────────────────┬────────────────┘
           │                 │
           ↓                 ↓
    ┌──────────┐      ┌──────────────┐
    │  카카오   │      │ 토스페이먼츠  │
    │  OAuth   │      │    결제      │
    └──────────┘      └──────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│      백엔드 (Supabase Edge Functions)        │
│  - Deno Runtime                             │
│  - Hono Framework                           │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│    데이터베이스 (Supabase PostgreSQL)         │
│  - Key-Value Store                          │
└─────────────────────────────────────────────┘
```

---

## 🛠️ 기술 스택

### Frontend
| 카테고리 | 기술 | 버전 |
|---------|------|------|
| 코어 | React | 18.3.1 |
| 빌드 도구 | Vite | 6.3.5 |
| 라우팅 | React Router | 7.13.0 |
| 스타일링 | Tailwind CSS | 4.1.12 |
| UI 컴포넌트 | Radix UI | - |
| 애니메이션 | Motion | 12.23.24 |
| 폼 | React Hook Form | 7.55.0 |
| 차트 | Recharts | 2.15.2 |
| 결제 | Toss Payments SDK | 1.9.2 |

### Backend
| 카테고리 | 기술 |
|---------|------|
| 런타임 | Deno |
| 프레임워크 | Hono |
| 데이터베이스 | Supabase PostgreSQL |
| 인증 | Supabase Auth + 카카오 OAuth |
| 저장소 | Supabase Storage |

### External APIs
- **카카오 로그인** - OAuth 2.0
- **토스페이먼츠** - 결제/환불
- **Supabase** - 백엔드 인프라

---

## 🚀 시작하기

### 사전 요구사항
```bash
Node.js 18+ 
npm 또는 pnpm
```

### 환경 설정

#### 1. Supabase 설정
```typescript
// utils/supabase/info.tsx
export const projectId = "your-project-id";
export const publicAnonKey = "your-anon-key";
```

#### 2. Supabase Secrets 설정
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
TOSS_SECRET_KEY=test_sk_xxx
ADMIN_SECRET=your-password
```

#### 3. 카카오 개발자 콘솔 설정
```
1. https://developers.kakao.com 접속
2. 애플리케이션 생성
3. 플랫폼 설정 → Web 플랫폼 추가
4. Redirect URI 등록:
   - http://localhost:5173/login/callback (개발)
   - https://your-domain.com/login/callback (운영)
5. REST API Key 복사
```

#### 4. 토스페이먼츠 설정
```
1. https://developers.tosspayments.com 접속
2. Client Key / Secret Key 발급
3. Success/Fail URL 설정
```

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (Figma Make 환경에서는 자동)
npm run dev

# 브라우저에서 열기
http://localhost:5173
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# dist/ 폴더 생성 확인
ls dist/
```

---

## 📱 주요 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 | `/` | 메인 화면, 상품 소개 |
| 로그인 | `/login` | 카카오 로그인 |
| 포인트 충전 | `/points` | 토스페이먼츠 결제 |
| 티켓 상세 | `/ticket/:type` | 티켓 구매 및 뽑기 |
| 당첨 티켓 | `/winning-tickets` | 당첨 내역 확인 |
| 거래소 | `/exchange` | 티켓 거래 |
| 럭키드로우 | `/lucky-draw` | 이벤트 참여 |
| 마이페이지 | `/my-page` | 회원 정보, 포인트 내역 |
| 관리자 | `/admin` | 상품/회원/배송 관리 |

---

## 🎨 디자인 시스템

### 티켓 등급
```typescript
const TICKET_GRADES = {
  diamond: { name: '다이아', price: 49000, color: '#B9F2FF' },
  platinum: { name: '플래티넘', price: 99000, color: '#E5E4E2' },
  gold: { name: '골드', price: 14900, color: '#FFD700' },
  ruby: { name: '루비', price: 9900, color: '#E0115F' },
  jewelry: { name: '주얼리', price: 19900, color: '#AA98A9' },
  beauty: { name: '뷰티', price: 24900, color: '#FF69B4' },
  meat: { name: '미트', price: 39900, color: '#8B4513' },
};
```

### 반응형 디자인
```
모바일: 전체 화면 사용 (100%)
데스크톱: 480px 중앙 정렬

breakpoint: md (768px)
```

### 컬러 팔레트
```css
Primary: #020202 (검정)
Secondary: #FFFFFF (흰색)
Accent: #FFD700 (골드)
Gray: #EAEAEA (연한 회색)
Text: #020202 (검정)
```

---

## 📡 API 문서

### 인증 API

#### POST `/auth/kakao`
카카오 로그인 처리
```json
{
  "code": "kakao-auth-code",
  "redirectUri": "https://your-domain.com/login/callback"
}
```

### 상품 API

#### GET `/products?ticketType=diamond`
상품 목록 조회

#### POST `/admin/products`
상품 생성 (관리자)

### 티켓 API

#### POST `/tickets/purchase`
티켓 구매
```json
{
  "ticketType": "diamond",
  "quantity": 1
}
```

#### GET `/tickets/winning`
당첨 티켓 목록

### 포인트 API

#### POST `/payments/confirm`
결제 승인
```json
{
  "paymentKey": "xxx",
  "orderId": "xxx",
  "amount": 10000
}
```

**전체 API 문서:** [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md#api-명세)

---

## 🗂️ 폴더 구조

```
/
├── src/
│   ├── app/
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── ui/           # shadcn/ui
│   │   │   └── ...
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── context/          # React Context
│   │   ├── types/            # TypeScript 타입
│   │   ├── routes.ts         # 라우팅 설정
│   │   └── App.tsx           # 메인 앱
│   ├── imports/              # Figma imports
│   └── styles/               # CSS 파일
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx     # 백엔드 API
│           └── kv_store.tsx  # DB 유틸
├── utils/
│   └── supabase/
│       └── info.tsx          # Supabase 설정
└── package.json
```

---

## 🚢 배포하기

### Option 1: 카페24 (권장)
```bash
# 1. 빌드
npm run build

# 2. FTP로 dist/ 업로드
# 3. .htaccess 설정 (SPA 라우팅)

# 자세한 가이드: CAFE24_MIGRATION_GUIDE.md
```

### Option 2: Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option 3: Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🔒 보안

### Public Keys (공개 가능)
```
✅ Supabase Anon Key
✅ 카카오 REST API Key
✅ 토스 Client Key
```

### Secret Keys (절대 노출 금지)
```
❌ Supabase Service Role Key
❌ 토스 Secret Key
❌ 관리자 비밀번호
```

### Best Practices
- 환경변수는 `.env` 파일에 저장 (Git 제외)
- 프론트엔드에는 Public Key만 사용
- 백엔드 API에서 권한 검증
- HTTPS 필수

---

## 🧪 테스트

### 수동 테스트 체크리스트
```
□ 카카오 로그인
□ 포인트 충전
□ 티켓 구매
□ 티켓 뽑기
□ 당첨 확인
□ 배송 요청
□ 포인트 전환
□ 거래소 거래
□ 럭키드로우
□ 관리자 로그인
□ 관리자 기능들
```

### 반응형 테스트
```
□ 320px (iPhone SE)
□ 375px (iPhone 12)
□ 414px (iPhone 12 Pro Max)
□ 768px (iPad)
□ 1024px (Desktop)
```

---

## ❓ FAQ

### Q1: 카페24로 이전 가능한가요?
**A:** 네! 프론트엔드만 카페24로 이전하고 백엔드는 Supabase를 계속 사용하는 하이브리드 방식을 권장합니다. 자세한 내용은 [CAFE24_MIGRATION_GUIDE.md](CAFE24_MIGRATION_GUIDE.md)를 참고하세요.

### Q2: 무료로 운영 가능한가요?
**A:** 네! Supabase와 Vercel 모두 무료 티어를 제공합니다.
- Supabase: 월 50만 Request
- Vercel: 월 100GB 대역폭
- 카카오/토스: 무료

### Q3: 새로운 티켓 타입 추가 방법은?
**A:** 
1. `TICKET_PRICES`에 가격 추가
2. 타입 정의 추가
3. 페이지 컴포넌트 생성
4. 라우팅 추가
자세한 내용은 [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md#새로운-티켓-타입-추가)

### Q4: 관리자 비밀번호를 변경하려면?
**A:** 
```typescript
// supabase/functions/server/index.tsx
const ADMIN_SECRET = "new-password";  // 여기 변경
```

### Q5: 실제 결제를 테스트하려면?
**A:** 토스페이먼츠는 테스트 모드와 운영 모드를 제공합니다.
- 테스트: `test_sk_xxx` 키 사용
- 운영: `live_sk_xxx` 키 사용 (실제 결제 발생)

---

## 🐛 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함해서 알려주세요:

```
1. 버그 설명
2. 재현 방법
3. 예상 동작
4. 실제 동작
5. 스크린샷 (선택)
6. 브라우저/디바이스 정보
```

**이메일:** twoegg888@gmail.com

---

## 📝 변경 로그

### v1.0.0 (2026-03-16)
```
✅ 카카오 로그인 구현
✅ 토스페이먼츠 결제 연동
✅ 7가지 티켓 시스템
✅ 티켓 뽑기 애니메이션
✅ 거래소 시스템
✅ 럭키드로우 시스템
✅ 관리자 대시보드
✅ 반응형 레이아웃
✅ 카페24 마이그레이션 가이드
```

---

## 🤝 기여

이 프로젝트는 Figma Make 환경에서 개발되었습니다.

### 개발자
- **Figma Make AI Assistant** - 전체 개발
- **사용자** - 기획 및 피드백

### 사용된 서비스
- **Figma Make** - 개발 플랫폼
- **Supabase** - 백엔드
- **카카오** - 로그인
- **토스페이먼츠** - 결제

---

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

## 🔗 관련 링크

- [Figma Make](https://www.figma.com/make)
- [Supabase](https://supabase.com)
- [카카오 개발자](https://developers.kakao.com)
- [토스페이먼츠](https://developers.tosspayments.com)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 연락처

**이메일:** twoegg888@gmail.com  
**프로젝트:** 랜덤티켓 (Random Ticket)  
**개발 기간:** 2026-02-01 ~ 2026-03-16

---

<div align="center">

Made with ❤️ by Figma Make AI Assistant

**[⬆ 맨 위로](#랜덤티켓-random-ticket-)**

</div>
