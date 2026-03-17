# Cafe24 Order-Linked Execution Checklist

> 목적: 현재 워크스페이스에 반영된 주문연동형 결제 구조를 실제 Supabase + Cafe24 환경에 적용하고, 테스트 결과를 다시 코드에 반영하기 위한 실행 문서

---

## 1. 현재 완료된 상태

이 워크스페이스에는 이미 아래가 반영되어 있습니다.

- 주문연동형 아키텍처 문서
- API 문서
- Supabase SQL 스키마 초안
- Cafe24 주문연동형 백엔드 엔드포인트
- 포인트 충전 프론트 흐름 변경
- 성공 페이지 상태조회 흐름 변경
- 일반 Vite 빌드 통과

즉, 지금 남은 일은 외부 서비스 반영입니다.

---

## 2. 직접 해야 하는 작업

아래 작업은 직접 진행해야 합니다.

1. Supabase SQL 적용
2. Supabase secrets 설정
3. Cafe24 금액별 결제 URL 준비
4. 테스트 결제 1건 실행
5. 테스트 결과를 저에게 전달

---

## 3. Supabase SQL 적용 방법

### 3.1 이동 경로

1. Supabase Dashboard 로그인
2. 대상 프로젝트 선택
3. 좌측 메뉴에서 `SQL Editor` 이동

### 3.2 실행할 파일

아래 파일 내용을 그대로 실행합니다.

[cafe24_order_linked_schema.sql](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/cafe24_order_linked_schema.sql)

### 3.3 실행 후 확인할 테이블

아래 테이블이 생성되어야 합니다.

- `charge_requests`
- `payment_events`
- `point_ledger`
- `order_mappings`
- `reconciliation_jobs`

### 3.4 확인용 SQL

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'charge_requests',
    'payment_events',
    'point_ledger',
    'order_mappings',
    'reconciliation_jobs'
  )
order by table_name;
```

---

## 4. Supabase Secrets 설정 방법

### 4.1 이동 경로

1. Supabase Dashboard
2. 대상 프로젝트 선택
3. 좌측 메뉴에서 `Edge Functions`
4. `Secrets` 또는 `Project Settings > Edge Functions/Environment Variables` 이동

### 4.2 입력할 값

아래 값을 입력합니다.

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CAFE24_MALL_ID=your-cafe24-mall-id
CAFE24_ADMIN_ACCESS_TOKEN=your-cafe24-admin-access-token
CAFE24_SHOP_NO=1
CAFE24_RETURN_BASE_URL=https://your-app-domain.com/payment/success

CAFE24_CHARGE_URL_100=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_10000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_30000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_50000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_100000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_200000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_300000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_400000=https://your-cafe24-checkout-or-product-url
CAFE24_CHARGE_URL_500000=https://your-cafe24-checkout-or-product-url
```

참고 파일:

[.env.example](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/.env.example)

### 4.3 주의할 점

- `CAFE24_RETURN_BASE_URL`은 현재 앱의 성공 페이지 URL이어야 합니다.
- 각 `CAFE24_CHARGE_URL_*` 값은 금액별로 실제 결제 페이지 또는 상품 페이지여야 합니다.
- 운영 토큰과 테스트 토큰을 섞지 마세요.

---

## 5. Cafe24에서 준비할 것

### 5.1 금액별 충전 상품/결제 URL

최소한 아래 금액별 URL이 필요합니다.

- 100원
- 10,000원
- 30,000원
- 50,000원
- 100,000원
- 200,000원
- 300,000원
- 400,000원
- 500,000원

### 5.2 권장 기준

- 충전용 상품은 일반 상품과 혼동되지 않게 분리
- 가능하면 고정 금액 상품으로 운영
- 배송 개념이 섞이지 않도록 구성
- 상품명은 금액과 목적이 분명히 드러나도록 설정

예:

- `10000P 충전`
- `50000P 충전`
- `100000P 충전`

---

## 6. 테스트 결제 실행 방법

### 6.1 테스트 전 확인

