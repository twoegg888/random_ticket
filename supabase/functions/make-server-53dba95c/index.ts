import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

const app = new Hono();

// Supabase 클라이언트 초기화
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ChargeCatalogItem = {
  productCode: string;
  amount: number;
  points: number;
  productName: string;
  checkoutEnvKey: string;
};

const CHARGE_CATALOG: ChargeCatalogItem[] = [
  { productCode: "charge_100", amount: 100, points: 100, productName: "100P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_100" },
  { productCode: "charge_10000", amount: 10000, points: 10000, productName: "10000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_10000" },
  { productCode: "charge_30000", amount: 30000, points: 30000, productName: "30000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_30000" },
  { productCode: "charge_50000", amount: 50000, points: 55000, productName: "50000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_50000" },
  { productCode: "charge_100000", amount: 100000, points: 112000, productName: "100000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_100000" },
  { productCode: "charge_200000", amount: 200000, points: 230000, productName: "200000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_200000" },
  { productCode: "charge_300000", amount: 300000, points: 355000, productName: "300000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_300000" },
  { productCode: "charge_400000", amount: 400000, points: 500000, productName: "400000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_400000" },
  { productCode: "charge_500000", amount: 500000, points: 625000, productName: "500000P Charge", checkoutEnvKey: "CAFE24_CHARGE_URL_500000" },
];

const CAFE24_MALL_ID = Deno.env.get("CAFE24_MALL_ID") || "";
const CAFE24_CLIENT_ID = Deno.env.get("CAFE24_CLIENT_ID") || "";
const CAFE24_CLIENT_SECRET = Deno.env.get("CAFE24_CLIENT_SECRET") || "";
const CAFE24_REDIRECT_URI = Deno.env.get("CAFE24_REDIRECT_URI") || "";
const CAFE24_ADMIN_ACCESS_TOKEN = Deno.env.get("CAFE24_ADMIN_ACCESS_TOKEN") || "";
const CAFE24_REFRESH_TOKEN = Deno.env.get("CAFE24_REFRESH_TOKEN") || "";
const CAFE24_ACCESS_TOKEN_EXPIRES_AT = Deno.env.get("CAFE24_ACCESS_TOKEN_EXPIRES_AT") || "";
const CAFE24_REFRESH_TOKEN_EXPIRES_AT = Deno.env.get("CAFE24_REFRESH_TOKEN_EXPIRES_AT") || "";
const CAFE24_SHOP_NO = Deno.env.get("CAFE24_SHOP_NO") || "1";
const CAFE24_RETURN_BASE_URL = Deno.env.get("CAFE24_RETURN_BASE_URL") || "";
const CAFE24_TOKEN_STORE_KEY = "cafe24:oauth_tokens";

type Cafe24TokenStore = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
  mallId: string;
  shopNo: string;
  userId?: string;
  scopes?: string[];
  issuedAt?: string;
  updatedAt: string;
};

function getChargeCatalogItem(productCode?: string | null, amount?: number | null): ChargeCatalogItem | null {
  if (productCode) {
    const byCode = CHARGE_CATALOG.find((item) => item.productCode === productCode);
    if (byCode) return byCode;
  }

  if (typeof amount === "number") {
    const byAmount = CHARGE_CATALOG.find((item) => item.amount === amount);
    if (byAmount) return byAmount;
  }

  return null;
}

function generateInternalOrderId(): string {
  return `CHG_${Date.now()}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function buildCheckoutUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function getConfiguredCheckoutUrl(item: ChargeCatalogItem, internalOrderId: string, kakaoId: string): string | null {
  const baseUrl = Deno.env.get(item.checkoutEnvKey);
  if (!baseUrl) return null;

  return buildCheckoutUrl(baseUrl, {
    internalOrderId,
    productCode: item.productCode,
    amount: String(item.amount),
    points: String(item.points),
    kakaoId,
    returnUrl: CAFE24_RETURN_BASE_URL || "",
  });
}

function getAppOrigin(c: any): string {
  const origin = c.req.header("Origin");
  if (origin) return origin;

  const forwardedProto = c.req.header("x-forwarded-proto") || "https";
  const forwardedHost = c.req.header("x-forwarded-host") || c.req.header("host");
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return "http://localhost:5173";
}

function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") || "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeCafe24OrderId(payload: any): string | null {
  return payload?.cafe24OrderId || payload?.cafe24_order_id || payload?.orderId || payload?.order_id || null;
}

function extractCafe24PaymentStatus(order: any): string {
  return String(order?.payment_status || order?.paymentStatus || order?.paid || order?.status || "").toLowerCase();
}

function extractCafe24OrderStatus(order: any): string {
  return String(order?.order_status || order?.orderStatus || "").toLowerCase();
}

function extractCafe24PaidAmount(order: any): number | null {
  const raw =
    order?.actual_payment_amount?.payment_amount ??
    order?.initial_order_amount?.payment_amount ??
    order?.payment_amount ??
    order?.actual_payment_amount ??
    order?.paid_amount ??
    order?.payed_amount ??
    order?.amount;
  if (raw === null || raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function isCafe24Paid(order: any): boolean {
  const paymentStatus = extractCafe24PaymentStatus(order);
  if (paymentStatus === "t" || paymentStatus === "paid" || paymentStatus === "payment_confirmed") {
    return true;
  }

  const paidFlag = String(order?.paid || "").toLowerCase();
  return paidFlag === "t" || paidFlag === "true" || paidFlag === "paid";
}

function isCafe24OrderCreditable(order: any): boolean {
  const orderStatus = extractCafe24OrderStatus(order);
  if (!orderStatus) return true;

  const blockedKeywords = ["cancel", "refund", "return", "exchange", "failed"];
  return !blockedKeywords.some((keyword) => orderStatus.includes(keyword));
}

async function ensureChargeUserData(kakaoId: string) {
  let userDataStr = await kv.get(`userdata:${kakaoId}`);

  if (!userDataStr) {
    const newUserData = {
      userId: `kakao_${kakaoId}`,
      userName: "사용자",
      kakaoId,
      points: 0,
      winningTickets: [],
      transactions: [],
      exchangeTickets: [],
      luckyDrawEntries: [],
      createdAt: new Date().toISOString(),
    };
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(newUserData));
    userDataStr = JSON.stringify(newUserData);
  }

  return JSON.parse(userDataStr);
}

async function appendChargeLedgerAndBalance(params: {
  internalOrderId: string;
  cafe24OrderId: string | null;
  kakaoId: string;
  points: number;
  description: string;
}) {
  const existingLedger = await supabase
    .from("point_ledger")
    .select("id")
    .eq("internal_order_id", params.internalOrderId)
    .eq("entry_type", "charge_credit")
    .maybeSingle();

  if (existingLedger.data) {
    return { alreadyCredited: true };
  }

  const ledgerInsert = await supabase.from("point_ledger").insert({
    user_kakao_id: params.kakaoId,
    entry_type: "charge_credit",
    delta_points: params.points,
    internal_order_id: params.internalOrderId,
    cafe24_order_id: params.cafe24OrderId,
    description: params.description,
  });

  if (ledgerInsert.error) {
    throw new Error(`Failed to insert point ledger: ${ledgerInsert.error.message}`);
  }

  const userData = await ensureChargeUserData(params.kakaoId);
  userData.points += params.points;
  userData.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    type: "charge",
    amount: params.points,
    description: params.description,
    createdAt: new Date().toISOString(),
    relatedId: params.internalOrderId,
  });

  await kv.set(`userdata:${params.kakaoId}`, JSON.stringify(userData));
  return { alreadyCredited: false, newBalance: userData.points };
}

function toIsoStringOrNull(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

async function getCafe24TokenStore(): Promise<Cafe24TokenStore | null> {
  const stored = await kv.get(CAFE24_TOKEN_STORE_KEY);
  if (!stored) return null;
  return typeof stored === "string" ? JSON.parse(stored) : stored;
}

async function saveCafe24TokenStore(tokenStore: Cafe24TokenStore): Promise<void> {
  await kv.set(CAFE24_TOKEN_STORE_KEY, tokenStore);
}

function isTokenExpired(expiresAt?: string, safetyWindowMs = 60_000): boolean {
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return true;
  return Date.now() + safetyWindowMs >= expiry;
}

async function requestCafe24Token(params: {
  grantType: "authorization_code" | "refresh_token";
  code?: string;
  refreshToken?: string;
}): Promise<Cafe24TokenStore> {
  if (!CAFE24_MALL_ID || !CAFE24_CLIENT_ID || !CAFE24_CLIENT_SECRET || !CAFE24_REDIRECT_URI) {
    throw new Error("Cafe24 OAuth credentials are not fully configured");
  }

  const body = new URLSearchParams();
  body.set("grant_type", params.grantType);
  if (params.grantType === "authorization_code") {
    if (!params.code) {
      throw new Error("Missing Cafe24 authorization code");
    }
    body.set("code", params.code);
    body.set("redirect_uri", CAFE24_REDIRECT_URI);
  } else {
    if (!params.refreshToken) {
      throw new Error("Missing Cafe24 refresh token");
    }
    body.set("refresh_token", params.refreshToken);
  }

  const response = await fetch(`https://${CAFE24_MALL_ID}.cafe24api.com/api/v2/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${CAFE24_CLIENT_ID}:${CAFE24_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const responseText = await response.text();
  let result: any = null;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = null;
  }

  if (!response.ok || !result?.access_token) {
    const errorMessage =
      result?.error_description || result?.error || responseText || "Cafe24 token request failed";
    throw new Error(errorMessage);
  }

  const tokenStore: Cafe24TokenStore = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: toIsoStringOrNull(result.expires_at),
    refreshTokenExpiresAt: toIsoStringOrNull(result.refresh_token_expires_at),
    mallId: result.mall_id || CAFE24_MALL_ID,
    shopNo: String(result.shop_no || CAFE24_SHOP_NO || "1"),
    userId: result.user_id,
    scopes: Array.isArray(result.scopes) ? result.scopes : undefined,
    issuedAt: toIsoStringOrNull(result.issued_at),
    updatedAt: new Date().toISOString(),
  };

  await saveCafe24TokenStore(tokenStore);
  return tokenStore;
}

async function getValidCafe24TokenStore(): Promise<Cafe24TokenStore> {
  const stored = await getCafe24TokenStore();

  if (stored?.accessToken && !isTokenExpired(stored.expiresAt)) {
    return stored;
  }

  if (stored?.refreshToken && !isTokenExpired(stored.refreshTokenExpiresAt, 0)) {
    return requestCafe24Token({
      grantType: "refresh_token",
      refreshToken: stored.refreshToken,
    });
  }

  if (CAFE24_ADMIN_ACCESS_TOKEN && CAFE24_MALL_ID) {
    const fallbackTokenStore: Cafe24TokenStore = {
      accessToken: CAFE24_ADMIN_ACCESS_TOKEN,
      refreshToken: CAFE24_REFRESH_TOKEN || undefined,
      expiresAt: CAFE24_ACCESS_TOKEN_EXPIRES_AT || undefined,
      refreshTokenExpiresAt: CAFE24_REFRESH_TOKEN_EXPIRES_AT || undefined,
      mallId: CAFE24_MALL_ID,
      shopNo: CAFE24_SHOP_NO,
      updatedAt: new Date().toISOString(),
    };

    if (!isTokenExpired(fallbackTokenStore.expiresAt)) {
      return fallbackTokenStore;
    }

    if (fallbackTokenStore.refreshToken && !isTokenExpired(fallbackTokenStore.refreshTokenExpiresAt, 0)) {
      return requestCafe24Token({
        grantType: "refresh_token",
        refreshToken: fallbackTokenStore.refreshToken,
      });
    }
  }

  throw new Error("Cafe24 access token is not configured");
}

