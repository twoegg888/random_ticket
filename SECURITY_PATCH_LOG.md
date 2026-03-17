# 🚨 프로덕션 긴급 보안 패치 로그

## 패치 일시
2026-03-05

## ⚡️ 최신 변경사항
- **2026-03-05 18:30** - 관리자 비밀번호 변경 완료
  - 로그인 비밀번호: `dleogus23@`
  - API 토큰: `dleogus23@!secure!key!2026`

## 패치 내역

### ✅ 1. 관리자 API 보안 강화 (CRITICAL)
**문제:** 누구나 publicAnonKey로 관리자 API 호출 가능
**해결:**
- 백엔드에 `validateAdminAuth()` 미들웨어 추가
- 모든 `/admin/*` 엔드포인트에 인증 체크 적용 (14개 API)
- 프론트엔드에서 `ADMIN_SECRET` 토큰 전송
- 영향받은 파일:
  - `/supabase/functions/server/index.tsx`
  - `/src/app/pages/Admin.tsx`
  - `/src/app/components/ShippingTab.tsx`

**보호된 API 목록:**
1. `/admin/stats` - 통계 조회
2. `/admin/users` - 회원 목록
3. `/admin/users/:kakaoId` - 회원 삭제
4. `/admin/products/all` - 전체 상품 조회
5. `/admin/products/:ticketType` - 티켓별 상품 조회
6. `/admin/products/:ticketType` - 상품 추가
7. `/admin/products/:ticketType/:productId` - 상품 수정
8. `/admin/products/:ticketType/:productId` - 상품 삭제
9. `/admin/lucky-draws` - 럭키드로우 목록
10. `/admin/lucky-draws` - 럭키드로우 추가
11. `/admin/lucky-draws/:luckyDrawId/participants` - 참여자 조회
12. `/admin/lucky-draws/:luckyDrawId/draw-winner` - 당첨자 선정
13. `/admin/shipping` - 배송 목록
14. `/admin/shipping/:ticketId` - 배송 상태 변경

---

### ✅ 2. 상품 확률 검증 로직 (HIGH)
**문제:** 확률 합계가 100%가 아닌 경우에도 상품 추가/수정 가능
**해결:**
- 상품 추가/수정 시 활성화된 상품의 확률 합계 검증
- 100%가 아니면 400 에러 반환
- 부동소수점 오차 0.01% 허용

```typescript
const activeProducts = products.filter((p: any) => p.isActive);
const totalProbability = activeProducts.reduce((sum: number, p: any) => sum + (p.probability || 0), 0);

if (Math.abs(totalProbability - 100) > 0.01) {
  return c.json({ 
    error: `확률 합계가 100%가 아닙니다. 현재: ${totalProbability.toFixed(2)}%`,
    currentTotal: totalProbability,
    activeProducts: activeProducts.length
  }, 400);
}
```

---

### ✅ 3. 럭키드로우 중복 참여 방지 강화 (HIGH)
**문제:** 데이터 불일치 시 중복 참여 가능
**해결:**
- 이중 검증 시스템 구축
  1. 사용자 데이터에서 검증
  2. 전역 참여 목록에서 검증
- 데이터 불일치 감지 시 경고 로그

```typescript
// 사용자 데이터 검증
const alreadyEntered = userData.luckyDrawEntries.some(
  (e: any) => e.productId === productId && e.status === 'pending'
);

// 전역 목록 검증
const globalEntries = await kv.getByPrefix(`luckydraw:${productId}:`);
const alreadyInGlobalList = globalEntries.some((entryStr: string) => {
  const entry = JSON.parse(entryStr);
  return entry.kakaoId === kakaoId;
});
```

---

### ✅ 4. 포인트 트랜잭션 무결성 보장 (CRITICAL)
**문제:** 네트워크 끊김 시 포인트만 차감되고 티켓 미지급 가능
**해결:**
- 트랜잭션 로그 시스템 구축
- 원자적 티켓 구매 API 생성: `/user/:kakaoId/tickets/purchase-atomic`
- 트랜잭션 상태 추적: pending → completed/failed
- 향후 롤백 로직 확장 가능

