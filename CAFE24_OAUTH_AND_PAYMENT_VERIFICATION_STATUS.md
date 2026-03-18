# Cafe24 OAuth And Payment Verification Status

이 문서는 현재 프로젝트에서 `Cafe24 결제 후 포인트 적립`이 어떻게 처리되고 있는지,  
왜 문제가 있었는지, 어떤 작업을 진행했는지, 현재 어디까지 해결되었는지를 정리한 기록입니다.

작성 기준일:

- 2026-03-18

---

## 1. 문제의 본질

프로젝트는 원래 다음 흐름으로 포인트를 적립하도록 설계되어 있었습니다.

1. 사용자가 포인트 충전 버튼 클릭
2. 서버가 `internalOrderId`를 생성하고 `charge_requests`에 저장
3. 사용자를 Cafe24 결제 URL로 이동
4. 결제 완료 후 사용자가 `PaymentSuccess` 화면으로 복귀
5. 백엔드가 Cafe24 주문 정보를 다시 조회
6. 실제 결제가 확인되면 포인트 적립

즉 이 구조는 `결제 완료 리다이렉트만 보고 바로 적립`하는 구조가 아니라,  
반드시 `Cafe24 주문 검증`을 거친 후 적립하는 구조입니다.

---

## 2. 왜 포인트가 적립되지 않았나

초기 원인은 UI 문제가 아니라 `서버 검증 인프라 미완성`이었습니다.

### 확인된 사실

- 프론트는 결제 성공 후 `/payment/success` 페이지에서 검증 API를 호출하고 있었음
- 사용자 데이터 조회 로그상 포인트는 계속 기존 값으로 돌아오고 있었음
- 즉 프론트 표시 문제보다 `백엔드에서 실제 적립이 일어나지 않는 상황`이었음

### 실제 원인

백엔드가 Cafe24 주문 검증을 위해 아래 값들을 필요로 했습니다.

- `CAFE24_MALL_ID`
- `CAFE24_ADMIN_ACCESS_TOKEN`
- `CAFE24_SHOP_NO`

하지만 초기 상태에서는 `CAFE24_ADMIN_ACCESS_TOKEN`을 고정 secret처럼 넣는 구조였고,  
정작 Cafe24 Admin API용 OAuth 연동 자체가 완료되지 않은 상태였습니다.

즉:

- 결제 링크 이동은 가능
- 결제 완료 후 복귀도 가능
- 그러나 주문 검증용 Admin API 인증은 불가능
- 결과적으로 포인트 적립 불가

---

## 3. 중간에 확인한 사항들

### 3-1. 관리자 로그인 문제

초기에는 관리자 로그인에서:

- `Unexpected non-whitespace character after JSON`
- `401 missing authorization header`

같은 문제가 있었습니다.

이건 비밀번호 문제가 아니라:

- Supabase 함수 라우트 이름 불일치
- 프론트가 호출하는 함수명과 실제 배포된 함수명이 다름

때문이었습니다.

해결:

- 함수 이름을 `make-server-53dba95c`로 정렬
- Supabase 재배포
- 이후 관리자 로그인 정상화

이 작업은 Cafe24 결제 문제와는 별개지만, 배포 기반을 정리하는 과정에서 먼저 해결됐습니다.

---

### 3-2. 포인트 화면 갱신 문제

결제 후 포인트가 안 보이는 원인 중 일부는 프론트 갱신 타이밍 문제도 있었습니다.

해결:

- `PaymentSuccess.tsx`에서 `credited` 상태일 때 `refreshUserData()` 호출
- `Points.tsx` 진입 시 최신 포인트 재조회 추가

이건 UI 갱신 개선이었고,  
결제 검증 실패 자체를 해결하는 핵심은 아니었습니다.

---

## 4. Cafe24 OAuth 연동에서 실제로 무슨 일이 있었나