async function fetchCafe24Order(orderId: string) {
  const tokenStore = await getValidCafe24TokenStore();
  if (!tokenStore.mallId || !tokenStore.accessToken) {
    throw new Error("Cafe24 Admin API credentials are not configured");
  }

  const url = new URL(`https://${tokenStore.mallId}.cafe24api.com/api/v2/admin/orders/${encodeURIComponent(orderId)}`);
  url.searchParams.set("shop_no", tokenStore.shopNo || CAFE24_SHOP_NO);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || result?.message || "Cafe24 order lookup failed");
  }

  return result.order || result.orders?.[0] || result;
}

async function findRecoverableChargeCandidate(params: {
  amountKrw?: number | null;
  maxAgeMinutes?: number;
}) {
  const maxAgeMinutes = params.maxAgeMinutes ?? 30;
  const createdAfter = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

  let query = supabase
    .from("charge_requests")
    .select("*")
    .is("cafe24_order_id", null)
    .gte("created_at", createdAfter)
    .in("status", ["pending", "checkout_started", "payment_detected", "paid"])
    .order("created_at", { ascending: false })
    .limit(5);

  if (typeof params.amountKrw === "number") {
    query = query.eq("amount_krw", params.amountKrw);
  }

  const result = await query;
  if (result.error) {
    throw new Error(`Failed to load recoverable charges: ${result.error.message}`);
  }

  return result.data || [];
}

async function linkCafe24OrderToCharge(internalOrderId: string, cafe24OrderId: string) {
  const chargeUpdate = await supabase
    .from("charge_requests")
    .update({
      cafe24_order_id: cafe24OrderId,
    })
    .eq("internal_order_id", internalOrderId);

  if (chargeUpdate.error) {
    throw new Error(`Failed to link charge request: ${chargeUpdate.error.message}`);
  }

  const mappingUpdate = await supabase
    .from("order_mappings")
    .update({
      cafe24_order_id: cafe24OrderId,
      mapping_status: "linked",
    })
    .eq("internal_order_id", internalOrderId);

  if (mappingUpdate.error) {
    throw new Error(`Failed to link order mapping: ${mappingUpdate.error.message}`);
  }
}

async function verifyCafe24Charge(params: {
  internalOrderId?: string | null;
  cafe24OrderId?: string | null;
}) {
  const { internalOrderId, cafe24OrderId: bodyCafe24OrderId } = params;

  if (!internalOrderId && !bodyCafe24OrderId) {
    return { body: { error: "Missing internalOrderId or cafe24OrderId" }, status: 400 };
  }

  let chargeQuery = supabase
    .from("charge_requests")
    .select("*")
    .limit(1);

  if (internalOrderId) {
    chargeQuery = chargeQuery.eq("internal_order_id", internalOrderId);
  } else {
    chargeQuery = chargeQuery.eq("cafe24_order_id", bodyCafe24OrderId);
  }

  const chargeResult = await chargeQuery.maybeSingle();
  if (chargeResult.error) {
    return { body: { error: "Failed to load charge request", details: chargeResult.error.message }, status: 500 };
  }

  const charge = chargeResult.data;
  if (!charge) {
    return { body: { error: "Charge request not found" }, status: 404 };
  }

  if (charge.status === "credited") {
    return {
      body: {
        success: true,
        internalOrderId: charge.internal_order_id,
        cafe24OrderId: charge.cafe24_order_id,
        status: "credited",
        alreadyCredited: true,
      },
      status: 200,
    };
  }

  const cafe24OrderId = bodyCafe24OrderId || charge.cafe24_order_id;
  if (!cafe24OrderId) {
    return {
      body: {
        success: false,
        status: charge.status,
        verificationStatus: "awaiting_order_mapping",
      },
      status: 202,
    };
  }

  const cafe24Order = await fetchCafe24Order(cafe24OrderId);
  const paidAmount = extractCafe24PaidAmount(cafe24Order);
  const paid = isCafe24Paid(cafe24Order);
  const creditableOrder = isCafe24OrderCreditable(cafe24Order);

  await supabase.from("payment_events").insert({
    source: "cafe24_polling",
    event_type: "verify",
    internal_order_id: charge.internal_order_id,
    cafe24_order_id: cafe24OrderId,
    payload: cafe24Order,
    process_status: paid ? "processed" : "received",
  });

  if (!paid) {
    await supabase
      .from("charge_requests")
      .update({
        cafe24_order_id: cafe24OrderId,
        cafe24_order_status: String(cafe24Order?.order_status || ""),
        cafe24_payment_status: String(cafe24Order?.payment_status || ""),
        verification_attempts: (charge.verification_attempts || 0) + 1,
        last_verified_at: new Date().toISOString(),
        status: "payment_detected",
      })
      .eq("internal_order_id", charge.internal_order_id);

    return {
      body: {
        success: false,
        status: "payment_detected",
        verificationStatus: "not_paid_yet",
      },
      status: 202,
    };
  }

  if (!creditableOrder) {
    const orderStatus = extractCafe24OrderStatus(cafe24Order);
    await supabase
      .from("charge_requests")
      .update({
        cafe24_order_id: cafe24OrderId,
        cafe24_order_status: String(cafe24Order?.order_status || ""),
        cafe24_payment_status: String(cafe24Order?.payment_status || ""),
        verification_attempts: (charge.verification_attempts || 0) + 1,
        last_verified_at: new Date().toISOString(),
        status: "failed",
        failed_reason: `Non-creditable Cafe24 order status: ${orderStatus || "unknown"}`,
      })
      .eq("internal_order_id", charge.internal_order_id);

    return { body: { error: "Order status is not creditable" }, status: 409 };
  }

  if (paidAmount !== null && Number(paidAmount) !== Number(charge.amount_krw)) {
    await supabase
      .from("charge_requests")
      .update({
        cafe24_order_id: cafe24OrderId,
        cafe24_order_status: String(cafe24Order?.order_status || ""),
        cafe24_payment_status: String(cafe24Order?.payment_status || ""),
        verification_attempts: (charge.verification_attempts || 0) + 1,
        last_verified_at: new Date().toISOString(),
        status: "failed",
        failed_reason: `Amount mismatch: expected=${charge.amount_krw}, received=${paidAmount}`,
      })
      .eq("internal_order_id", charge.internal_order_id);

    return { body: { error: "Amount mismatch" }, status: 409 };
  }

  await supabase
    .from("charge_requests")
    .update({
      cafe24_order_id: cafe24OrderId,
      cafe24_order_status: String(cafe24Order?.order_status || ""),
      cafe24_payment_status: String(cafe24Order?.payment_status || ""),
      verification_attempts: (charge.verification_attempts || 0) + 1,
      last_verified_at: new Date().toISOString(),
      payment_confirmed_at: new Date().toISOString(),
      status: "paid",
    })
    .eq("internal_order_id", charge.internal_order_id);

  await supabase
    .from("order_mappings")
    .update({
      cafe24_order_id: cafe24OrderId,
      mapping_status: "linked",
    })
    .eq("internal_order_id", charge.internal_order_id);

  let ledgerResult: { alreadyCredited: boolean; newBalance?: number };
  try {
    ledgerResult = await appendChargeLedgerAndBalance({
      internalOrderId: charge.internal_order_id,
      cafe24OrderId,
      kakaoId: charge.user_kakao_id,
      points: charge.points,
      description: `${charge.product_name} credited (${charge.internal_order_id})`,
    });
  } catch (error) {
    throw error;
  }

  await supabase
    .from("charge_requests")
    .update({
      status: "credited",
      credited_at: new Date().toISOString(),
    })
    .eq("internal_order_id", charge.internal_order_id);

  return {
    body: {
      success: true,
      internalOrderId: charge.internal_order_id,
      cafe24OrderId,
      status: "credited",
      alreadyCredited: ledgerResult.alreadyCredited,
    },
    status: 200,
  };
}

// Kakao REST API Key
const KAKAO_REST_API_KEY = "f1f1ee7feb6098a7bc74cd41e7d787cc";
// Client Secret - 카카오 개발자 콘솔에서 '사용 안 함'으로 설정된 경우 주석 처리
// const KAKAO_CLIENT_SECRET = "VsXJ7SeZlC9mxx3ifLa0fH9GsonqQMEb";

// Admin authentication is configured only through environment variables in production.
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") || "";
const ADMIN_SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const SERVER_VERSION = "v2026-03-18-admin-session";
console.log("🔑 [SERVER START] Version:", SERVER_VERSION);
console.log("🔑 [SERVER START] ADMIN_SECRET configured:", Boolean(ADMIN_SECRET));

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
}

async function signAdminPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const bytes = Array.from(new Uint8Array(signature));
  const binary = String.fromCharCode(...bytes);
  return encodeBase64Url(binary);
}

async function createAdminSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    type: "admin_session",
    issuedAt: Date.now(),
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
  });
  const encodedPayload = encodeBase64Url(payload);
  const signature = await signAdminPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature || !ADMIN_SECRET) {
    return false;
  }

  const expectedSignature = await signAdminPayload(encodedPayload);
  if (expectedSignature !== providedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload));
    return (
      payload?.type === "admin_session" &&
      typeof payload?.expiresAt === "number" &&
      payload.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

// 🔐 헤더에서 관리자 시크릿 추출 (대소문자 구분 없이)
function getAdminSecretFromHeaders(c: any): string | null {
  let adminSecret = c.req.header("X-Admin-Secret");

  if (!adminSecret) {
    adminSecret = c.req.header("x-admin-secret");
  }

  if (!adminSecret) {
    const headers = c.req.raw.headers;
    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'x-admin-secret') {
        adminSecret = value;
        break;
      }
    }
  }

  return adminSecret || null;
}

// 🔐 관리자 인증 미들웨어 (비밀번호 기반)
async function validateAdminAuth(adminSecret: string | null): Promise<boolean> {
  if (!ADMIN_SECRET || !adminSecret) {
    return false;
  }

  if (adminSecret === ADMIN_SECRET) {
    return true;
  }

  return verifyAdminSessionToken(adminSecret);
}

// 🔥 트랜잭션 로그 시스템 (무결성 보장)
interface TransactionLog {
  txId: string;
  kakaoId: string;
  type: 'ticket_purchase' | 'point_charge' | 'lucky_draw' | 'exchange';
  status: 'pending' | 'completed' | 'failed' | 'rollback';
  pointsDeducted?: number;
  ticketAwarded?: any;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

async function createTransactionLog(log: TransactionLog): Promise<void> {
  await kv.set(`txlog:${log.txId}`, JSON.stringify(log));
}

async function updateTransactionLog(txId: string, updates: Partial<TransactionLog>): Promise<void> {
  const logStr = await kv.get(`txlog:${txId}`);
  if (logStr) {
    const log = JSON.parse(logStr);
    await kv.set(`txlog:${txId}`, JSON.stringify({ ...log, ...updates }));
  }
}

// 🔐 카카오 액세스 토큰 검증 (사용자 권한 확인)
async function validateKakaoToken(accessToken: string): Promise<{ kakaoId: string; valid: boolean }> {
  try {
    const response = await fetch("https://kapi.kakao.com/v1/user/access_token_info", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      return { kakaoId: '', valid: false };
    }
    
    const data = await response.json();
    return { kakaoId: String(data.id), valid: true };
  } catch (error) {
    console.error("Kakao token validation error:", error);
    return { kakaoId: '', valid: false };
  }
}

// 🔐 사용자 권한 검증 미들웨어
async function validateUserAuth(authHeader: string | null, kakaoId: string): Promise<boolean> {
  if (!authHeader) return false;
  
  const accessToken = authHeader.replace("Bearer ", "");
  const { kakaoId: validatedKakaoId, valid } = await validateKakaoToken(accessToken);
  
  if (!valid) return false;
  if (validatedKakaoId !== kakaoId) {
    console.warn(`⚠️ 권한 불일치: 토큰=${validatedKakaoId}, 요청=${kakaoId}`);
    return false;
  }
  
  return true;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
const allowedOrigins = getAllowedOrigins();
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] || "*";
      if (allowedOrigins.length === 0) return origin;
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Admin-Secret",
      "x-admin-secret", // lowercase variant
      "authorization",  // lowercase variant
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 600,
    credentials: false,
  }),
);