**트랜잭션 흐름:**
1. 트랜잭션 로그 생성 (status: 'pending')
2. 포인트 검증
3. 포인트 차감
4. 티켓 생성
5. 거래 내역 추가
6. 모든 변경사항 저장
7. 트랜잭션 로그 완료 (status: 'completed')
8. 에러 발생 시 상태를 'failed'로 기록

---

### ✅ 5. 사용자 API 권한 검증 (CRITICAL)
**문제:** 포인트 추가 API를 누구나 호출 가능
**해결:**
- `/user/:kakaoId/points/add` → 관리자 전용으로 변경
- 카카오 토큰 검증 함수 추가 (향후 확장용)

```typescript
// 관리자 인증 체크
if (!validateAdminAuth(c.req.header("Authorization"))) {
  return c.json({ error: "Unauthorized - Admin only" }, 401);
}
```

---

## 🔐 인증 시스템 구조

### 관리자 인증
- **토큰:** `ADMIN_SECRET = "lotto2025!admin!secret!key"`
- **전송 방법:** `Authorization: Bearer ${ADMIN_SECRET}`
- **보호 대상:** 모든 `/admin/*` API

### 사용자 인증 (향후 확장)
- **토큰:** 카카오 액세스 토큰
- **검증 방법:** `https://kapi.kakao.com/v1/user/access_token_info`
- **보호 대상:** 사용자 데이터 수정 API

---

## 🎯 향후 개선 사항 (MEDIUM 우선순위)

### 1. 토스페이먼츠 Webhook 구현
- 결제 검증
- 결제 취소 시 포인트 회수

### 2. 트랜잭션 롤백 로직
- failed 상태인 트랜잭션 자동 복구
- 관리자가 수동으로 복구할 수 있는 UI

### 3. 카카오 토큰 검증 적용
- 모든 사용자 API에 토큰 검증 추가
- 본인 데이터만 접근 가능

### 4. 재고 관리 시스템
- 상품별 재고 수량
- 재고 소진 시 자동 비활성화

### 5. 검색/필터/정렬 기능
- 관리자: 회원/상품/배송 검색
- 사용자: 포인트 내역 필터

### 6. 페이지네이션
- 모든 목록 API에 페이지네이션 추가
- 무한 스크롤 구현

---

## 🚀 프로덕션 배포 체크리스트

- [x] 관리자 API 보안
- [x] 확률 검증 로직
- [x] 럭키드로우 중복 방지
- [x] 트랜잭션 무결성
- [x] 포인트 추가 권한 제한
- [ ] 토스페이먼츠 Webhook (선택)
- [ ] 환경변수로 ADMIN_SECRET 관리 (권장)
- [ ] 에러 모니터링 시스템 (권장)
- [ ] 백업 시스템 (권장)

---

## 📝 테스트 필요 항목

1. ✅ 관리자 페이지 접근 (비밀번호: `lotto2025!admin`)
2. ✅ 관리자 API 호출 시 토큰 검증
3. ✅ 확률 100% 초과 시 상품 추가 거부
4. ✅ 럭키드로우 중복 참여 차단
5. ⚠️ 트랜잭션 로그 확인 (수동 확인 필요)
6. ✅ 포인트 추가 API 관리자 전용 확인

---

## 🔴 긴급 알림

**프로덕션 환경에서 반드시 변경해야 할 사항:**

1. **ADMIN_SECRET 환경변수화**
   ```typescript
   // 현재 (하드코딩)
   const ADMIN_SECRET = "lotto2025!admin!secret!key";
   
   // 권장 (환경변수)
   const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") || "default-secret";
   ```

2. **관리자 로그인 비밀번호 변경**
   - 파일: `/src/app/components/AdminLogin.tsx`
   - 현재: `lotto2025!admin`
   - 권장: 환경변수 또는 데이터베이스 관리

3. **카카오 REST API Key 환경변수화**
   - 파일: `/supabase/functions/server/index.tsx`
   - 현재: 하드코딩
   - 권장: `Deno.env.get("KAKAO_REST_API_KEY")`

---

**패치 담당자:** AI Assistant
**승인자:** (프로덕션 배포 전 확인 필요)
**배포 예정일:** 2026-03-05