아래가 준비되어 있어야 합니다.

- Supabase SQL 적용 완료
- Supabase secrets 입력 완료
- Cafe24 charge URL 입력 완료
- 앱 배포본 또는 로컬 테스트 환경에서 최신 코드 반영 완료

### 6.2 테스트 순서

1. 앱 로그인
2. 포인트 페이지 진입
3. `Charge Points` 버튼 클릭
4. 아무 금액이나 선택
5. Cafe24 결제 페이지로 이동되는지 확인
6. 실제 테스트 결제 1건 진행
7. 결제 완료 후 `/payment/success`로 돌아오는지 확인

---

## 7. 테스트 후 확인할 것

### 7.1 브라우저에서 확인

결제 완료 후 돌아온 주소창 URL 전체를 복사합니다.

필수:

- 전체 URL
- 쿼리스트링 전체

예:

```text
https://your-app-domain.com/payment/success?...전체 파라미터...
```

### 7.2 Supabase에서 확인

`SQL Editor` 또는 `Table Editor`에서 아래를 확인합니다.

#### `charge_requests`

확인할 항목:

- `internal_order_id`
- `status`
- `cafe24_order_id`
- `amount_krw`
- `points`
- `failed_reason`

#### `payment_events`

확인할 항목:

- 이벤트가 생성되었는지
- `source`
- `payload`

#### `point_ledger`

확인할 항목:

- 적립 row 생성 여부
- `entry_type = charge_credit`
- `internal_order_id`
- `cafe24_order_id`

---

## 8. 테스트 후 저에게 보내야 하는 정보

아래 4가지를 보내주면 됩니다.

1. 결제 완료 후 돌아온 전체 URL
2. `charge_requests`에서 해당 row 내용
3. `payment_events`에서 해당 payload 내용
4. `point_ledger` row가 생겼는지 여부

가능하면 아래 형식으로 보내면 됩니다.

```text
1. Return URL:
https://...

2. charge_requests:
status=...
internal_order_id=...
cafe24_order_id=...
failed_reason=...

3. payment_events:
source=...
payload=...

4. point_ledger:
created / not created
```

---

## 9. 테스트 결과별 대응

### 경우 1. 결제 완료 후 포인트 적립 성공

다음 단계:

- 실제 파라미터명을 코드에 고정
- 운영용 예외 처리 보강
- 환불/재대사 로직 추가

### 경우 2. 결제는 됐는데 포인트 적립 실패

대부분 아래 중 하나입니다.

- `internalOrderId`가 복귀 파라미터로 안 돌아옴
- `cafe24OrderId` 필드명이 예상과 다름
- Cafe24 Admin API 조회 결과 필드명이 다름
- amount 비교 필드가 예상과 다름

이 경우:

- 위 8번 정보 보내주시면 제가 코드 맞춤 수정 진행

### 경우 3. Cafe24 페이지로 이동 자체가 안 됨

확인할 것:

- `CAFE24_CHARGE_URL_*` 값 입력 여부
- URL 오타 여부
- 앱에서 해당 금액 상품코드가 맞는지

---

## 10. 지금 바로 하면 되는 순서

아래 순서로 진행하면 됩니다.

1. Supabase SQL Editor에서 [cafe24_order_linked_schema.sql](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/cafe24_order_linked_schema.sql) 실행
2. Supabase secrets 입력
3. Cafe24 금액별 charge URL 준비 및 입력
4. 앱에서 테스트 결제 1건 실행
5. 결제 후 돌아온 URL과 DB 결과를 저에게 전달

---

## 11. 참고 문서

- [CAFE24_ORDER_LINKED_ARCHITECTURE.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ORDER_LINKED_ARCHITECTURE.md)
- [CAFE24_ORDER_LINKED_API.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ORDER_LINKED_API.md)
- [CAFE24_ORDER_LINKED_SETUP_RUNBOOK.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ORDER_LINKED_SETUP_RUNBOOK.md)
- [.env.example](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/.env.example)