// Health check endpoint
app.get("/make-server-53dba95c/health", (c) => {
  return c.json({
    status: "ok",
    serverVersion: SERVER_VERSION,
    adminConfigured: Boolean(ADMIN_SECRET),
  });
});

app.post("/make-server-53dba95c/admin/login", async (c) => {
  try {
    if (!ADMIN_SECRET) {
      return c.json({ error: "Admin authentication is not configured." }, 503);
    }

    const { password } = await c.req.json();
    if (!password) {
      return c.json({ error: "Missing password" }, 400);
    }

    if (password !== ADMIN_SECRET) {
      return c.json({ error: "Invalid admin credentials" }, 401);
    }

    const token = await createAdminSessionToken();
    return c.json({
      success: true,
      token,
      expiresInMs: ADMIN_SESSION_TTL_MS,
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get("/make-server-53dba95c/admin/cafe24/oauth/status", async (c) => {
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const tokenStore = await getCafe24TokenStore();
  return c.json({
    success: true,
    configured: Boolean(CAFE24_MALL_ID && CAFE24_CLIENT_ID && CAFE24_CLIENT_SECRET && CAFE24_REDIRECT_URI),
    mallId: CAFE24_MALL_ID || tokenStore?.mallId || null,
    redirectUri: CAFE24_REDIRECT_URI || null,
    hasStoredToken: Boolean(tokenStore?.accessToken),
    hasRefreshToken: Boolean(tokenStore?.refreshToken),
    expiresAt: tokenStore?.expiresAt || null,
    refreshTokenExpiresAt: tokenStore?.refreshTokenExpiresAt || null,
    scopes: tokenStore?.scopes || [],
  });
});

app.post("/make-server-53dba95c/admin/cafe24/oauth/exchange-code", async (c) => {
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { code } = await c.req.json();
    if (!code) {
      return c.json({ error: "Missing authorization code" }, 400);
    }

    const tokenStore = await requestCafe24Token({
      grantType: "authorization_code",
      code,
    });

    return c.json({
      success: true,
      mallId: tokenStore.mallId,
      shopNo: tokenStore.shopNo,
      expiresAt: tokenStore.expiresAt || null,
      refreshTokenExpiresAt: tokenStore.refreshTokenExpiresAt || null,
      scopes: tokenStore.scopes || [],
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/admin/cafe24/oauth/refresh", async (c) => {
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const stored = await getCafe24TokenStore();
    if (!stored?.refreshToken) {
      return c.json({ error: "Cafe24 refresh token is not configured" }, 400);
    }

    const tokenStore = await requestCafe24Token({
      grantType: "refresh_token",
      refreshToken: stored.refreshToken,
    });

    return c.json({
      success: true,
      mallId: tokenStore.mallId,
      shopNo: tokenStore.shopNo,
      expiresAt: tokenStore.expiresAt || null,
      refreshTokenExpiresAt: tokenStore.refreshTokenExpiresAt || null,
      scopes: tokenStore.scopes || [],
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.get("/make-server-53dba95c/admin/cafe24/orders/:orderId/diagnose", async (c) => {
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const orderId = c.req.param("orderId");
    const cafe24Order = await fetchCafe24Order(orderId);

    const chargeResult = await supabase
      .from("charge_requests")
      .select("*")
      .eq("cafe24_order_id", orderId)
      .maybeSingle();

    const mappingResult = await supabase
      .from("order_mappings")
      .select("*")
      .eq("cafe24_order_id", orderId)
      .maybeSingle();

    return c.json({
      success: true,
      orderId,
      paymentStatus: extractCafe24PaymentStatus(cafe24Order),
      orderStatus: extractCafe24OrderStatus(cafe24Order),
      paidAmount: extractCafe24PaidAmount(cafe24Order),
      creditable: isCafe24OrderCreditable(cafe24Order),
      paid: isCafe24Paid(cafe24Order),
      cafe24Order,
      chargeRequest: chargeResult.data || null,
      chargeRequestError: chargeResult.error?.message || null,
      orderMapping: mappingResult.data || null,
      orderMappingError: mappingResult.error?.message || null,
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.get("/make-server-53dba95c/diag/cafe24/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const cafe24Order = await fetchCafe24Order(orderId);

    const chargeResult = await supabase
      .from("charge_requests")
      .select("internal_order_id,status,amount_krw,points,cafe24_order_id,cafe24_order_status,cafe24_payment_status,failed_reason,verification_attempts,credited_at,payment_confirmed_at")
      .eq("cafe24_order_id", orderId)
      .maybeSingle();

    const mappingResult = await supabase
      .from("order_mappings")
      .select("internal_order_id,cafe24_order_id,mapping_status")
      .eq("cafe24_order_id", orderId)
      .maybeSingle();

    return c.json({
      success: true,
      orderId,
      paymentStatus: extractCafe24PaymentStatus(cafe24Order),
      orderStatus: extractCafe24OrderStatus(cafe24Order),
      paidAmount: extractCafe24PaidAmount(cafe24Order),
      creditable: isCafe24OrderCreditable(cafe24Order),
      paid: isCafe24Paid(cafe24Order),
      chargeRequest: chargeResult.data || null,
      chargeRequestError: chargeResult.error?.message || null,
      orderMapping: mappingResult.data || null,
      orderMappingError: mappingResult.error?.message || null,
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/diag/cafe24/orders/:orderId/recover", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json().catch(() => ({}));
    const amountKrw = typeof body?.amountKrw === "number" ? body.amountKrw : 100;
    const maxAgeMinutes = typeof body?.maxAgeMinutes === "number" ? body.maxAgeMinutes : 30;

    const candidates = await findRecoverableChargeCandidate({
      amountKrw,
      maxAgeMinutes,
    });

    if (candidates.length !== 1) {
      return c.json({
        success: false,
        recoverable: false,
        reason: candidates.length === 0 ? "No recoverable charge candidate found" : "Multiple recoverable charge candidates found",
        candidateCount: candidates.length,
        candidates: candidates.map((candidate: any) => ({
          internalOrderId: candidate.internal_order_id,
          status: candidate.status,
          amountKrw: candidate.amount_krw,
          createdAt: candidate.created_at || null,
        })),
      }, 409);
    }

    const candidate = candidates[0];
    await linkCafe24OrderToCharge(candidate.internal_order_id, orderId);
    const result = await verifyCafe24Charge({
      internalOrderId: candidate.internal_order_id,
      cafe24OrderId: orderId,
    });

    return c.json({
      success: true,
      recoveredInternalOrderId: candidate.internal_order_id,
      verification: result.body,
    }, result.status as any);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/diag/cafe24/orders/:orderId/recover/:internalOrderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const internalOrderId = c.req.param("internalOrderId");

    await linkCafe24OrderToCharge(internalOrderId, orderId);
    const result = await verifyCafe24Charge({
      internalOrderId,
      cafe24OrderId: orderId,
    });

    return c.json({
      success: true,
      recoveredInternalOrderId: internalOrderId,
      verification: result.body,
    }, result.status as any);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/diag/cafe24/recover-order", async (c) => {
  try {
    const { orderId, internalOrderId } = await c.req.json();
    if (!orderId || !internalOrderId) {
      return c.json({ error: "Missing orderId or internalOrderId" }, 400);
    }

    await linkCafe24OrderToCharge(String(internalOrderId), String(orderId));
    const result = await verifyCafe24Charge({
      internalOrderId: String(internalOrderId),
      cafe24OrderId: String(orderId),
    });

    return c.json({
      success: true,
      recoveredInternalOrderId: String(internalOrderId),
      verification: result.body,
    }, result.status as any);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// 카카오 로그인 - 인증 코드로 액세스 토큰 받기
app.post("/make-server-53dba95c/auth/kakao/token", async (c) => {
  try {
    const { code, redirectUri } = await c.req.json();
    
    if (!code || !redirectUri) {
      return c.json({ error: "Missing code or redirectUri" }, 400);
    }

    // 카카오 토큰 요청
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.log("Kakao token error - Full response:", JSON.stringify(tokenData, null, 2));
      console.log("Kakao token error - Status:", tokenResponse.status);
      return c.json({ error: "Failed to get Kakao token", details: tokenData }, 400);
    }

    const accessToken = tokenData.access_token;

    // 카카오 사용자 정보 요청
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.log("Kakao user info error:", userData);
      return c.json({ error: "Failed to get user info", details: userData }, 400);
    }

    // 카카오에서 받은 사용자 정보 로깅
    console.log("Kakao user data received:", {
      id: userData.id,
      properties: userData.properties,
      kakao_account: userData.kakao_account,
    });

    // 사용자 정보 저장
    const kakaoId = String(userData.id);
    const userInfo = {
      kakaoId,
      nickname: userData.properties?.nickname || "사용자",
      profileImage: userData.properties?.profile_image || "",
      email: userData.kakao_account?.email || "",
      accessToken,
      lastLoginAt: new Date().toISOString(),
    };

    // 🔐 관리자 카카오 ID 목록 (하드코딩)
    const ADMIN_KAKAO_IDS = [
      "3867968748", // 관리자 카카오 ID (여기에 실제 관리자 카카오 ID 입력)
    ];
    
    const isAdmin = ADMIN_KAKAO_IDS.includes(kakaoId);
    let supabaseJWT: string | null = null;
    
    // 🔐 Supabase Auth에 사용자 생성/로그인 (관리자만)
    if (isAdmin) {
      const email = userInfo.email || `admin_${kakaoId}@randomticket.app`;
      const password = Deno.env.get("ADMIN_SECRET") || "dleogus23@!secure!key!2026";
      
      // 기존 사용자 확인
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.user_metadata?.kakao_id === kakaoId);
      
      if (existingUser) {
        console.log("✅ Existing admin user:", existingUser.email);
        
        // 🔥 Admin용 커스텀 JWT 생성 (Supabase Service Role 사용)
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: existingUser.email!,
        });
        
        // Magic link에서 토큰 추출하기 어려우므로, 간단하게 signInWithPassword 사용
        // 하지만 password를 모르므로, 대신 Service Role Key를 JWT로 사용
        supabaseJWT = supabaseServiceKey; // ⚠️ 임시: Service Role Key를 JWT로 사용
        
      } else {
        console.log("📝 Creating admin user:", email);
        
        // 신규 관리자 생성
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            kakao_id: kakaoId,
            nickname: userInfo.nickname,
            profile_image: userInfo.profileImage,
          },
          app_metadata: {
            role: 'admin', // ✅ 관리자 role 부여
          },
        });
        
        if (error) {
          console.error("❌ Failed to create admin user:", error);
        } else {
          console.log("✅ Admin user created:", data.user?.email);
          supabaseJWT = supabaseServiceKey; // ⚠️ 임시: Service Role Key를 JWT로 사용
        }
      }
    }

    // KV 스토어에 사용자 정보 저장 (JWT 포함)
    await kv.set(`user:${kakaoId}`, JSON.stringify({
      ...userInfo,
      supabaseJWT: isAdmin ? supabaseJWT : null,
      isAdmin,
    }));

    // 🔥 userdata도 함께 생성 (로그인 시 자동 생성)
    const existingUserDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!existingUserDataStr) {
      // 🎁 새 사용자 - 웰컴 포인트 지급!
      const WELCOME_POINTS = 500000;
      const initialUserData = {
        userId: `kakao_${kakaoId}`,
        userName: userInfo.nickname,
        email: userInfo.email,
        kakaoId,
        points: WELCOME_POINTS,
        winningTickets: [],
        transactions: [
          {
            id: `tx_welcome_${Date.now()}`,
            type: 'charge',
            amount: WELCOME_POINTS,
            description: '🎉 신규 가입 웰컴 포인트',
            createdAt: new Date().toISOString(),
          }
        ],
        exchangeTickets: [],
        luckyDrawEntries: [],
        createdAt: new Date().toISOString(),
      };
      await kv.set(`userdata:${kakaoId}`, JSON.stringify(initialUserData));
      console.log(`🎁 New user created with ${WELCOME_POINTS}P: ${kakaoId}`);
      console.log(`✅ userdata created for ${kakaoId}`);
    } else {
      // 기존 사용자라면 userName과 email 업데이트
      const existingUserData = JSON.parse(existingUserDataStr);
      existingUserData.userName = userInfo.nickname;
      existingUserData.email = userInfo.email;
      await kv.set(`userdata:${kakaoId}`, JSON.stringify(existingUserData));
      console.log(`♻️ userdata updated for existing user: ${kakaoId}`);
    }

    return c.json({
      success: true,
      user: {
        kakaoId,
        nickname: userInfo.nickname,
        profileImage: userInfo.profileImage,
        email: userInfo.email,
        isAdmin, // ✅ 관리자 여부 전달
      },
      accessToken, // 🔥 카카오 토큰 (일반 사용자용)
      supabaseJWT, // 🔐 Supabase JWT (관리자용)
    });
  } catch (error) {
    console.error("Kakao auth error:", error);
    return c.json({ error: "Server error during authentication", details: String(error) }, 500);
  }
});

// 사용자 정보 조회 - KV 기반
app.get("/make-server-53dba95c/auth/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.replace("Bearer ", "");
    
    console.log('🔍 [/auth/me] Request received');
    console.log('🔍 [/auth/me] Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE');
    
    if (!accessToken) {
      console.log('❌ [/auth/me] No access token provided');
      return c.json({ error: "No access token provided" }, 401);
    }

    // 🔥 KV에서 토큰으로 사용자 찾기
    console.log('📡 [/auth/me] Searching for user in KV...');
    const usersData = await kv.getByPrefix("user:");
    
    for (const userStr of usersData) {
      const user = JSON.parse(userStr);
      if (user.accessToken === accessToken) {
        console.log('✅ [/auth/me] User found:', user.kakaoId);
        return c.json({
          success: true,
          user: {
            kakaoId: user.kakaoId,
            nickname: user.nickname,
            profileImage: user.profileImage,
            email: user.email,
          },
        });
      }
    }

    console.log('❌ [/auth/me] Invalid or expired token');
    return c.json({ error: "Invalid or expired token" }, 401);
  } catch (error) {
    console.error("Get user info error:", error);
    return c.json({ error: "Failed to get user info", details: String(error) }, 500);
  }
});

// 로그아웃
app.post("/make-server-53dba95c/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    // 카카오 로그아웃 API 호출
    const logoutResponse = await fetch("https://kapi.kakao.com/v1/user/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const logoutData = await logoutResponse.json();

    return c.json({
      success: true,
      message: "Logged out successfully",
      data: logoutData,
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Failed to logout", details: String(error) }, 500);
  }
});

// ============================================
// 토스페이먼츠 결제 API
// ============================================

// 토스페이먼츠 시크릿 키 (환경변수에서 가져오기)
// 테스트용: test_sk_* 형식의 키 사용
// 실제 운영: 토스페이먼츠 대시보드에서 발급���은 실제 시크릿 키 사용
// ============================================
// Cafe24 주문연동형 충전 API
// ============================================

app.post("/make-server-53dba95c/payments/charges", async (c) => {
  try {
    const { amount, productCode, kakaoId } = await c.req.json();

    if (!kakaoId) {
      return c.json({ error: "Missing kakaoId" }, 400);
    }

    const normalizedAmount = typeof amount === "number" ? amount : Number(amount);
    const catalogItem = getChargeCatalogItem(productCode, normalizedAmount);
    if (!catalogItem) {
      return c.json({ error: "Unsupported charge product" }, 400);
    }

    const internalOrderId = generateInternalOrderId();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const checkoutUrl = getConfiguredCheckoutUrl(catalogItem, internalOrderId, kakaoId);

    if (!checkoutUrl) {
      return c.json({
        error: "Cafe24 checkout URL is not configured",
        missingEnv: catalogItem.checkoutEnvKey,
      }, 500);
    }

    const chargeInsert = await supabase.from("charge_requests").insert({
      internal_order_id: internalOrderId,
      user_kakao_id: kakaoId,
      user_id: `kakao_${kakaoId}`,
      amount_krw: catalogItem.amount,
      points: catalogItem.points,
      product_code: catalogItem.productCode,
      product_name: catalogItem.productName,
      status: "pending",
      checkout_url: checkoutUrl,
      expires_at: expiresAt,
      metadata: {
        appOrigin: getAppOrigin(c),
      },
    });

    if (chargeInsert.error) {
      console.error("Create charge request error:", chargeInsert.error);
      return c.json({ error: "Failed to create charge request", details: chargeInsert.error.message }, 500);
    }

    const mappingInsert = await supabase.from("order_mappings").insert({
      internal_order_id: internalOrderId,
      mapping_status: "pending",
      metadata: {
        productCode: catalogItem.productCode,
      },
    });

    if (mappingInsert.error) {
      console.error("Create order mapping error:", mappingInsert.error);
      return c.json({ error: "Failed to create order mapping", details: mappingInsert.error.message }, 500);
    }

    return c.json({
      success: true,
      internalOrderId,
      amount: catalogItem.amount,
      points: catalogItem.points,
      productCode: catalogItem.productCode,
      checkoutUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Create Cafe24 charge error:", error);
    return c.json({ error: "Failed to create Cafe24 charge", details: String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/payments/cafe24/redirect-complete", async (c) => {
  try {
    const payload = await c.req.json();
    const internalOrderId = payload?.internalOrderId || payload?.internal_order_id || null;
    const cafe24OrderId = normalizeCafe24OrderId(payload);

    const eventInsert = await supabase.from("payment_events").insert({
      source: "cafe24_redirect",
      event_type: "redirect_complete",
      internal_order_id: internalOrderId,
      cafe24_order_id: cafe24OrderId,
      payload,
      process_status: "received",
    });

    if (eventInsert.error) {
      return c.json({ error: "Failed to record redirect event", details: eventInsert.error.message }, 500);
    }

    if (internalOrderId) {
      const chargeUpdates: Record<string, unknown> = {
        status: "checkout_started",
      };

      if (cafe24OrderId) {
        chargeUpdates.cafe24_order_id = cafe24OrderId;
      }

      await supabase
        .from("charge_requests")
        .update(chargeUpdates)
        .eq("internal_order_id", internalOrderId)
        .in("status", ["pending", "checkout_started"]);

      if (cafe24OrderId) {
        await supabase
          .from("order_mappings")
          .update({
            cafe24_order_id: cafe24OrderId,
            mapping_status: "linked",
          })
          .eq("internal_order_id", internalOrderId);
      }
    }

    return c.json({
      success: true,
      internalOrderId,
      cafe24OrderId,
    });
  } catch (error) {
    console.error("Cafe24 redirect complete error:", error);
    return c.json({ error: "Failed to process redirect completion", details: String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/payments/cafe24/callback", async (c) => {
  try {
    const payload = await c.req.json();
    const internalOrderId = payload?.internalOrderId || payload?.internal_order_id || null;
    const cafe24OrderId = normalizeCafe24OrderId(payload);

    const eventInsert = await supabase.from("payment_events").insert({
      source: "cafe24_callback",
      event_type: payload?.eventType || "callback",
      internal_order_id: internalOrderId,
      cafe24_order_id: cafe24OrderId,
      payload,
      process_status: "received",
    });

    if (eventInsert.error) {
      return c.json({ error: "Failed to record callback event", details: eventInsert.error.message }, 500);
    }

    if (internalOrderId && cafe24OrderId) {
      await supabase
        .from("charge_requests")
        .update({
          cafe24_order_id: cafe24OrderId,
          status: "payment_detected",
        })
        .eq("internal_order_id", internalOrderId)
        .in("status", ["pending", "checkout_started", "payment_detected"]);

      await supabase
        .from("order_mappings")
        .update({
          cafe24_order_id: cafe24OrderId,
          mapping_status: "linked",
        })
        .eq("internal_order_id", internalOrderId);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Cafe24 callback error:", error);
    return c.json({ error: "Failed to process Cafe24 callback", details: String(error) }, 500);
  }
});

app.post("/make-server-53dba95c/payments/cafe24/verify", async (c) => {
  try {
    const { internalOrderId, cafe24OrderId } = await c.req.json();
    const result = await verifyCafe24Charge({ internalOrderId, cafe24OrderId });
    return c.json(result.body, result.status as any);
  } catch (error) {
    console.error("Cafe24 verify error:", error);
    return c.json({ error: "Failed to verify Cafe24 payment", details: String(error) }, 500);
  }
});

app.get("/make-server-53dba95c/payments/charges/:internalOrderId", async (c) => {
  try {
    const internalOrderId = c.req.param("internalOrderId");
    const chargeResult = await supabase
      .from("charge_requests")
      .select("*")
      .eq("internal_order_id", internalOrderId)
      .maybeSingle();

    if (chargeResult.error) {
      return c.json({ error: "Failed to load charge status", details: chargeResult.error.message }, 500);
    }

    if (!chargeResult.data) {
      return c.json({ error: "Charge request not found" }, 404);
    }

    return c.json({
      success: true,
      internalOrderId: chargeResult.data.internal_order_id,
      status: chargeResult.data.status,
      amount: chargeResult.data.amount_krw,
      points: chargeResult.data.points,
      cafe24OrderId: chargeResult.data.cafe24_order_id,
      paymentConfirmedAt: chargeResult.data.payment_confirmed_at,
      creditedAt: chargeResult.data.credited_at,
      failedReason: chargeResult.data.failed_reason,
      expiresAt: chargeResult.data.expires_at,
    });
  } catch (error) {
    console.error("Get charge status error:", error);
    return c.json({ error: "Failed to get charge status", details: String(error) }, 500);
  }
});

const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY") || "test_sk_ORzdMaqN3woRL71MRbg35AkYXQGw";

console.log("=== Toss Payments Configuration ===");
console.log("TOSS_SECRET_KEY loaded:", TOSS_SECRET_KEY ? `${TOSS_SECRET_KEY.substring(0, 15)}...` : "NOT SET");

// 주문 생성 API (결제 전 호출)
app.post("/make-server-53dba95c/payment/create-order", async (c) => {
  try {
    const { amount, kakaoId } = await c.req.json();
    
    if (!amount || !kakaoId || amount <= 0) {
      return c.json({ error: "Invalid amount or kakaoId" }, 400);
    }

    // 주문 ID 생성 (서버에서 생성하여 보안성 강화)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // 주문 정보를 KV에 저장
    const orderData = {
      orderId,
      amount,
      kakaoId,
      status: "pending",
      createdAt: timestamp,
    };

    await kv.set(`order:${orderId}`, orderData);

    console.log("Order created:", orderData);

    return c.json({ 
      success: true, 
      orderId,
      amount,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// 결제 승인 API
app.post("/make-server-53dba95c/payment/confirm", async (c) => {
  try {
    const { paymentKey, orderId, amount, kakaoId } = await c.req.json();
    
    if (!paymentKey || !orderId || !amount) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    console.log("Payment confirm request:", { paymentKey, orderId, amount, kakaoId });

    // 주문 정보 확인 (금액 검증)
    const savedOrder = await kv.get(`order:${orderId}`);
    
    if (!savedOrder) {
      console.error("Order not found:", orderId);
      return c.json({ error: "Order not found" }, 404);
    }

    // 금액 검증 (프론트에서 보낸 금액과 저장된 금액이 일치하는지 확인)
    if (savedOrder.amount !== amount) {
      console.error("Amount mismatch:", { expected: savedOrder.amount, received: amount });
      return c.json({ error: "Amount mismatch - potential tampering detected" }, 400);
    }

    console.log("Order verified:", savedOrder);
    console.log("Using TOSS_SECRET_KEY:", TOSS_SECRET_KEY ? `${TOSS_SECRET_KEY.substring(0, 15)}...` : "NOT SET");

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(TOSS_SECRET_KEY + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error("Toss payment confirm failed:", paymentData);
      return c.json({ 
        error: "Payment confirmation failed", 
        details: paymentData 
      }, 400);
    }

    console.log("Payment confirmed:", paymentData);

    // 결제 성공 시 KV에 결제 정보 저장
    const paymentRecord = {
      paymentKey,
      orderId,
      amount,
      kakaoId,
      status: paymentData.status,
      method: paymentData.method,
      approvedAt: paymentData.approvedAt,
      receipt: paymentData.receipt?.url || "",
    };

    await kv.set(`payment:${orderId}`, JSON.stringify(paymentRecord));

    return c.json({
      success: true,
      payment: paymentData,
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return c.json({ 
      error: "Server error during payment confirmation", 
      details: String(error) 
    }, 500);
  }
});

// 결제 내역 조회
app.get("/make-server-53dba95c/payment/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    
    const paymentStr = await kv.get(`payment:${orderId}`);
    
    if (!paymentStr) {
      return c.json({ error: "Payment not found" }, 404);
    }

    const payment = JSON.parse(paymentStr);
    
    return c.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return c.json({ 
      error: "Failed to get payment", 
      details: String(error) 
    }, 500);
  }
});

// ============================================
// 사용자 데이터 관리 API
// ============================================

// 사용자 데이터 조회
app.get("/make-server-53dba95c/user/:kakaoId/data", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    
    if (!userDataStr) {
      // 🎁 새 사용자 - 웰컴 포인트 지급!
      const WELCOME_POINTS = 500000;
      const initialData = {
        userId: `kakao_${kakaoId}`,
        userName: "사용자",
        points: WELCOME_POINTS,
        winningTickets: [],
        transactions: [
          {
            id: `tx_welcome_${Date.now()}`,
            type: 'charge',
            amount: WELCOME_POINTS,
            description: '🎉 신규 가입 웰컴 포인트',
            createdAt: new Date().toISOString(),
          }
        ],
        exchangeTickets: [],
        luckyDrawEntries: [],
        kakaoId,
        createdAt: new Date().toISOString(),
      };
      
      await kv.set(`userdata:${kakaoId}`, JSON.stringify(initialData));
      
      console.log(`🎁 New user created with ${WELCOME_POINTS}P: ${kakaoId}`);
      
      return c.json({
        success: true,
        data: initialData,
      });
    }

    const userData = JSON.parse(userDataStr);
    
    return c.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return c.json({ 
      error: "Failed to get user data", 
      details: String(error) 
    }, 500);
  }
});

// 사용자 데이터 저장
app.post("/make-server-53dba95c/user/:kakaoId/data", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const userData = await c.req.json();
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    return c.json({
      success: true,
    });
  } catch (error) {
    console.error("Save user data error:", error);
    return c.json({ 
      error: "Failed to save user data", 
      details: String(error) 
    }, 500);
  }
});

// 포인트 추가 (관리자 전용)
app.post("/make-server-53dba95c/user/:kakaoId/points/add", async (c) => {
  // 🔐 관리자 인증 체크
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized - Admin only" }, 401);
  }

  try {
    const kakaoId = c.req.param("kakaoId");
    const { amount, description, type = 'charge' } = await c.req.json();
    
    let userDataStr = await kv.get(`userdata:${kakaoId}`);
    
    // 유저 데이터가 없으면 자동 생성
    if (!userDataStr) {
      console.log(`Creating new user data for kakaoId: ${kakaoId}`);
      const newUserData = {
        userId: `kakao_${kakaoId}`,
        userName: "사용자",
        kakaoId,
        points: 0,
        winningTickets: [],
        transactions: [],
        createdAt: new Date().toISOString(),
      };
      await kv.set(`userdata:${kakaoId}`, JSON.stringify(newUserData));
      userDataStr = JSON.stringify(newUserData);
    }
    
    const userData = JSON.parse(userDataStr);
    userData.points += amount;
    userData.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      description,
      createdAt: new Date().toISOString(),
    });
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    return c.json({
      success: true,
      points: userData.points,
    });
  } catch (error) {
    console.error("Add points error:", error);
    return c.json({ 
      error: "Failed to add points", 
      details: String(error) 
    }, 500);
  }
});

// 포인트 차감
app.post("/make-server-53dba95c/user/:kakaoId/points/deduct", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const { amount, description, type, relatedId } = await c.req.json();
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    
    if (userData.points < amount) {
      return c.json({ error: "Insufficient points", success: false }, 400);
    }
    
    userData.points -= amount;
    userData.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount: -amount,
      description,
      createdAt: new Date().toISOString(),
      relatedId,
    });
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    return c.json({
      success: true,
      points: userData.points,
    });
  } catch (error) {
    console.error("Deduct points error:", error);
    return c.json({ 
      error: "Failed to deduct points", 
      details: String(error) 
    }, 500);
  }
});

// 티켓 구매 (당첨)
app.post("/make-server-53dba95c/user/:kakaoId/tickets/buy", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const ticketData = await c.req.json();
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    
    const newTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wonAt: new Date().toISOString(),
      status: 'active',
    };
    
    userData.winningTickets.unshift(newTicket);
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    return c.json({
      success: true,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Buy ticket error:", error);
    return c.json({ 
      error: "Failed to buy ticket", 
      details: String(error) 
    }, 500);
  }
});

// 🔥 통합 API: 포인트 차감 + 티켓 지급 (원자적 트랜잭션)
app.post("/make-server-53dba95c/user/:kakaoId/tickets/purchase-atomic", async (c) => {
  const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const kakaoId = c.req.param("kakaoId");
    const { ticketData, points } = await c.req.json();
    
    // 1️⃣ 트랜잭션 로그 생성 (PENDING)
    await createTransactionLog({
      txId,
      kakaoId,
      type: 'ticket_purchase',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      await updateTransactionLog(txId, { 
        status: 'failed', 
        error: 'User not found',
        completedAt: new Date().toISOString()
      });
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    
    // 2️⃣ 포인트 검증
    if (userData.points < points) {
      await updateTransactionLog(txId, { 
        status: 'failed', 
        error: 'Insufficient points',
        completedAt: new Date().toISOString()
      });
      return c.json({ error: "Insufficient points", success: false }, 400);
    }
    
    // 3️⃣ 포인트 차감
    userData.points -= points;
    
    // 4️⃣ 티켓 생성
    const newTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wonAt: new Date().toISOString(),
      status: 'active',
    };
    
    userData.winningTickets.unshift(newTicket);
    
    // 5️⃣ 거래 내역 추가
    userData.transactions.unshift({
      id: txId,
      type: 'ticket_purchase',
      amount: -points,
      description: `${ticketData.ticketType} 티켓 구매 - ${ticketData.productName}`,
      createdAt: new Date().toISOString(),
      relatedId: newTicket.id,
    });
    
    // 6️⃣ 모든 변경사항 저장 (원자적)
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    // 7️⃣ 트랜잭션 로그 완료
    await updateTransactionLog(txId, {
      status: 'completed',
      pointsDeducted: points,
      ticketAwarded: newTicket,
      completedAt: new Date().toISOString()
    });
    
    console.log(`✅ Atomic transaction completed: ${txId}`);
    
    return c.json({
      success: true,
      ticket: newTicket,
      points: userData.points,
      txId,
    });
  } catch (error) {
    // ⚠️ 에러 발생 시 롤백 처리 (향후 개선)
    console.error("Atomic purchase error:", error);
    await updateTransactionLog(txId, {
      status: 'failed',
      error: String(error),
      completedAt: new Date().toISOString()
    });
    
    return c.json({ 
      error: "Failed to purchase ticket", 
      details: String(error),
      txId 
    }, 500);
  }
});

// 티켓 업데이트
app.put("/make-server-53dba95c/user/:kakaoId/tickets/:ticketId", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const ticketId = c.req.param("ticketId");
    const updates = await c.req.json();
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    const ticketIndex = userData.winningTickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    
    userData.winningTickets[ticketIndex] = { 
      ...userData.winningTickets[ticketIndex], 
      ...updates 
    };
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    return c.json({
      success: true,
      ticket: userData.winningTickets[ticketIndex],
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    return c.json({ 
      error: "Failed to update ticket", 
      details: String(error) 
    }, 500);
  }
});

// 🎰 티켓 포인트 전환 (룰렛)
app.post("/make-server-53dba95c/user/:kakaoId/tickets/:ticketId/convert", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const ticketId = c.req.param("ticketId");
    const { finalPoints, multiplier } = await c.req.json();
    
    console.log(`🎰 [convert-ticket] START - kakaoId: ${kakaoId}, ticketId: ${ticketId}, finalPoints: ${finalPoints}, multiplier: ${multiplier}`);
    
    // 사용자 데이터 조회
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      console.error(`🎰 [convert-ticket] User not found: ${kakaoId}`);
      return c.json({ error: "User not found", success: false }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    
    // 티켓 존재 여부 확인
    const ticketIndex = userData.winningTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      console.error(`🎰 [convert-ticket] Ticket not found: ${ticketId}`);
      return c.json({ error: "Ticket not found", success: false }, 404);
    }
    
    const ticket = userData.winningTickets[ticketIndex];
    
    // 이미 전환된 티켓인지 확인
    if (ticket.status === 'converted' || ticket.convertedAt) {
      console.error(`🎰 [convert-ticket] Already converted ticket: ${ticketId}`);
      return c.json({ error: "Ticket already converted", success: false }, 400);
    }
    
    // 티켓 상태를 'converted'로 변경하고 전환 시간 기록
    userData.winningTickets[ticketIndex] = {
      ...ticket,
      status: 'converted',
      convertedAt: new Date().toISOString(),
      convertedMultiplier: multiplier,
      convertedPoints: finalPoints,
    };
    
    // 포인트 추가
    userData.points += finalPoints;
    
    // 거래 내역 추가
    userData.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ticket_convert',
      amount: finalPoints,
      description: `티켓 포인트 전환 (x${multiplier})`,
      createdAt: new Date().toISOString(),
      relatedId: ticketId,
    });
    
    // KV 저장 (원자적 트랜잭션)
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    console.log(`✅ [convert-ticket] SUCCESS - New points: ${userData.points}`);
    
    return c.json({
      success: true,
      points: userData.points,
      ticket: userData.winningTickets[ticketIndex],
    });
  } catch (error) {
    console.error("❌ [convert-ticket] Error:", error);
    return c.json({ 
      error: "Failed to convert ticket", 
      details: String(error),
      success: false,
    }, 500);
  }
});

// ============================================
// 거래소 API (전체 사용자 공유)
// ============================================

// 거래소 티켓 등록
app.post("/make-server-53dba95c/exchange/list", async (c) => {
  try {
    const { kakaoId, ticketId, ticketType, productName, productBrand, productImage, points, price, sellerName } = await c.req.json();
    
    const exchangeTicket = {
      id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      ticketType,
      productName,
      productBrand,
      productImage,
      points,
      price,
      sellerId: `kakao_${kakaoId}`,
      sellerName,
      status: 'selling',
      listedAt: new Date().toISOString(),
    };
    
    // 전역 거래소 목록에 추가
    await kv.set(`exchange:${exchangeTicket.id}`, JSON.stringify(exchangeTicket));
    
    // 사용자 데이터에도 추가
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      userData.exchangeTickets.unshift(exchangeTicket);
      await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    }
    
    return c.json({
      success: true,
      ticket: exchangeTicket,
    });
  } catch (error) {
    console.error("List exchange ticket error:", error);
    return c.json({ 
      error: "Failed to list exchange ticket", 
      details: String(error) 
    }, 500);
  }
});

// 거래소 티켓 전체 조회
app.get("/make-server-53dba95c/exchange/tickets", async (c) => {
  try {
    const status = c.req.query("status") || "all";
    
    // exchange: prefix로 시작하는 모든 키 조회
    const exchangeKeys = await kv.getByPrefix("exchange:");
    const tickets = exchangeKeys.map(key => JSON.parse(key)).filter(ticket => {
      if (status === "all") return true;
      return ticket.status === status;
    });
    
    // 최신순 정렬
    tickets.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
    
    return c.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Get exchange tickets error:", error);
    return c.json({ 
      error: "Failed to get exchange tickets", 
      details: String(error) 
    }, 500);
  }
});

// 거래소 티켓 구매
app.post("/make-server-53dba95c/exchange/purchase", async (c) => {
  try {
    const { buyerKakaoId, exchangeTicketId } = await c.req.json();
    
    // 거래소 티켓 조회
    const exchangeTicketStr = await kv.get(`exchange:${exchangeTicketId}`);
    if (!exchangeTicketStr) {
      return c.json({ error: "Exchange ticket not found" }, 404);
    }
    
    const exchangeTicket = JSON.parse(exchangeTicketStr);
    
    if (exchangeTicket.status !== 'selling') {
      return c.json({ error: "Ticket is not available for purchase" }, 400);
    }
    
    // 구매자 데이터 조회
    const buyerDataStr = await kv.get(`userdata:${buyerKakaoId}`);
    if (!buyerDataStr) {
      return c.json({ error: "Buyer not found" }, 404);
    }
    
    const buyerData = JSON.parse(buyerDataStr);
    
    // 포인트 확인
    if (buyerData.points < exchangeTicket.price) {
      return c.json({ error: "Insufficient points", success: false }, 400);
    }
    
    // 본인 티켓 확인
    if (buyerData.userId === exchangeTicket.sellerId) {
      return c.json({ error: "Cannot purchase own ticket" }, 400);
    }
    
    // 포인트 차감
    buyerData.points -= exchangeTicket.price;
    
    // 거래 내역 추가
    buyerData.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'exchange_buy',
      amount: -exchangeTicket.price,
      description: `${exchangeTicket.productName} 구매`,
      createdAt: new Date().toISOString(),
      relatedId: exchangeTicketId,
    });
    
    // 당첨 티켓 추가
    const winningTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketType: exchangeTicket.ticketType,
      productName: exchangeTicket.productName,
      productBrand: exchangeTicket.productBrand,
      productImage: exchangeTicket.productImage,
      points: exchangeTicket.points,
      wonAt: new Date().toISOString(),
      status: 'active',
    };
    buyerData.winningTickets.unshift(winningTicket);
    
    // 구매자 데이터 저장
    await kv.set(`userdata:${buyerKakaoId}`, JSON.stringify(buyerData));
    
    // 거래소 티켓 상태 변경
    exchangeTicket.status = 'sold';
    exchangeTicket.soldAt = new Date().toISOString();
    exchangeTicket.buyerId = `kakao_${buyerKakaoId}`;
    await kv.set(`exchange:${exchangeTicketId}`, JSON.stringify(exchangeTicket));
    
    // 판매자 포인트 증가
    const sellerKakaoId = exchangeTicket.sellerId.replace('kakao_', '');
    const sellerDataStr = await kv.get(`userdata:${sellerKakaoId}`);
    if (sellerDataStr) {
      const sellerData = JSON.parse(sellerDataStr);
      sellerData.points += exchangeTicket.price;
      sellerData.transactions.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'exchange_sell',
        amount: exchangeTicket.price,
        description: `${exchangeTicket.productName} 판매`,
        createdAt: new Date().toISOString(),
        relatedId: exchangeTicketId,
      });
      
      // 판매자의 exchangeTickets에서 상태 업데이트
      const exchangeIndex = sellerData.exchangeTickets.findIndex(t => t.id === exchangeTicketId);
      if (exchangeIndex !== -1) {
        sellerData.exchangeTickets[exchangeIndex] = exchangeTicket;
      }
      
      await kv.set(`userdata:${sellerKakaoId}`, JSON.stringify(sellerData));
    }
    
    return c.json({
      success: true,
      ticket: winningTicket,
    });
  } catch (error) {
    console.error("Purchase exchange ticket error:", error);
    return c.json({ 
      error: "Failed to purchase exchange ticket", 
      details: String(error) 
    }, 500);
  }
});

// ============================================
// 럭키드로우 API
// ============================================

// 럭키드로우 참여
app.post("/make-server-53dba95c/lucky-draw/enter", async (c) => {
  try {
    const { kakaoId, productId, productName, entryPoints } = await c.req.json();
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    
    // 🔥 이중 검증: 사용자 데이터 + 전역 참여 목록 확인
    const alreadyEntered = userData.luckyDrawEntries.some(
      (e: any) => e.productId === productId && e.status === 'pending'
    );
    
    if (alreadyEntered) {
      return c.json({ error: "이미 참여한 럭키드로우입니다.", success: false }, 400);
    }
    
    // 전역 참여 목록에서도 확인 (데이터 불일치 방지)
    const globalEntries = await kv.getByPrefix(`luckydraw:${productId}:`);
    const alreadyInGlobalList = globalEntries.some((entryStr: string) => {
      try {
        const entry = JSON.parse(entryStr);
        return entry.kakaoId === kakaoId;
      } catch {
        return false;
      }
    });
    
    if (alreadyInGlobalList) {
      console.warn(`⚠️ 데이터 불일치 감지: ${kakaoId}가 이미 전역 목록에 있음`);
      return c.json({ error: "이미 참여한 럭키드로우입니다.", success: false }, 400);
    }
    
    // 포인트 확인
    if (userData.points < entryPoints) {
      return c.json({ error: "Insufficient points", success: false }, 400);
    }
    
    // 포인트 차감
    userData.points -= entryPoints;
    
    // 참여 내역 추가
    const entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName,
      entryPoints,
      enteredAt: new Date().toISOString(),
      status: 'pending',
      userId: userData.userId,
    };
    userData.luckyDrawEntries.unshift(entry);
    
    // 거래 내역 추가
    userData.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'lucky_draw',
      amount: -entryPoints,
      description: `${productName} 럭키드로우 참여`,
      createdAt: new Date().toISOString(),
    });
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    // 전역 참여자 목록에 추가
    await kv.set(`luckydraw:${productId}:${entry.id}`, JSON.stringify({
      entryId: entry.id,
      kakaoId,
      userId: userData.userId,
      userName: userData.userName,
      enteredAt: entry.enteredAt,
    }));
    
    return c.json({
      success: true,
      entry,
      points: userData.points,
    });
  } catch (error) {
    console.error("Enter lucky draw error:", error);
    return c.json({ 
      error: "Failed to enter lucky draw", 
      details: String(error) 
    }, 500);
  }
});

