# Netlify Publish Prep

이 프로젝트는 `Netlify + Supabase + Kakao + Cafe24` 조합으로 운영됩니다.
Netlify에는 프론트엔드 정적 산출물만 배포하고, 인증/결제/데이터 처리는 Supabase Functions가 담당합니다.

## 1. Netlify 프로젝트 생성

GitHub 저장소 `twoegg888/random_ticket`를 Netlify에 연결합니다.

설정값:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

현재 저장소의 [netlify.toml](./netlify.toml)에 동일한 값이 반영되어 있습니다.

## 2. Netlify에서 확인할 것

- Production branch: `main`
- Deploy previews: 필요하면 활성화
- Custom domain: 사용할 경우 먼저 연결

SPA 라우팅은 아래 규칙으로 처리됩니다.

- `/* -> /index.html (200)`

## 3. Netlify에 넣는 값

이 저장소는 프론트에서 Supabase 공개 키를 코드로 직접 사용하고 있으므로, Netlify에 반드시 넣어야 하는 앱 비밀키는 없습니다.

Netlify에서 관리할 것을 추천하는 값:

- `NODE_VERSION=20`

## 4. Supabase에 넣는 값

실제 운영에 필요한 민감 정보는 Netlify가 아니라 Supabase Functions 환경에 있어야 합니다.

필수:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET`
- `CAFE24_MALL_ID`
- `CAFE24_ADMIN_ACCESS_TOKEN`
- `CAFE24_SHOP_NO`
- `CAFE24_RETURN_BASE_URL`
- `CAFE24_CHARGE_URL_100`
- `CAFE24_CHARGE_URL_10000`
- `CAFE24_CHARGE_URL_30000`
- `CAFE24_CHARGE_URL_50000`
- `CAFE24_CHARGE_URL_100000`
- `CAFE24_CHARGE_URL_200000`
- `CAFE24_CHARGE_URL_300000`
- `CAFE24_CHARGE_URL_400000`
- `CAFE24_CHARGE_URL_500000`

권장:

- `ALLOWED_ORIGINS=https://your-netlify-domain.netlify.app,https://your-custom-domain.com`

`CAFE24_RETURN_BASE_URL` 예시:

- `https://your-netlify-domain.netlify.app/payment/success`

## 5. Kakao 설정

카카오 개발자 콘솔에 Redirect URI를 운영 도메인으로 등록해야 합니다.

예시:

- `https://your-netlify-domain.netlify.app/login/callback`
- `https://your-custom-domain.com/login/callback`

## 6. Cafe24 설정

결제 완료 후 돌아오는 URL이 Netlify 운영 도메인과 일치해야 합니다.

확인할 것:

- Cafe24 checkout URL이 각 충전 금액별로 정확한지
- 결제 완료 후 `payment/success`로 복귀하는지
- Cafe24 주문 조회 권한이 현재 Admin API 토큰에 있는지

## 7. 배포 후 점검

배포 직후 아래 순서로 점검합니다.

1. `/` 접속
2. `/login` 진입 후 카카오 로그인
3. `/points`에서 충전 진입
4. `payment/success` 리다이렉트 확인
5. 포인트 반영 확인
6. 티켓 구매 확인
7. `/admin/login` 관리자 로그인 확인

## 8. 현재 코드 기준 상태

완료:

- Netlify 빌드 설정 반영
- SPA rewrite 설정 반영
- 관리자 비밀번호의 프론트 하드코딩 제거
- 관리자 인증을 백엔드 검증 방식으로 전환
- 운영용 CORS 제한 환경변수 지원 추가

남은 일:

- Netlify 실제 사이트 생성
- Supabase 환경변수 입력
- Kakao Redirect URI 등록
- Cafe24 return URL/checkout URL 검증
- 실배포 후 실제 결제/로그인 테스트
