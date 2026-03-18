# Cafe24 Admin API Secret Setup

이 문서는 `100원 결제는 되었는데 포인트가 적립되지 않는 문제`를 해결하기 위한 설정 가이드입니다.

현재 이 프로젝트는 `Cafe24 결제 완료` 후, `Cafe24 Admin API`로 주문 상태를 다시 조회해서 실제 결제가 확인되면 포인트를 적립합니다.

즉:

1. 결제 URL 생성
2. 사용자가 Cafe24에서 결제
3. 서버가 Cafe24 Admin API로 주문 조회
4. 결제 확인되면 포인트 적립

지금 문제는 `3번`에 필요한 설정이 빠져 있을 가능성이 높습니다.

---

## 1. 지금 해야 하는 일

Supabase Secrets에 아래 3개를 추가해야 합니다.

```env
CAFE24_MALL_ID=여기에_카페24_몰아이디
CAFE24_ADMIN_ACCESS_TOKEN=여기에_Cafe24_Admin_API_토큰
CAFE24_SHOP_NO=1
```

---

## 2. 어디에 넣어야 하나

`Netlify`가 아니라 `Supabase Dashboard`에 넣어야 합니다.

경로:

1. `https://supabase.com/dashboard`
2. 프로젝트 선택
3. 왼쪽 메뉴 `Edge Functions`
4. `Secrets`
5. `Add new secret`

각각 하나씩 추가:

1. Key: `CAFE24_MALL_ID`
   Value: Cafe24 몰 아이디

2. Key: `CAFE24_ADMIN_ACCESS_TOKEN`
   Value: Cafe24 Admin API access token

3. Key: `CAFE24_SHOP_NO`
   Value: `1`

---

## 3. 각 값이 무슨 뜻인가

### CAFE24_MALL_ID

Cafe24 쇼핑몰 아이디입니다.

예시:

- API 주소가 `https://myshop.cafe24api.com/...` 라면
- `CAFE24_MALL_ID=myshop`

보통 `mall_id`라는 이름으로 보입니다.

---

### CAFE24_ADMIN_ACCESS_TOKEN

Cafe24 Admin API를 호출할 때 쓰는 토큰입니다.

이 프로젝트 서버는 이 값을 이용해서 아래처럼 주문 조회를 합니다.

```text
GET https://{mall_id}.cafe24api.com/api/v2/admin/orders/{order_id}
Authorization: Bearer {access_token}
```

즉, `client_id`나 `client_secret`가 아니라 `실제로 발급된 access_token`이 필요합니다.

---

### CAFE24_SHOP_NO

기본몰이면 대부분 `1`입니다.

특별히 멀티샵을 쓰는 경우가 아니면 아래처럼 넣으면 됩니다.

```env
CAFE24_SHOP_NO=1
```

---

## 4. Cafe24에서 뭘 찾아야 하나

Cafe24 Admin API를 이미 발급받았다면, 보통 응답값이나 앱 설정 정보에 아래 값들이 있습니다.

```json
{
  "access_token": "발급된_토큰",
  "mall_id": "쇼핑몰아이디",
  "shop_no": "1"
}
```

이걸 Supabase Secret에 이렇게 옮기면 됩니다.

```env
CAFE24_MALL_ID=mall_id 값
CAFE24_ADMIN_ACCESS_TOKEN=access_token 값
CAFE24_SHOP_NO=shop_no 값
```

즉 매핑은 아래와 같습니다.

- `mall_id` -> `CAFE24_MALL_ID`
- `access_token` -> `CAFE24_ADMIN_ACCESS_TOKEN`
- `shop_no` -> `CAFE24_SHOP_NO`

---

## 5. 내가 지금 헷갈리면 가장 간단한 기준

Cafe24 개발자 페이지에서 찾고 있는 값은 3개뿐입니다.

1. `mall_id`
2. `access_token`
3. `shop_no`

이 3개를 Supabase Secrets 이름에 맞춰 옮기면 끝입니다.

---

## 6. 추가 후 해야 하는 일

위 3개를 Supabase Secrets에 추가한 다음 해야 할 일:

1. Supabase Function 재배포
2. 다시 100원 결제 테스트
3. 포인트 적립 확인

---

## 7. 지금 바로 입력해야 하는 최종 형태

```env
CAFE24_MALL_ID=실제_mall_id
CAFE24_ADMIN_ACCESS_TOKEN=실제_access_token
CAFE24_SHOP_NO=1
```

---

## 8. 설정이 맞으면 어떻게 되나

설정이 맞으면 결제 후 서버가 Cafe24 주문을 조회할 수 있게 되고,
그때부터 포인트 적립이 정상 동작합니다.

즉 현재 문제는 거의 아래로 정리됩니다.

- 결제는 됨
- 하지만 서버가 Cafe24 주문 조회를 못 하고 있음
- 그래서 포인트 적립이 안 됨

---

## 9. 내가 끝나고 나서 할 일

이 파일 기준으로 Secret 3개를 다 넣은 뒤,
나에게 아래처럼 알려주면 됩니다.

```text
CAFE24_MALL_ID 넣었음
CAFE24_ADMIN_ACCESS_TOKEN 넣었음
CAFE24_SHOP_NO 넣었음
```

그러면 그 다음은 제가:

1. 재배포
2. 재테스트 관점 점검
3. 필요하면 추가 수정

까지 이어서 보겠습니다.