// 럭키드로우 참여자 수 조회
app.get("/make-server-53dba95c/lucky-draw/:productId/entries", async (c) => {
  try {
    const productId = c.req.param("productId");
    
    const entries = await kv.getByPrefix(`luckydraw:${productId}:`);
    
    return c.json({
      success: true,
      count: entries.length,
      entries: entries.map(e => JSON.parse(e)),
    });
  } catch (error) {
    console.error("Get lucky draw entries error:", error);
    return c.json({ 
      error: "Failed to get entries", 
      details: String(error) 
    }, 500);
  }
});

// 배송 요청
app.post("/make-server-53dba95c/user/:kakaoId/shipping/request", async (c) => {
  try {
    const kakaoId = c.req.param("kakaoId");
    const { ticketId, shippingInfo } = await c.req.json();
    
    const userDataStr = await kv.get(`userdata:${kakaoId}`);
    if (!userDataStr) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const userData = JSON.parse(userDataStr);
    const ticketIndex = userData.winningTickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    
    userData.winningTickets[ticketIndex].shippingRequested = true;
    userData.winningTickets[ticketIndex].shippingInfo = {
      ...shippingInfo,
      requestedAt: new Date().toISOString(),
    };
    userData.winningTickets[ticketIndex].status = 'shipped';
    
    await kv.set(`userdata:${kakaoId}`, JSON.stringify(userData));
    
    // 배송 요청 목록에 추가 (관리자용)
    const shippingRequest = {
      ticketId,
      kakaoId,
      userId: userData.userId,
      userName: userData.userName,
      ticket: userData.winningTickets[ticketIndex],
      shippingInfo,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    await kv.set(`shipping:${ticketId}`, JSON.stringify(shippingRequest));
    
    return c.json({
      success: true,
      ticket: userData.winningTickets[ticketIndex],
    });
  } catch (error) {
    console.error("Request shipping error:", error);
    return c.json({ 
      error: "Failed to request shipping", 
      details: String(error) 
    }, 500);
  }
});

// ============================================
// 관리자 API - 상품 관리
// ============================================

// 상품 목록 조회 (공개 API)
app.get("/make-server-53dba95c/products/:ticketType", async (c) => {
  try {
    const ticketType = c.req.param("ticketType");
    const productsStr = await kv.get(`products:${ticketType}`);
    
    if (!productsStr) {
      return c.json({ success: true, products: [] });
    }
    
    const products = JSON.parse(productsStr);
    // 활성화된 상품만 반환
    const activeProducts = products.filter((p: any) => p.isActive !== false);
    
    return c.json({ success: true, products: activeProducts });
  } catch (error) {
    console.error("Get products error:", error);
    return c.json({ error: "Failed to get products", details: String(error) }, 500);
  }
});

// 모든 티켓 타입의 상품 목록 조회 (관리자용)
app.get("/make-server-53dba95c/admin/products/all", async (c) => {
  // 🔐 관리자 인증 체크
  const adminSecret = getAdminSecretFromHeaders(c);
  if (!(await validateAdminAuth(adminSecret))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const ticketTypes = ['diamond', 'gold', 'platinum', 'ruby', 'jewelry', 'beauty', 'meat'];
    const allProducts: any = {};
    
    for (const ticketType of ticketTypes) {
      const productsStr = await kv.get(`products:${ticketType}`);
      allProducts[ticketType] = productsStr ? JSON.parse(productsStr) : [];
    }
    
    return c.json({ success: true, products: allProducts });
  } catch (error) {
    console.error("Get all products error:", error);
    return c.json({ error: "Failed to get all products", details: String(error) }, 500);
  }
});

// 특정 티켓 타입의 상품 목록 조회 (관리자용 - 비활성 포함)
app.get("/make-server-53dba95c/admin/products/:ticketType", async (c) => {
  console.log("━━━━ /admin/products/:ticketType REQUEST ━━━━");
  const ticketType = c.req.param("ticketType");
  console.log("📦 Ticket Type:", ticketType);
  
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/products/:ticketType] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/products/:ticketType] Authentication successful!");

  try {
    const productsStr = await kv.get(`products:${ticketType}`);
    
    if (!productsStr) {
      return c.json({ success: true, products: [] });
    }
    
    return c.json({ success: true, products: JSON.parse(productsStr) });
  } catch (error) {
    console.error("Get admin products error:", error);
    return c.json({ error: "Failed to get products", details: String(error) }, 500);
  }
});

