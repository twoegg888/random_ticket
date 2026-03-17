# 개발 히스토리 및 이슈 해결 기록 📝

## 목차
1. [프로젝트 타임라인](#프로젝트-타임라인)
2. [주요 마일스톤](#주요-마일스톤)
3. [해결한 주요 이슈](#해결한-주요-이슈)
4. [기술적 의사결정](#기술적-의사결정)
5. [리팩토링 이력](#리팩토링-이력)
6. [배운 교훈](#배운-교훈)

---

## 프로젝트 타임라인

### Phase 1: 초기 설계 및 프로토타입 (Week 1-2)
```
✅ Figma 디자인 시스템 구축
✅ React + Vite 프로젝트 셋업
✅ 7가지 티켓 카테고리 디자인
✅ 모바일 우선 반응형 (480px 기준)
✅ 카카오 로그인 연동
✅ 토스페이먼츠 결제 연동
```

### Phase 2: 백엔드 API 구축 (Week 3-4)
```
✅ Supabase Edge Functions 설정
✅ Hono 웹 프레임워크 도입
✅ Key-Value Store 설계
✅ 상품 관리 API (CRUD)
✅ 티켓 구매 로직
✅ 포인트 시스템
✅ 트랜잭션 로그 시스템
```

### Phase 3: 핵심 기능 구현 (Week 5-6)
```
✅ 티켓 뽑기 애니메이션
✅ 당첨 화면 구현
✅ 당첨 티켓 관리
✅ 배송 요청 시스템
✅ 포인트 전환 기능
✅ 거래소 시스템
✅ 럭키드로우 시스템
```

### Phase 4: 관리자 시스템 구축 (Week 7)
```
✅ 관리자 인증 시스템
✅ 탭 기반 대시보드
✅ 홈 메인 상품 관리
✅ 상품 관리 (CRUD)
✅ 회원 관리
✅ 배송 관리
✅ 럭키드로우 관리
✅ 통계 조회
✅ Excel 내보내기
```

### Phase 5: 버그 수정 및 최적화 (Week 8)
```
✅ 관리자 인증 에러 해결
✅ 404 페이지 에러 해결
✅ 반응형 레이아웃 개선
✅ 성능 최적화
✅ 에러 핸들링 강화
```

---

## 주요 마일스톤

### 🎯 Milestone 1: MVP 완성
**일시:** 2026-02-28  
**달성 내용:**
- 카카오 로그인 정상 작동
- 포인트 충전 가능
- 티켓 구매 및 뽑기 가능
- 기본 UI/UX 완성

### 🎯 Milestone 2: 백엔드 API 완성
**일시:** 2026-03-05  
**달성 내용:**
- 모든 API 엔드포인트 구현
- 관리자 API 완성
- 트랜잭션 로그 시스템
- 에러 핸들링 완비

### 🎯 Milestone 3: 관리자 페이지 완성
**일시:** 2026-03-10  
**달성 내용:**
- 탭 기반 통합 대시보드
- 상품/회원/배송 관리 가능
- 통계 조회 기능
- Excel 다운로드 기능

### 🎯 Milestone 4: 핵심 버그 수정 완료
**일시:** 2026-03-16  
**달성 내용:**
- 관리자 인증 시스템 안정화
- 404 에러 해결
- 반응형 레이아웃 완성
- 프로덕션 준비 완료

---

## 해결한 주요 이슈

### Issue #1: 관리자 페이지 인증 실패 ⚠️

#### 문제 상황
```
증상:
- 관리자 페이지 로그인 후 모든 API 호출이 401 에러
- "No admin secret provided!" 에러 메시지
- X-Admin-Secret 헤더가 서버에 전달되지 않음

에러 로그:
❌ No admin secret provided!
❌ Admin header NOT FOUND in headers object
```

#### 원인 분석
```typescript
// ❌ 문제 코드 (AppContext.tsx)
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
  'X-Admin-Secret': adminSecret,  // adminSecret이 null이었음!
},

// 문제:
1. AppContext의 adminSecret 상태가 제대로 초기화되지 않음
2. Login → Admin 페이지 이동 시 상태 전달 실패
3. LocalStorage에 저장은 했지만 Context에 로드 안 함
```

#### 해결 방법
```typescript
// ✅ 해결 코드 1: AppContext 초기화 수정
const [adminSecret, setAdminSecret] = useState<string | null>(() => {
  return localStorage.getItem('admin_secret');  // 즉시 로드
});

// ✅ 해결 코드 2: Admin 페이지에서 강제 설정
useEffect(() => {
  const secret = localStorage.getItem('admin_secret');
  if (secret && !adminSecret) {
    setAdminSecret(secret);  // Context에 명시적 설정
  }
}, [adminSecret, setAdminSecret]);

// ✅ 해결 코드 3: API 호출 시 로컬 우선순위
const secret = adminSecret || localStorage.getItem('admin_secret');
headers: {
  'X-Admin-Secret': secret,
},
```

#### 학습 내용
- React Context의 초기화 타이밍 이해
- LocalStorage와 React State 동기화 전략
- 디버깅 시 서버 로그 + 브라우저 로그 동시 확인 필요

---

### Issue #2: 상품 카드 클릭 시 404 에러 ⚠️

#### 문제 상황
```
증상:
- 홈 화면 상품 카드 클릭 시 404 Not Found
- URL은 정상: /ticket/diamond
- React Router가 경로를 찾지 못함

에러:
Cannot GET /ticket/diamond
```

#### 원인 분석
```typescript
// ❌ 문제: 라우팅 경로 불일치
// Home-1-253.tsx
<RouterLink to="/tickets/diamond">  // ❌ /tickets (복수형)

// routes.ts
{
  path: '/ticket/diamond',  // ⚠️ /ticket (단수형)
  Component: DiamondTicketDetail,
},
```

#### 해결 방법
```typescript
// ✅ 해결: 통일된 경로 사용
// Home-1-253.tsx
const getTicketPath = (ticketType: string) => {
  const pathMap: { [key: string]: string } = {
    'diamond': '/ticket/diamond',  // ✅ /ticket으로 통일
    'gold': '/ticket/gold',
    // ...
  };
  return pathMap[ticketType] || '/';
};

<RouterLink to={getTicketPath(product.ticketType)}>
```

#### 학습 내용
- URL 경로는 반드시 일관성 유지
- 복수형/단수형 실수는 흔한 버그
- TypeScript로 경로 타입 정의하면 방지 가능

---

### Issue #3: 반응형 레이아웃 480px 미만 문제 ⚠️

#### 문제 상황
```
증상:
- 480px 미만 화면에서 좌우 여백 발생
- 작은 모바일 기기에서 잘림 현상
- 디자인이 화면을 넘어감
```

#### 원인 분석
```css
/* ❌ 문제 코드 */
.page-container {
  width: 480px;  /* 고정 너비 */
  margin: 0 auto;
}

/* 문제:
   - 화면이 480px보다 작으면 overflow 발생
   - 스크롤바 생성
   - 사용자 경험 저하
*/
```

#### 해결 방법
```typescript
// ✅ 해결: max-width 사용
// Before
<div className="w-[480px] mx-auto">

// After
<div className="w-full max-w-[480px] mx-auto">

// 적용 파일:
// - App.tsx (메인 래퍼)
// - 모든 페이지 컨테이너
// - 하단 네비게이션 바
// - 모달 창

// 결과:
// ✅ 480px 이상: 480px로 제한 (기존 디자인 유지)
// ✅ 480px 미만: 화면 너비에 맞춤 (여백 제거)
```

#### 학습 내용
- 반응형 디자인에서 `max-width` > `width`
- 모바일 우선 설계의 중요성
- 실제 디바이스 테스트 필수

---

### Issue #4: 카카오 로그인 리다이렉트 무한 루프 ⚠️

#### 문제 상황
```
증상:
- 로그인 후 /login/callback → /login → /login/callback 반복
- 무한 리다이렉트 발생
- 브라우저가 멈춤
```

#### 원인 분석
```typescript
// ❌ 문제 코드
// LoginCallback.tsx
useEffect(() => {
  if (!code) {
    navigate('/login');  // code가 없으면 로그인으로
  }
  // ...
}, [code, navigate]);

// Login.tsx
useEffect(() => {
  if (isLoggedIn) {
    navigate('/');  // 이미 로그인했으면 홈으로
  }
}, [isLoggedIn, navigate]);

// 문제:
// 1. Callback에서 code 처리 중 isLoggedIn이 아직 false
// 2. Login으로 리다이렉트
// 3. Login에서 isLoggedIn 확인 후 Callback으로 리다이렉트
// 4. 무한 반복...
```

#### 해결 방법
```typescript
// ✅ 해결: 로딩 상태 추가
const [isProcessing, setIsProcessing] = useState(false);

useEffect(() => {
  if (isProcessing) return;  // 처리 중이면 무시
  
  if (!code) {
    navigate('/login');
    return;
  }
  
  setIsProcessing(true);
  handleKakaoCallback(code)
    .then(() => navigate('/'))
    .finally(() => setIsProcessing(false));
}, [code, isProcessing, navigate]);
```

#### 학습 내용
- OAuth 콜백 처리 시 상태 관리 중요
- 비동기 처리 중 리다이렉트 방지
- 디버깅 시 브라우저 Network 탭 활용

---

### Issue #5: 토스페이먼츠 결제 승인 실패 ⚠️

#### 문제 상황
```
증상:
- 결제창은 정상 작동
- Success URL로 리다이렉트됨
- 하지만 결제 승인 API 호출 실패
- 포인트 충전 안 됨

에러:
Invalid Authorization header
```

#### 원인 분석
```typescript
// ❌ 문제 코드
const encodedSecretKey = btoa(TOSS_SECRET_KEY);
headers: {
  Authorization: `Basic ${encodedSecretKey}`,  // ❌ 잘못된 인코딩
},

// 문제:
// 토스 API는 "clientKey:" 형식 필요
// btoa("secret_key") → 잘못됨
// btoa("secret_key:") → 올바름
```

#### 해결 방법
```typescript
// ✅ 해결: 콜론(:) 추가
const encodedSecretKey = btoa(`${TOSS_SECRET_KEY}:`);

headers: {
  Authorization: `Basic ${encodedSecretKey}`,
  'Content-Type': 'application/json',
},
```

#### 학습 내용
- 외부 API 문서 꼼꼼히 읽기
- Base64 인코딩 형식 확인
- API 테스트 도구로 먼저 검증 (Postman)

---

### Issue #6: 티켓 뽑기 애니메이션 끊김 ⚠️

#### 문제 상황
```
증상:
- 티켓 오픈 애니메이션이 버벅임
- 비디오 재생 딜레이
- 당첨 화면 전환이 부자연스러움
```

#### 원인 분석
```typescript
// ❌ 문제 코드
const handleOpen = async () => {
  setShowVideo(true);  // 비디오 표시
  
  // API 호출 (네트워크 딜레이)
  const result = await purchaseTicket(ticketType);
  
  setTimeout(() => {
    setShowVideo(false);
    setShowWinning(true);  // 당첨 화면
  }, 3000);
};

// 문제:
// 1. API 호출과 애니메이션이 동시에 실행
// 2. 네트워크 딜레이로 UI 블로킹
// 3. 비디오 로딩 완료 전에 재생 시도
```

#### 해결 방법
```typescript
// ✅ 해결: 단계별 처리
const handleOpen = async () => {
  // 1. 먼저 API 호출 (백그라운드)
  const purchasePromise = purchaseTicket(ticketType);
  
  // 2. 비디오 애니메이션 시작
  setShowVideo(true);
  
  // 3. 비디오 preload
  const video = document.querySelector('video');
  video.load();
  
  // 4. 3초 후 결과 표시
  setTimeout(async () => {
    const result = await purchasePromise;  // API 결과 대기
    setShowVideo(false);
    setWonProducts(result.products);
    setShowWinning(true);
  }, 3000);
};
```

#### 학습 내용
- 애니메이션과 API 호출 분리
- 비디오 preload 중요
- 사용자 경험 최우선

---

### Issue #7: 관리자 대시보드 Excel 다운로드 한글 깨짐 ⚠️

#### 문제 상황
```
증상:
- Excel 파일 다운로드는 됨
- 한글이 깨져서 보임
- 엑셀에서 열 때 인코딩 문제
```

#### 원인 분석
```typescript
// ❌ 문제 코드
import * as XLSX from 'xlsx';

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, '회원목록');
XLSX.writeFile(wb, '회원목록.xlsx');

// 문제:
// XLSX 기본 인코딩이 UTF-8
// 한글 Windows Excel은 EUC-KR 기대
```

#### 해결 방법
```typescript
// ✅ 해결 1: BOM 추가
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, '회원목록');

// BOM 추가 (UTF-8 with BOM)
const wbout = XLSX.write(wb, {
  bookType: 'xlsx',
  type: 'array',
  bookSST: false
});

const blob = new Blob([wbout], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
});

// ✅ 해결 2: CSV 사용 (더 간단)
const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' });
const bom = '\uFEFF';  // UTF-8 BOM
const blob = new Blob([bom + csv], {
  type: 'text/csv;charset=utf-8;'
});
```

#### 학습 내용
- UTF-8 BOM의 중요성
- 한글 처리 시 인코딩 명시
- CSV vs XLSX 선택 기준

---

## 기술적 의사결정

### 결정 #1: Supabase Edge Functions vs Node.js 서버

**고려사항:**
```
Supabase Edge Functions:
✅ 서버리스 (관리 불필요)
✅ Deno 런타임 (보안성)
✅ PostgreSQL 통합
✅ 무료 티어 제공
⚠️ Deno 생태계 작음
⚠️ 디버깅 어려움

Node.js 서버:
✅ 풍부한 생태계
✅ 익숙한 환경
✅ 디버깅 쉬움
❌ 서버 관리 필요
❌ 인프라 비용
❌ 확장성 고민
```

**최종 결정:** Supabase Edge Functions
**이유:**
1. 초기 프로토타입에 적합
2. 무료로 시작 가능
3. 확장성 자동 보장
4. 인프라 관리 부담 제로

---

### 결정 #2: Key-Value Store vs 정규화된 테이블 구조

**고려사항:**
```
Key-Value Store (JSONB):
✅ 스키마 유연성
✅ 빠른 개발
✅ NoSQL 스타일
⚠️ 복잡한 쿼리 어려움
⚠️ 조인 불가능

정규화된 테이블:
✅ 복잡한 쿼리 가능
✅ 데이터 무결성
✅ 관계 정의 명확
❌ 스키마 변경 어려움
❌ 개발 속도 느림
```

**최종 결정:** Key-Value Store
**이유:**
1. MVP 단계에서 스키마 자주 변경
2. 복잡한 조인 쿼리 필요 없음
3. 개발 속도 우선
4. 나중에 마이그레이션 가능

---

### 결정 #3: React Router Data Mode vs 기본 모드

**고려사항:**
```
Data Mode (createBrowserRouter):
✅ 최신 권장 방식
✅ 데이터 로딩 최적화
✅ Nested routes 지원
✅ ErrorBoundary 통합
⚠️ 러닝커브 있음

기본 모드 (BrowserRouter):
✅ 간단한 사용법
✅ 익숙한 패턴
❌ 구버전 방식
❌ 최적화 부족
```

**최종 결정:** Data Mode (createBrowserRouter)
**이유:**
1. React Router 공식 권장
2. 미래 지향적
3. 성능 최적화
4. 프로덕션 레벨 준비

---

### 결정 #4: 관리자 인증 - JWT vs 시크릿 키

**고려사항:**
```
JWT 토큰:
✅ 표준 방식
✅ 만료 시간 설정
✅ 확장성 좋음
❌ 구현 복잡
❌ 토큰 갱신 로직 필요

시크릿 키 (하드코딩):
✅ 구현 간단
✅ 빠른 개발
✅ 디버깅 쉬움
⚠️ 보안성 낮음
⚠️ 확장성 제한
```

**최종 결정:** 시크릿 키 (MVP 단계)
**이유:**
1. 단일 관리자만 존재
2. 빠른 프로토타입 필요
3. 나중에 JWT로 전환 가능
4. 현재 요구사항 충족

**TODO:** 프로덕션 전 JWT로 전환

---

## 리팩토링 이력

### 리팩토링 #1: 티켓 페이지 통합

**Before (7개 개별 파일):**
```
/src/app/pages/
├── DiamondTicketDetail.tsx  (500줄)
├── GoldTicketDetail.tsx     (500줄)
├── PlatinumTicketDetail.tsx (500줄)
├── RubyTicketDetail.tsx     (500줄)
├── JewelryTicketDetail.tsx  (500줄)
├── BeautyTicketDetail.tsx   (500줄)
└── MeatTicketDetail.tsx     (500줄)

문제점:
❌ 코드 중복 심함 (90% 동일)
❌ 수정 시 7개 파일 모두 변경 필요
❌ 버그 수정 누락 위험
❌ 3,500줄 관리 부담
```

**After (템플릿 + 7개 래퍼):**
```
/src/app/components/
└── TicketDetailTemplate.tsx  (500줄, 재사용)

/src/app/pages/
├── DiamondTicketDetail.tsx   (10줄, 래퍼)
├── GoldTicketDetail.tsx      (10줄, 래퍼)
└── ...

// 래퍼 예시
export default function DiamondTicketDetail() {
  return <TicketDetailTemplate ticketType="diamond" />;
}

개선 효과:
✅ 코드 90% 감소 (3,500 → 600줄)
✅ 수정 1곳만 변경하면 전체 반영
✅ 유지보수 용이
✅ 테스트 용이
```

---

### 리팩토링 #2: 관리자 페이지 탭 통합

**Before (6개 개별 페이지):**
```
/src/app/pages/
├── AdminProducts.tsx
├── AdminUsers.tsx
├── AdminShipping.tsx
├── AdminLuckyDraw.tsx
├── AdminStats.tsx
└── AdminSettings.tsx

문제점:
❌ 페이지 전환 시 깜빡임
❌ 상태 유지 안 됨
❌ 네비게이션 일관성 부족
❌ 6개 라우팅 필요
```

**After (단일 페이지 + 탭):**
```
/src/app/pages/
└── Admin.tsx  (탭 기반 통합)

/src/app/components/
├── HomeProductsTab.tsx
├── ProductsTab.tsx
├── UsersTab.tsx
├── ShippingTab.tsx
├── LuckyDrawTab.tsx
└── StatsTab.tsx

개선 효과:
✅ 부드러운 탭 전환
✅ 상태 유지 가능
✅ 일관된 레이아웃
✅ 라우팅 1개로 단순화
```

---

### 리팩토링 #3: AppContext 최적화

**Before:**
```typescript
// AppContext.tsx (문제 많았던 초기 버전)
const AppContext = createContext<any>(undefined);  // ❌ any 타입

function AppProvider({ children }) {
  const [userData, setUserData] = useState({});  // ❌ 타입 없음
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // ❌ LocalStorage 동기화 없음
  // ❌ 초기화 로직 없음
  
  return (
    <AppContext.Provider value={{ userData, isLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}
```

**After:**
```typescript
// AppContext.tsx (개선된 버전)
interface AppContextType {
  userData: UserData;
  isLoggedIn: boolean;
  kakaoAccessToken: string | null;
  adminSecret: string | null;
  setUserData: (data: UserData) => void;
  setIsLoggedIn: (value: boolean) => void;
  setKakaoAccessToken: (token: string | null) => void;
  setAdminSecret: (secret: string | null) => void;
  login: (data: UserData, token: string) => void;
  logout: () => void;
}

// ✅ 타입 정의
const AppContext = createContext<AppContextType | undefined>(undefined);

function AppProvider({ children }: { children: React.ReactNode }) {
  // ✅ LocalStorage 초기화
  const [adminSecret, setAdminSecret] = useState<string | null>(() => {
    return localStorage.getItem('admin_secret');
  });
  
  // ✅ 편의 함수 제공
  const login = useCallback((data: UserData, token: string) => {
    setUserData(data);
    setKakaoAccessToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('user_data', JSON.stringify(data));
    localStorage.setItem('kakao_access_token', token);
  }, []);
  
  const logout = useCallback(() => {
    setUserData(initialUserData);
    setKakaoAccessToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user_data');
    localStorage.removeItem('kakao_access_token');
  }, []);
  
  // ...
}

개선 효과:
✅ 타입 안정성
✅ LocalStorage 동기화
✅ 편의 함수 제공
✅ 에러 방지
```

---

## 배운 교훈

### 1. 80/20 법칙의 중요성
```
교훈:
- 전체의 20% 핵심 기능이 80% 가치 제공
- 완벽보다 빠른 MVP 출시가 중요
- 나머지 80% 기능은 피드백 받고 개발

적용 사례:
✅ 관리자 페이지 핵심만 먼저 구현
✅ 통계는 기본만 제공
✅ Excel 다운로드로 고급 기능 우회
```

### 2. 문제 정의가 해결보다 중요
```
교훈:
- 버그의 근본 원인 파악이 핵심
- 증상만 보고 땜질하면 재발
- 로그를 상세히 남기자

적용 사례:
✅ 관리자 인증 에러: 근본 원인(Context 초기화) 해결
✅ 404 에러: 경로 불일치 원인 파악
✅ 서버 로그 강화로 디버깅 시간 단축
```

### 3. 코드 중복은 악의 근원
```
교훈:
- DRY (Don't Repeat Yourself) 원칙
- 중복 코드는 버그 온상
- 템플릿/컴포넌트로 추상화

적용 사례:
✅ TicketDetailTemplate로 7개 페이지 통합
✅ API 호출 유틸 함수화
✅ 공통 컴포넌트 분리
```

### 4. 타입 안정성은 생산성
```
교훈:
- TypeScript 타입 정의는 시간 투자 가치
- any 타입은 시한폭탄
- 인터페이스 정의 먼저

적용 사례:
✅ AppContext 인터페이스 정의
✅ API 응답 타입 정의
✅ Props 타입 정의
```

### 5. 사용자 경험이 최우선
```
교훈:
- 기술적 완벽함 < 사용자 경험
- 로딩 상태, 에러 메시지 중요
- 애니메이션은 UX의 핵심

적용 사례:
✅ 티켓 뽑기 애니메이션 최적화
✅ 로딩 스피너 추가
✅ 에러 메시지 친절하게 작성
```

### 6. 반응형은 필수, 선택 아님
```
교훈:
- 모바일 우선 설계
- max-width > width
- 실제 디바이스 테스트 필수

적용 사례:
✅ 480px 기준 반응형 구현
✅ 480px 미만 화면 대응
✅ 하단 네비게이션 반응형
```

### 7. 문서화는 미래의 나를 위한 투자
```
교훈:
- 지금 당장 이해해도 나중엔 잊음
- 주석과 문서는 필수
- README는 처음 작성할 때가 쉬움

적용 사례:
✅ API 명세 문서화
✅ 데이터베이스 스키마 정리
✅ 마이그레이션 가이드 작성
```

---

## 다음 단계 로드맵

### Short-term (1개월)
```
□ JWT 기반 관리자 인증으로 전환
□ 이미지 최적화 (WebP 변환)
□ 성능 모니터링 도구 연동 (Sentry)
□ 유닛 테스트 작성
□ E2E 테스트 추가 (Playwright)
```

### Mid-term (3개월)
```
□ 푸시 알림 시스템
□ 소셜 공유 기능
□ 친구 초대 이벤트
□ 포인트 선물 기능
□ 실시간 알림 (WebSocket)
```

### Long-term (6개월)
```
□ 다국어 지원 (i18n)
□ iOS/Android 앱 (React Native)
□ 머신러닝 기반 추천 시스템
□ 블록체인 NFT 연동
□ 글로벌 서비스 확장
```

---

## 기여자

### 개발
- **Figma Make AI Assistant** - 전체 개발
- **사용자 (twoegg888@gmail.com)** - 기획 및 피드백

### 디자인
- **Figma 디자인 시스템** - UI/UX 디자인

### 인프라
- **Supabase** - 백엔드 플랫폼
- **Figma Make** - 개발 환경

---

**작성일:** 2026-03-16  
**최종 수정:** 2026-03-16  
**버전:** 1.0  
**프로젝트:** 랜덤티켓 (Random Ticket)  
**개발 기간:** 2026-02-01 ~ 2026-03-16 (약 6주)