Cafe24 Admin API 주문 조회를 쓰려면 OAuth 2.0 방식으로 토큰을 받아야 합니다.

필요한 개념:

- `authorization code`: 1회용 임시 코드
- `access_token`: 실제 Admin API 호출용 토큰
- `refresh_token`: access token 만료 시 재발급용 토큰

### 실제 진행 과정

1. Cafe24 Developers에서 일반 앱 생성
2. 앱 기본정보 입력
   - `App URL = https://centbox.netlify.app`
   - `Redirect URI = https://centbox.netlify.app`
   - 권한: `Order > Read`
3. `kit888` 쇼핑몰 기준 접근 허용
4. OAuth authorize URL 접속
5. `code=...` 확보
6. 그 code로 토큰 교환

중간에 막혔던 이유:

- `redirect_uri invalid`
- `invalid_request`
- `401`

등이 있었는데, 실제로는 아래를 맞추는 과정이었습니다.

- Redirect URI 일치
- `kit888` 쇼핑몰 컨텍스트 접근 허용
- 토큰 발급 시 `Basic client_id:client_secret` 인증 방식 적용

---

## 5. 최종적으로 발급에 성공한 값

최종적으로 Cafe24에서 아래 정보 확보에 성공했습니다.

- `access_token`
- `refresh_token`
- `mall_id = kit888`
- `shop_no = 1`
- `scopes = ["mall.read_order"]`

즉 이제 서버가 `kit888` 쇼핑몰 주문을 Admin API로 조회할 수 있는 기반이 생겼습니다.

---

## 6. 코드에서 무엇을 바꿨나

핵심 수정 파일:

- [index.ts](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/functions/make-server-53dba95c/index.ts)

### 변경 전

기존 구조는:

- `CAFE24_ADMIN_ACCESS_TOKEN` 하나를 Supabase secret에서 읽음
- 만료되면 그대로 깨지는 구조
- refresh token 개념 없음

즉:

- 초기 1회는 될 수도 있어도
- 장기 운영 불가능

### 변경 후

아래 구조를 추가했습니다.

#### 1. OAuth 설정용 환경변수 추가

- `CAFE24_CLIENT_ID`
- `CAFE24_CLIENT_SECRET`
- `CAFE24_REDIRECT_URI`
- `CAFE24_MALL_ID`
- `CAFE24_SHOP_NO`

#### 2. 토큰 저장 구조 추가

서버가 아래 값을 저장하고 읽을 수 있게 설계했습니다.

- `accessToken`
- `refreshToken`
- `expiresAt`
- `refreshTokenExpiresAt`
- `mallId`
- `shopNo`

#### 3. 토큰 자동 갱신 로직 추가

`fetchCafe24Order()` 호출 전에:

- 유효한 access token이 있으면 그대로 사용
- access token 만료 시 refresh token으로 재발급
- 새 토큰으로 업데이트 후 주문 조회

즉 이제는 `고정 access token`만 믿는 구조가 아닙니다.

#### 4. 관리자용 OAuth 엔드포인트 추가

백엔드에 아래 엔드포인트를 추가했습니다.

- `GET /make-server-53dba95c/admin/cafe24/oauth/status`
- `POST /make-server-53dba95c/admin/cafe24/oauth/exchange-code`
- `POST /make-server-53dba95c/admin/cafe24/oauth/refresh`

이 엔드포인트들은 관리자 인증이 있어야만 호출됩니다.

목적:

- 최초 code 교환
- 현재 토큰 상태 점검
- 강제 refresh

---

## 7. Supabase에 어떤 secret이 들어갔나

이번 작업을 통해 Supabase 쪽에 아래 값들을 반영했습니다.

### 기존 결제 관련 값

- `CAFE24_CHARGE_URL_*`
- `CAFE24_RETURN_BASE_URL`
- `ALLOWED_ORIGINS`

### 이번 OAuth 관련 값

