# Cafe24 Order-Linked API

This document describes the new order-linked charge endpoints added for the Cafe24 payment flow.

Base URL:

```text
https://{projectId}.supabase.co/functions/v1/make-server-53dba95c
```

---

## Required Environment Variables

Server-side:

```text
CAFE24_MALL_ID=your-mall-id
CAFE24_ADMIN_ACCESS_TOKEN=your-cafe24-admin-access-token
CAFE24_SHOP_NO=1
CAFE24_RETURN_BASE_URL=https://your-app-domain.com/payment/success

CAFE24_CHARGE_URL_100=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_10000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_30000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_50000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_100000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_200000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_300000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_400000=https://your-cafe24-product-or-checkout-url
CAFE24_CHARGE_URL_500000=https://your-cafe24-product-or-checkout-url
```

---

## 1. Create Charge Request

`POST /payments/charges`

Request:

```json
{
  "amount": 10000,
  "productCode": "charge_10000",
  "kakaoId": "1234567890"
}
```

Response:

```json
{
  "success": true,
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "amount": 10000,
  "points": 10000,
  "productCode": "charge_10000",
  "checkoutUrl": "https://...",
  "expiresAt": "2026-03-17T12:30:00.000Z"
}
```

Purpose:

- Creates the internal charge order in Supabase
- Creates the pending internal-to-Cafe24 mapping row
- Returns a Cafe24 redirect URL

---

## 2. Record Redirect Completion

`POST /payments/cafe24/redirect-complete`

Request:

```json
{
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "cafe24OrderId": "20260317-000001",
  "query": {
    "internalOrderId": "CHG_1742190000000_ABCD1234"
  },
  "currentUrl": "https://your-app-domain.com/payment/success?internalOrderId=..."
}
```

Purpose:

- Stores the return event in `payment_events`
- Optionally links the Cafe24 order ID to the internal order
- Moves the charge into `checkout_started` if it was still pending

---

## 3. Record Callback

`POST /payments/cafe24/callback`

Request:

```json
{
  "eventType": "payment_complete",
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "cafe24OrderId": "20260317-000001",
  "...": "raw Cafe24 payload"
}
```

Purpose:

- Stores callback/webhook payload in `payment_events`
- Links the Cafe24 order to the internal order
- Moves charge to `payment_detected`

---

## 4. Verify Payment

`POST /payments/cafe24/verify`

Request:

```json
{
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "cafe24OrderId": "20260317-000001"
}
```

Success response:

```json
{
  "success": true,
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "cafe24OrderId": "20260317-000001",
  "status": "credited",
  "alreadyCredited": false
}
```

Pending response example:

```json
{
  "success": false,
  "status": "payment_detected",
  "verificationStatus": "not_paid_yet"
}
```

Purpose:

- Calls Cafe24 Admin API
- Confirms payment status and amount
- Writes `point_ledger`
- Updates existing KV-based user balance for app compatibility
- Marks the charge as `credited`

---

## 5. Get Charge Status

`GET /payments/charges/:internalOrderId`

Response:

```json
{
  "success": true,
  "internalOrderId": "CHG_1742190000000_ABCD1234",
  "status": "credited",
  "amount": 10000,
  "points": 10000,
  "cafe24OrderId": "20260317-000001",
  "paymentConfirmedAt": "2026-03-17T12:01:00.000Z",
  "creditedAt": "2026-03-17T12:01:02.000Z",
  "failedReason": null,
  "expiresAt": "2026-03-17T12:30:00.000Z"
}
```

Purpose:

- Used by the app success page to poll final result
- Lets the frontend remain read-only for payment completion

---

## Frontend Flow

1. `Points.tsx` calls `POST /payments/charges`
2. Frontend redirects to `checkoutUrl`
3. User returns to `/payment/success`
4. `PaymentSuccess.tsx` posts `redirect-complete`
5. `PaymentSuccess.tsx` calls `verify`
6. If not complete yet, `PaymentSuccess.tsx` polls `GET /payments/charges/:internalOrderId`

---

## Current Limitations

- Direct Cafe24 callback signature validation is not implemented yet
- Daily reconciliation job is not implemented yet
- Refund reversal flow is not implemented yet
- Final Cafe24 order identifier mapping may need adjustment depending on actual return payload