// 상품 추가 (관리자)
app.post("/make-server-53dba95c/admin/products/:ticketType", async (c) => {
  console.log("━━━━ /admin/products/:ticketType POST REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [POST /admin/products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [POST /admin/products] Authentication successful!");

  try {
    const ticketType = c.req.param("ticketType");
    const { name, brand, imageUrl, points, probability, stock } = await c.req.json();
    
    const productsStr = await kv.get(`products:${ticketType}`);
    const products = productsStr ? JSON.parse(productsStr) : [];
    
    const newProduct = {
      id: `prod_${ticketType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketType,
      name,
      brand,
      imageUrl,
      points,
      probability: probability || 5,
      stock: stock || 999,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    products.push(newProduct);
    
    // ✅ 가중치 시스템: 확률 합계가 100%일 필요 없음!
    // 각 상품의 probability 값은 가중치로 사용되며, 전체 합계에 대한 비율로 계산됩니다.
    // 예: A=30, B=20, C=50 → 총합 100 → 30%, 20%, 50%
    // 예: A=3, B=2, C=5 → 총합 10 → 30%, 20%, 50%
    
    await kv.set(`products:${ticketType}`, JSON.stringify(products));
    
    console.log(`Product added to ${ticketType}:`, newProduct.id);
    
    return c.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Add product error:", error);
    return c.json({ error: "Failed to add product", details: String(error) }, 500);
  }
});

// 상품 수정 (관리자)
app.put("/make-server-53dba95c/admin/products/:ticketType/:productId", async (c) => {
  console.log("━━━━ /admin/products/:ticketType/:productId PUT REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [PUT /admin/products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [PUT /admin/products] Authentication successful!");

  try {
    const ticketType = c.req.param("ticketType");
    const productId = c.req.param("productId");
    const updates = await c.req.json();
    
    console.log(`🔍 [PUT /admin/products] ticketType: ${ticketType}, productId: ${productId}`);
    
    const productsStr = await kv.get(`products:${ticketType}`);
    if (!productsStr) {
      console.error(`❌ [PUT /admin/products] No products found for ticketType: ${ticketType}`);
      return c.json({ error: "Products not found" }, 404);
    }
    
    const products = JSON.parse(productsStr);
    console.log(`🔍 [PUT /admin/products] Total products: ${products.length}`);
    console.log(`🔍 [PUT /admin/products] Product IDs: ${products.map((p: any) => p.id).join(', ')}`);
    
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex === -1) {
      console.error(`❌ [PUT /admin/products] Product not found: ${productId}`);
      console.error(`Available IDs: ${products.map((p: any) => p.id).join(', ')}`);
      return c.json({ error: "Product not found", requestedId: productId, availableIds: products.map((p: any) => p.id) }, 404);
    }
    
    products[productIndex] = { ...products[productIndex], ...updates, updatedAt: new Date().toISOString() };
    
    // ✅ 가중치 시스템: 확률 합계가 100%일 필요 없음!
    // 프론트엔드에서 전체 가중치 합계 대비 비율로 자동 계산됩니다.
    
    await kv.set(`products:${ticketType}`, JSON.stringify(products));
    
    console.log(`Product updated: ${productId}`);
    
    return c.json({ success: true, product: products[productIndex] });
  } catch (error) {
    console.error("Update product error:", error);
    return c.json({ error: "Failed to update product", details: String(error) }, 500);
  }
});

// 상품 삭제 (관리자)
app.delete("/make-server-53dba95c/admin/products/:ticketType/:productId", async (c) => {
  console.log("━━━━ /admin/products/:ticketType/:productId DELETE REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [DELETE /admin/products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [DELETE /admin/products] Authentication successful!");

  try {
    const ticketType = c.req.param("ticketType");
    const productId = c.req.param("productId");
    
    const productsStr = await kv.get(`products:${ticketType}`);
    if (!productsStr) {
      return c.json({ error: "Products not found" }, 404);
    }
    
    const products = JSON.parse(productsStr);
    const filteredProducts = products.filter((p: any) => p.id !== productId);
    
    if (products.length === filteredProducts.length) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    await kv.set(`products:${ticketType}`, JSON.stringify(filteredProducts));
    
    console.log(`Product deleted: ${productId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return c.json({ error: "Failed to delete product", details: String(error) }, 500);
  }
});

// ============================================
// 관리자 API - 회원 관리
// ============================================

// 전체 회원 목록 조회
app.get("/make-server-53dba95c/admin/users", async (c) => {
  console.log("━━━━ /admin/users REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/users] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/users] Authentication successful!");

  try {
    const usersData = await kv.getByPrefix("userdata:");
    const users = usersData.map((userData: string) => {
      const user = JSON.parse(userData);
      return {
        kakaoId: user.kakaoId,
        userId: user.userId,
        userName: user.userName,
        email: user.email || '',  // 🔥 이메일 추가
        points: user.points,
        winningTicketsCount: user.winningTickets?.length || 0,
        transactionsCount: user.transactions?.length || 0,
        createdAt: user.createdAt,
      };
    });
    
    return c.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: "Failed to get users", details: String(error) }, 500);
  }
});

