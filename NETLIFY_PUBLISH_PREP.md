# Netlify Publish Prep

이 프로젝트는 `git push -> Netlify build/deploy` 방식으로 운영합니다.

## Build Settings

- Production branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

`netlify.toml` 기준으로 SPA 라우팅은 `/* -> /index.html (200)` 규칙을 사용합니다.

## Netlify Environment Variables

프론트 공개 설정은 Netlify에 등록합니다.

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_KAKAO_REST_API_KEY`
- `NODE_VERSION=20`

## Supabase Function Secrets

민감값은 Netlify가 아니라 Supabase Functions Secrets에 둡니다.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET`
- `KAKAO_REST_API_KEY`
- `TOSS_SECRET_KEY`
- `ALLOWED_ORIGINS`
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

## Kakao Settings

Kakao Developers 콘솔 Redirect URI 예시:

- `https://<your-netlify-domain>.netlify.app/login/callback`
- `https://<your-custom-domain>/login/callback`

프론트는 `VITE_KAKAO_REST_API_KEY`, 서버는 `KAKAO_REST_API_KEY`를 사용합니다.

## Cafe24 Settings

- `CAFE24_RETURN_BASE_URL`은 실제 프론트 성공 페이지와 일치해야 합니다.
- 예시: `https://<your-netlify-domain>.netlify.app/payment/success`
- 결제 링크 값은 충전 금액별 URL과 정확히 매칭되어야 합니다.

## Release Checklist

1. 필요한 `VITE_*` 값이 Netlify에 등록돼 있는지 확인
2. Supabase Secrets가 운영값으로 채워져 있는지 확인
3. Kakao Redirect URI와 Netlify 도메인이 일치하는지 확인
4. `main` 브랜치에 push
5. Netlify 배포 로그에서 env 누락 여부 확인
