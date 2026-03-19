import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const PENDING_CHARGE_STORAGE_KEY = "pending_cafe24_charge";

type ChargeStatus =
  | "pending"
  | "checkout_started"
  | "payment_detected"
  | "paid"
  | "credited"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ChargeStatus | "loading">("loading");
  const [error, setError] = useState<string | null>(null);
  const { refreshUserData } = useApp();
  const storedPendingCharge = (() => {
    try {
      const raw = localStorage.getItem(PENDING_CHARGE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const internalOrderId =
    searchParams.get("internalOrderId") ||
    searchParams.get("internal_order_id") ||
    searchParams.get("merchant_order_id") ||
    storedPendingCharge?.internalOrderId;

  const cafe24OrderId =
    searchParams.get("cafe24OrderId") ||
    searchParams.get("cafe24_order_id") ||
    searchParams.get("orderId") ||
    searchParams.get("order_id") ||
    searchParams.get("order_no");

  useEffect(() => {
    if (!internalOrderId && !cafe24OrderId) {
      setError("Missing internal order ID and Cafe24 order ID.");
      setStatus("failed");
      return;
    }

    let cancelled = false;
    let pollTimer: number | undefined;

    const postRedirectEvent = async () => {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/payments/cafe24/redirect-complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            internalOrderId,
            cafe24OrderId,
            query: Object.fromEntries(searchParams.entries()),
            currentUrl: window.location.href,
          }),
        },
      );
    };

    const verifyPayment = async () => {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/payments/cafe24/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            internalOrderId,
            cafe24OrderId,
          }),
        },
      );

      const result = await response.json();
      if (response.ok && result.success) {
        return { status: "credited" as const };
      }

      if (response.status === 202) {
        return { status: (result.status || "payment_detected") as ChargeStatus };
      }

      throw new Error(result.error || "Payment verification failed.");
    };

    const fetchChargeStatus = async () => {
      if (!internalOrderId) {
        throw new Error("Missing internal order ID for charge status lookup.");
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/payments/charges/${internalOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load charge status.");
      }

      return result.status as ChargeStatus;
    };

    const run = async () => {
      try {
        await postRedirectEvent();

        let nextStatus: ChargeStatus | "loading" = "loading";

        try {
          const verifyResult = await verifyPayment();
          nextStatus = verifyResult.status;
        } catch (verifyError) {
          console.error("Initial verify failed:", verifyError);
          nextStatus = await fetchChargeStatus();
        }

        if (cancelled) return;
        setStatus(nextStatus);

        if (nextStatus === "credited") {
          localStorage.removeItem(PENDING_CHARGE_STORAGE_KEY);
          await refreshUserData();
          window.setTimeout(() => {
            navigate("/points", { replace: true });
          }, 1800);
          return;
        }

        let attempts = 0;
        if (!internalOrderId) {
          return;
        }

        pollTimer = window.setInterval(async () => {
          attempts += 1;

          try {
            const polledStatus = await fetchChargeStatus();
            if (cancelled) return;

            setStatus(polledStatus);

            if (polledStatus === "credited") {
              window.clearInterval(pollTimer);
              localStorage.removeItem(PENDING_CHARGE_STORAGE_KEY);
              await refreshUserData();
              window.setTimeout(() => {
                navigate("/points", { replace: true });
              }, 1800);
              return;
            }

            if (["failed", "cancelled", "expired", "refunded"].includes(polledStatus)) {
              window.clearInterval(pollTimer);
            }

            if (attempts >= 15) {
              window.clearInterval(pollTimer);
            }
          } catch (pollError) {
            console.error("Charge status poll failed:", pollError);
            if (attempts >= 15) {
              window.clearInterval(pollTimer);
              if (!cancelled) {
                setError("Charge status is still pending. Please check again later.");
              }
            }
          }
        }, 2000);
      } catch (runError) {
        console.error("Payment success flow error:", runError);
        if (!cancelled) {
          setError(runError instanceof Error ? runError.message : "Payment processing failed.");
          setStatus("failed");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearInterval(pollTimer);
    };
  }, [cafe24OrderId, internalOrderId, navigate, searchParams]);

  if (error) {
    return (
      <div className="mx-auto flex h-screen w-full max-w-[480px] items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <svg className="size-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="mb-2 text-[20px] font-semibold text-red-600">Verification failed</p>
          <p className="text-[14px] text-[#666]">{error}</p>
          <button
            onClick={() => navigate("/points", { replace: true })}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-[14px] font-semibold text-white"
          >
            Back to points
          </button>
        </div>
      </div>
    );
  }

  const isDone = status === "credited";
  const isTerminalError = ["failed", "cancelled", "expired", "refunded"].includes(status);

  return (
    <div className="mx-auto flex h-screen w-full max-w-[480px] items-center justify-center bg-white px-6">
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${
            isDone ? "bg-green-100" : isTerminalError ? "bg-red-100" : "bg-gray-100"
          }`}
        >
          {isDone ? (
            <svg className="size-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isTerminalError ? (
            <svg className="size-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          )}
        </div>

        <p className={`mb-2 text-[20px] font-semibold ${isDone ? "text-green-600" : "text-black"}`}>
          {isDone ? "Points credited" : isTerminalError ? "Charge needs review" : "Verifying payment"}
        </p>

        <p className="text-[14px] text-[#666]">
          {isDone
            ? "The backend verified the Cafe24 payment and credited points."
            : isTerminalError
              ? "The charge did not complete cleanly or needs manual review."
              : "The backend is checking Cafe24 order and payment state."}
        </p>

        {internalOrderId && (
          <p className="mt-4 text-[12px] text-[#999]">Internal order ID: {internalOrderId}</p>
        )}
        {!internalOrderId && cafe24OrderId && (
          <p className="mt-4 text-[12px] text-[#999]">Cafe24 order ID: {cafe24OrderId}</p>
        )}

        <button
          onClick={() => navigate("/points", { replace: true })}
          className="mt-6 rounded-xl bg-black px-6 py-3 text-[14px] font-semibold text-white"
        >
          Back to points
        </button>
      </div>
    </div>
  );
}