// 🔥 회원 데이터 삭제 (완전 초기화)
app.delete("/make-server-53dba95c/admin/users/:kakaoId", async (c) => {
  console.log("━━━━ /admin/users/:kakaoId DELETE REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [DELETE /admin/users] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [DELETE /admin/users] Authentication successful!");

  try {
    const kakaoId = c.req.param("kakaoId");
    
    console.log(`🗑️ Deleting user data for kakaoId: ${kakaoId}`);
    
    // 1. 사용자 데이터 삭제
    await kv.del(`userdata:${kakaoId}`);
    console.log(`✅ Deleted userdata:${kakaoId}`);
    
    // 2. 관련 데이터도 삭제 (필요시)
    // - 럭키드로우 참여 내역
    const luckyDrawKeys = await kv.getByPrefix(`lucky-draw-entry:`);
    for (const entryStr of luckyDrawKeys) {
      const entry = JSON.parse(entryStr);
      if (entry.kakaoId === kakaoId) {
        await kv.del(`lucky-draw-entry:${entry.luckyDrawId}:${kakaoId}`);
        console.log(`✅ Deleted lucky-draw-entry:${entry.luckyDrawId}:${kakaoId}`);
      }
    }
    
    // - 거래소 등록 티켓
    const exchangeTickets = await kv.getByPrefix(`exchange-ticket:`);
    for (const ticketStr of exchangeTickets) {
      const ticket = JSON.parse(ticketStr);
      if (ticket.sellerKakaoId === kakaoId || ticket.buyerKakaoId === kakaoId) {
        await kv.del(`exchange-ticket:${ticket.id}`);
        console.log(`✅ Deleted exchange-ticket:${ticket.id}`);
      }
    }
    
    console.log(`✅ User ${kakaoId} completely deleted`);
    
    return c.json({ 
      success: true, 
      message: `회원 ${kakaoId}의 모든 데이터가 삭제되었습니다.` 
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Failed to delete user", details: String(error) }, 500);
  }
});

// ============================================
// 관리자 API - 럭키드로우 관리
// ============================================

// 🌟 일반 사용자용 럭키드로우 목록 조회 (인증 불필요)
app.get("/make-server-53dba95c/lucky-draws", async (c) => {
  console.log("━━━━ /lucky-draws REQUEST (PUBLIC) ━━━━");
  
  try {
    const luckyDrawsStr = await kv.get("lucky-draws");
    const luckyDraws = luckyDrawsStr ? JSON.parse(luckyDrawsStr) : [];
    
    console.log(`✅ Found ${luckyDraws.length} lucky draws`);
    return c.json({ success: true, luckyDraws });
  } catch (error) {
    console.error("Get lucky draws error:", error);
    return c.json({ error: "Failed to fetch lucky draws", details: String(error) }, 500);
  }
});

// 럭키드로우 상품 목록 조회 (관리자 전용)
app.get("/make-server-53dba95c/admin/lucky-draws", async (c) => {
  console.log("━━━━ /admin/lucky-draws REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/lucky-draws] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/lucky-draws] Authentication successful!");

  try {
    const luckyDrawsStr = await kv.get("lucky-draws");
    const luckyDraws = luckyDrawsStr ? JSON.parse(luckyDrawsStr) : [];
    
    return c.json({ success: true, luckyDraws });
  } catch (error) {
    console.error("Get lucky draws error:", error);
    return c.json({ error: "Failed to get lucky draws", details: String(error) }, 500);
  }
});

// 럭키드로우 상품 추가
app.post("/make-server-53dba95c/admin/lucky-draws", async (c) => {
  console.log("━━━━ /admin/lucky-draws POST REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [POST /admin/lucky-draws] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [POST /admin/lucky-draws] Authentication successful!");

  try {
    const { name, brand, imageUrl, entryPoints, endDate, maxParticipants } = await c.req.json();
    
    const luckyDrawsStr = await kv.get("lucky-draws");
    const luckyDraws = luckyDrawsStr ? JSON.parse(luckyDrawsStr) : [];
    
    const newLuckyDraw = {
      id: `luckydraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      brand,
      imageUrl,
      entryPoints,
      endDate,
      maxParticipants: maxParticipants || 1000,
      participants: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    luckyDraws.push(newLuckyDraw);
    await kv.set("lucky-draws", JSON.stringify(luckyDraws));
    
    console.log("Lucky draw created:", newLuckyDraw.id);
    
    return c.json({ success: true, luckyDraw: newLuckyDraw });
  } catch (error) {
    console.error("Create lucky draw error:", error);
    return c.json({ error: "Failed to create lucky draw", details: String(error) }, 500);
  }
});

// 럭키드로우 참여자 목록 조회
app.get("/make-server-53dba95c/admin/lucky-draws/:luckyDrawId/participants", async (c) => {
  console.log("━━━━ /admin/lucky-draws/:luckyDrawId/participants REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/lucky-draws participants] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/lucky-draws participants] Authentication successful!");

  try {
    const luckyDrawId = c.req.param("luckyDrawId");
    
    // 모든 유저 데이터 조회
    const usersData = await kv.getByPrefix("userdata:");
    const participants: any[] = [];
    
    usersData.forEach((userDataStr: string) => {
      const userData = JSON.parse(userDataStr);
      const entries = userData.luckyDrawEntries || [];
      
      entries.forEach((entry: any) => {
        if (entry.productId === luckyDrawId) {
          participants.push({
            userId: userData.userId,
            userName: userData.userName,
            kakaoId: userData.kakaoId,
            enteredAt: entry.enteredAt,
            status: entry.status,
          });
        }
      });
    });
    
    return c.json({ success: true, participants, count: participants.length });
  } catch (error) {
    console.error("Get lucky draw participants error:", error);
    return c.json({ error: "Failed to get participants", details: String(error) }, 500);
  }
});

// 럭키드로우 당첨자 선정
app.post("/make-server-53dba95c/admin/lucky-draws/:luckyDrawId/draw-winner", async (c) => {
  console.log("━━━━ /admin/lucky-draws/:luckyDrawId/draw-winner POST REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [POST /admin/lucky-draws draw-winner] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [POST /admin/lucky-draws draw-winner] Authentication successful!");

  try {
    const luckyDrawId = c.req.param("luckyDrawId");
    
    // 모든 유저 데이터 조회
    const usersData = await kv.getByPrefix("userdata:");
    const eligibleUsers: any[] = [];
    
    usersData.forEach((userDataStr: string) => {
      const userData = JSON.parse(userDataStr);
      const entries = userData.luckyDrawEntries || [];
      
      const hasEntry = entries.some((entry: any) => 
        entry.productId === luckyDrawId && entry.status === 'pending'
      );
      
      if (hasEntry) {
        eligibleUsers.push({ kakaoId: userData.kakaoId, userData });
      }
    });
    
    if (eligibleUsers.length === 0) {
      return c.json({ error: "No eligible participants" }, 400);
    }
    
    // 랜덤 당첨자 선정
    const winnerIndex = Math.floor(Math.random() * eligibleUsers.length);
    const winner = eligibleUsers[winnerIndex];
    
    // 당첨자 데이터 업데이트
    const winnerData = winner.userData;
    const entryIndex = winnerData.luckyDrawEntries.findIndex(
      (e: any) => e.productId === luckyDrawId && e.status === 'pending'
    );
    
    if (entryIndex !== -1) {
      winnerData.luckyDrawEntries[entryIndex].status = 'won';
      await kv.set(`userdata:${winner.kakaoId}`, JSON.stringify(winnerData));
    }
    
    // 나머지 참여자들 상태 업데이트
    for (const user of eligibleUsers) {
      if (user.kakaoId !== winner.kakaoId) {
        const userData = user.userData;
        const entryIndex = userData.luckyDrawEntries.findIndex(
          (e: any) => e.productId === luckyDrawId && e.status === 'pending'
        );
        
        if (entryIndex !== -1) {
          userData.luckyDrawEntries[entryIndex].status = 'lost';
          await kv.set(`userdata:${user.kakaoId}`, JSON.stringify(userData));
        }
      }
    }
    
    console.log(`Lucky draw winner selected: ${winner.kakaoId}`);
    
    return c.json({ 
      success: true, 
      winner: {
        kakaoId: winner.kakaoId,
        userName: winnerData.userName,
      },
      totalParticipants: eligibleUsers.length,
    });
  } catch (error) {
    console.error("Draw winner error:", error);
    return c.json({ error: "Failed to draw winner", details: String(error) }, 500);
  }
});

// ============================================
// 관리자 API - 배송 관리
// ============================================

// 배송 요청 목록 조회
app.get("/make-server-53dba95c/admin/shipping", async (c) => {
  console.log("━━━━ /admin/shipping REQUEST ━━━━");
  console.log("📋 All headers:");
  const allHeaders = Object.fromEntries(c.req.raw.headers.entries());
  for (const [key, value] of Object.entries(allHeaders)) {
    if (key.toLowerCase() === 'x-admin-secret') {
      console.log(`   ${key}: ${value ? value.substring(0, 3) + '***' : 'NULL'}`);
    } else if (key.toLowerCase() === 'authorization') {
      console.log(`   ${key}: ${value ? value.substring(0, 20) + '...' : 'NULL'}`);
    } else {
      console.log(`   ${key}: ${value}`);
    }
  }
  
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Final extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/shipping] Authentication failed!");
    return c.json({ error: "Unauthorized", message: "Invalid or missing X-Admin-Secret header" }, 401);
  }
  
  console.log("✅ [/admin/shipping] Authentication successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const shippingKeys = await kv.getByPrefix("shipping:");
    const requests = shippingKeys.map(key => JSON.parse(key));
    
    // 최신순 정렬
    requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    
    return c.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get shipping requests error:", error);
    return c.json({ error: "Failed to get shipping requests", details: String(error) }, 500);
  }
});

// 배송 상태 업데이트
app.put("/make-server-53dba95c/admin/shipping/:ticketId", async (c) => {
  console.log("━━━━ /admin/shipping/:ticketId PUT REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/shipping PUT] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/shipping PUT] Authentication successful!");

  try {
    const ticketId = c.req.param("ticketId");
    const { status } = await c.req.json();
    
    // 배송 요청 정보 조회
    const shippingStr = await kv.get(`shipping:${ticketId}`);
    if (!shippingStr) {
      return c.json({ error: "Shipping request not found" }, 404);
    }
    
    const shipping = JSON.parse(shippingStr);
    
    // 상태 업데이트
    shipping.status = status;
    shipping.updatedAt = new Date().toISOString();
    
    await kv.set(`shipping:${ticketId}`, JSON.stringify(shipping));
    
    // 사용자의 티켓 상태도 업데이트
    const userDataStr = await kv.get(`userdata:${shipping.kakaoId}`);
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      const ticketIndex = userData.winningTickets.findIndex(t => t.id === ticketId);
      
      if (ticketIndex !== -1) {
        userData.winningTickets[ticketIndex].status = status === 'delivered' ? 'delivered' : 'shipped';
        await kv.set(`userdata:${shipping.kakaoId}`, JSON.stringify(userData));
      }
    }
    
    return c.json({
      success: true,
      shipping,
    });
  } catch (error) {
    console.error("Update shipping status error:", error);
    return c.json({ error: "Failed to update shipping status", details: String(error) }, 500);
  }
});

// ============================================
// 관리자 API - 통계
// ============================================

// 대시보드 통계 조회
app.get("/make-server-53dba95c/admin/stats", async (c) => {
  console.log("━━━━ /admin/stats REQUEST ━━━━");
  console.log("📋 All headers:");
  const allHeaders = Object.fromEntries(c.req.raw.headers.entries());
  for (const [key, value] of Object.entries(allHeaders)) {
    if (key.toLowerCase() === 'x-admin-secret') {
      console.log(`   ${key}: ${value ? value.substring(0, 3) + '***' : 'NULL'}`);
    } else if (key.toLowerCase() === 'authorization') {
      console.log(`   ${key}: ${value ? value.substring(0, 20) + '...' : 'NULL'}`);
    } else {
      console.log(`   ${key}: ${value}`);
    }
  }
  
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Final extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/stats] Authentication failed!");
    return c.json({ error: "Unauthorized", message: "Invalid or missing X-Admin-Secret header" }, 401);
  }
  
  console.log("✅ [/admin/stats] Authentication successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // 전체 회원 수
    const usersData = await kv.getByPrefix("userdata:");
    const totalUsers = usersData.length;
    
    // 총 포인트 충전액 계산
    let totalPointsCharged = 0;
    let totalTicketsSold = 0;
    
    usersData.forEach((userDataStr: string) => {
      const userData = JSON.parse(userDataStr);
      const transactions = userData.transactions || [];
      
      transactions.forEach((tx: any) => {
        if (tx.type === 'charge') {
          totalPointsCharged += tx.amount;
        } else if (tx.type === 'ticket_purchase') {
          totalTicketsSold++;
        }
      });
    });
    
    return c.json({
      success: true,
      stats: {
        totalUsers,
        totalPointsCharged,
        totalTicketsSold,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return c.json({ error: "Failed to get stats", details: String(error) }, 500);
  }
});

// ============================================
// 홈 메인 상품 API (일반 사용자)
// ============================================

// 홈 메인 상품 목록 조회 (일반 사용자용 - 인증 불필요)
app.get("/make-server-53dba95c/home-products", async (c) => {
  try {
    const homeProductsStr = await kv.get("home:featured-products");
    
    if (!homeProductsStr) {
      return c.json({ success: true, products: [] });
    }
    
    return c.json({ success: true, products: JSON.parse(homeProductsStr) });
  } catch (error) {
    console.error("Get home products error:", error);
    return c.json({ error: "Failed to get home products", details: String(error) }, 500);
  }
});

// ============================================
// 관리자 API - 홈 메인 상품 관리
// ============================================

// 홈 메인 상품 목록 조회 (관리자용)
app.get("/make-server-53dba95c/admin/home-products", async (c) => {
  console.log("━━━━ /admin/home-products REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [/admin/home-products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [/admin/home-products] Authentication successful!");

  try {
    const homeProductsStr = await kv.get("home:featured-products");
    
    if (!homeProductsStr) {
      return c.json({ success: true, products: [] });
    }
    
    return c.json({ success: true, products: JSON.parse(homeProductsStr) });
  } catch (error) {
    console.error("Get home products error:", error);
    return c.json({ error: "Failed to get home products", details: String(error) }, 500);
  }
});

// 홈 메인 상품 추가
app.post("/make-server-53dba95c/admin/home-products", async (c) => {
  console.log("━━━━ /admin/home-products POST REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [POST /admin/home-products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [POST /admin/home-products] Authentication successful!");

  try {
    const { ticketType, productId } = await c.req.json();
    
    // 해당 티켓의 상품 조회
    const productsStr = await kv.get(`products:${ticketType}`);
    if (!productsStr) {
      return c.json({ error: "Ticket type not found" }, 404);
    }
    
    const products = JSON.parse(productsStr);
    const product = products.find((p: any) => p.id === productId);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    // 홈 메인 상품 목록 가져오기
    const homeProductsStr = await kv.get("home:featured-products");
    const homeProducts = homeProductsStr ? JSON.parse(homeProductsStr) : [];
    
    // 중복 체크
    const exists = homeProducts.some((p: any) => p.id === productId && p.ticketType === ticketType);
    if (exists) {
      return c.json({ error: "Product already added" }, 400);
    }
    
    // 새 상품 추가 (ticketType 포함)
    const newHomeProduct = {
      id: productId,
      name: product.name,
      brand: product.brand,
      points: product.points,
      imageUrl: product.imageUrl,
      ticketType,
      addedAt: new Date().toISOString(),
    };
    
    homeProducts.push(newHomeProduct);
    await kv.set("home:featured-products", JSON.stringify(homeProducts));
    
    console.log(`Home product added: ${productId} from ${ticketType}`);
    
    return c.json({ success: true, product: newHomeProduct });
  } catch (error) {
    console.error("Add home product error:", error);
    return c.json({ error: "Failed to add home product", details: String(error) }, 500);
  }
});

// 홈 메인 상품 삭제
app.delete("/make-server-53dba95c/admin/home-products/:ticketType/:productId", async (c) => {
  console.log("━━━━ /admin/home-products DELETE REQUEST ━━━━");
  const adminSecret = getAdminSecretFromHeaders(c);
  console.log("🔍 Extracted secret:", adminSecret ? `${adminSecret.substring(0, 3)}***` : "NOT FOUND");
  
  // 🔐 관리자 인증 체크
  const isValid = await validateAdminAuth(adminSecret);
  if (!isValid) {
    console.error("❌ [DELETE /admin/home-products] Authentication failed!");
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log("✅ [DELETE /admin/home-products] Authentication successful!");

  try {
    const ticketType = c.req.param("ticketType");
    const productId = c.req.param("productId");
    
    const homeProductsStr = await kv.get("home:featured-products");
    if (!homeProductsStr) {
      return c.json({ error: "No home products found" }, 404);
    }
    
    const homeProducts = JSON.parse(homeProductsStr);
    const filteredProducts = homeProducts.filter(
      (p: any) => !(p.id === productId && p.ticketType === ticketType)
    );
    
    if (filteredProducts.length === homeProducts.length) {
      return c.json({ error: "Product not found in home products" }, 404);
    }
    
    await kv.set("home:featured-products", JSON.stringify(filteredProducts));
    
    console.log(`Home product removed: ${productId} from ${ticketType}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Remove home product error:", error);
    return c.json({ error: "Failed to remove home product", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