- `CAFE24_CLIENT_ID`
- `CAFE24_CLIENT_SECRET`
- `CAFE24_REDIRECT_URI=https://centbox.netlify.app`
- `CAFE24_MALL_ID=kit888`
- `CAFE24_SHOP_NO=1`

### 최종 발급된 실제 토큰 값

- `CAFE24_ADMIN_ACCESS_TOKEN`
- `CAFE24_REFRESH_TOKEN`
- `CAFE24_ACCESS_TOKEN_EXPIRES_AT`
- `CAFE24_REFRESH_TOKEN_EXPIRES_AT`

즉 지금은 최초 발급된 토큰 세트가 이미 서버에 들어가 있는 상태입니다.

---

## 8. 현재 결제 검증은 어떻게 동작하나

현재 흐름은 이렇습니다.

1. 사용자가 포인트 충전 시작
2. 서버가 내부 주문 생성
3. Cafe24 결제 진행
4. 결제 성공 후 `PaymentSuccess`에서 검증 요청
5. 서버가 `fetchCafe24Order()` 호출
6. 이때:
   - access token 유효하면 그대로 주문 조회
   - access token 만료면 refresh token으로 자동 재발급
   - 그 후 주문 조회
7. 주문 상태와 금액이 맞으면 포인트 적립
8. 적립 후 `point_ledger`, `charge_requests`, 사용자 잔액 갱신

즉 이제 구조상으로는 `장기 운영 가능한 방향`으로 넘어갔습니다.

---

## 9. 현재 상태 판단

현재 상태는 다음과 같이 판단합니다.

### 완료된 것

- Cafe24 Developers 앱 생성
- `kit888` 쇼핑몰 컨텍스트 접근 허용
- OAuth authorization code 발급 성공
- access token / refresh token 발급 성공
- Supabase secrets 반영 완료
- 백엔드 자동 갱신 구조 반영
- Supabase 함수 재배포 완료

### 남아 있는 것

- 실제 100원 결제를 한 번 더 진행해서 최종 적립 확인
- 필요하면 Git 커밋 및 push

즉 현재는 `설정/구조 작업`은 거의 끝났고,  
이제 남은 것은 `실결제 재검증`입니다.

---

## 10. 왜 이 방향이 맞는가

이 프로젝트는 `결제 성공 URL만 보고 바로 적립`하는 구조보다  
`Cafe24 주문 상태를 서버가 다시 조회하고 적립`하는 구조가 훨씬 맞습니다.

이유:

- 중복 적립 방지
- 금액 위변조 방지
- 실제 결제 여부 검증 가능
- 장기 운영 가능

즉 중간에 잠깐 우회 아이디어도 검토했지만,  
최종적으로는 `Cafe24 OAuth + Admin API 검증` 경로를 살리는 것이 맞다고 판단했고,  
지금도 그 판단은 유효합니다.

---

## 11. 지금 사용자가 이해해야 할 핵심 한 줄

현재 처리는 이렇게 정리할 수 있습니다.

`Cafe24 결제를 포인트 적립과 연결하기 위해, OAuth로 Admin API 토큰을 발급받고, 그 토큰을 서버가 자동 갱신하면서 주문을 검증한 뒤 포인트를 적립하도록 구조를 정비했다.`

---

## 12. 다음 권장 작업

1. `100원` 결제 재테스트
2. `PaymentSuccess` 복귀 확인
3. 포인트 증가 확인
4. 이상 없으면 Git 커밋 및 push

---

## 13. 관련 파일

- [supabase/functions/make-server-53dba95c/index.ts](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/functions/make-server-53dba95c/index.ts)
- [src/app/pages/PaymentSuccess.tsx](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/src/app/pages/PaymentSuccess.tsx)
- [src/app/pages/Points.tsx](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/src/app/pages/Points.tsx)
- [CAFE24_ADMIN_API_SECRET_SETUP.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ADMIN_API_SECRET_SETUP.md)
