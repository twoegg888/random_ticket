# Cafe24 Order-Linked Setup Runbook

This runbook covers the remaining setup steps that require Supabase and Cafe24 access.

---

## 1. What Is Already Done Locally

The workspace already contains:

- architecture spec:
  [CAFE24_ORDER_LINKED_ARCHITECTURE.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ORDER_LINKED_ARCHITECTURE.md)
- API spec:
  [CAFE24_ORDER_LINKED_API.md](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/CAFE24_ORDER_LINKED_API.md)
- SQL schema:
  [cafe24_order_linked_schema.sql](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/cafe24_order_linked_schema.sql)
- env template:
  [.env.example](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/.env.example)
- build fix for `figma:asset` and `lucide-react`

The frontend build now succeeds locally.

---

## 2. Remaining External Steps

These require access outside the local workspace:

1. Apply SQL to Supabase
2. Set Supabase Edge Function secrets
3. Create or confirm Cafe24 charge product URLs
4. Obtain one real Cafe24 payment return payload
5. Lock final order ID mapping fields
6. Run end-to-end verification

---

## 3. Supabase SQL Apply

Open Supabase SQL Editor and execute:

[cafe24_order_linked_schema.sql](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/cafe24_order_linked_schema.sql)

Expected objects:

- `public.charge_requests`
- `public.payment_events`
- `public.point_ledger`
- `public.order_mappings`
- `public.reconciliation_jobs`
- `public.user_point_balances`

Verification query:

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

## 4. Supabase Secrets

Set the following Edge Function secrets:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

CAFE24_MALL_ID
CAFE24_ADMIN_ACCESS_TOKEN
CAFE24_SHOP_NO
CAFE24_RETURN_BASE_URL

CAFE24_CHARGE_URL_100
CAFE24_CHARGE_URL_10000
CAFE24_CHARGE_URL_30000
CAFE24_CHARGE_URL_50000
CAFE24_CHARGE_URL_100000
CAFE24_CHARGE_URL_200000
CAFE24_CHARGE_URL_300000
CAFE24_CHARGE_URL_400000
CAFE24_CHARGE_URL_500000
```

Reference:

[.env.example](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/.env.example)

---

## 5. Cafe24 Charge Product Rules

Each charge amount must map to one stable Cafe24 checkout/product URL.

Recommended mapping:

- `charge_10000`
- `charge_30000`
- `charge_50000`
- `charge_100000`
- `charge_200000`
- `charge_300000`
- `charge_400000`
- `charge_500000`

Recommended product setup:

- non-shipping or digital product if supported
- fixed amount, fixed product code
- no ambiguity across products

---

## 6. Payment Return Payload Capture

This is the most important live validation step.

Perform one test payment and capture:

- success return URL
- full query string
- callback payload if available
- Cafe24 order ID
- any merchant reference field

At that point, confirm which fields contain:

- internal order ID
- Cafe24 order ID

Then lock the backend parsing in:

[index.tsx](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/supabase/functions/server/index.tsx)

And the frontend success page parsing in:

[PaymentSuccess.tsx](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/src/app/pages/PaymentSuccess.tsx)

---

## 7. End-to-End Test Plan

### Test 1. Create Charge Request

Trigger charge from:

[Points.tsx](/C:/Users/HOME_UEFI/Desktop/Implement%20Code/src/app/pages/Points.tsx)

Expected:

- `charge_requests.status = pending`
- `order_mappings.mapping_status = pending`
- response contains `internalOrderId` and `checkoutUrl`

### Test 2. Return From Cafe24

Complete payment and return to:

`/payment/success`

Expected:

- `payment_events` contains `cafe24_redirect`
- charge moves to `checkout_started` or `payment_detected`

### Test 3. Verify Payment

Expected:

- `payments/cafe24/verify` succeeds
- `point_ledger` row created
- `charge_requests.status = credited`
- existing KV `userdata:{kakaoId}` points are incremented

### Test 4. Duplicate Verify

Call verify again for the same order.

Expected:

- no duplicate `point_ledger`
- response may return `alreadyCredited: true`

### Test 5. Mismatch / Failure

Use an invalid or unpaid order.

Expected:

- charge not credited
- failure stored in `charge_requests.failed_reason`

---

## 8. Post-Go-Live Work

Still required after first successful E2E:

- callback signature validation
- daily reconciliation job
- refund reversal flow
- admin monitoring screen
- alerting for `failed` and long-running `payment_detected` orders

---

## 9. Current Blockers

The local workspace is ready, but these actions cannot be executed here without external access:

- applying SQL to remote Supabase
- setting remote secrets
- creating or confirming Cafe24 charge URLs
- executing a real Cafe24 payment test

Those are the remaining steps to complete the rollout.
