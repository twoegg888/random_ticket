import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { CHARGE_PRODUCTS } from "../constants/chargeProducts";

function ChargeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState(CHARGE_PRODUCTS[0]?.amount ?? 10000);
  const [isProcessing, setIsProcessing] = useState(false);
  const { userData, isLoggedIn } = useApp();

  if (!isOpen) return null;

  const selectedProduct = CHARGE_PRODUCTS.find((item) => item.amount === selectedAmount);

  const handleConfirm = async () => {
    if (!selectedProduct || !userData.kakaoId) return;

    setIsProcessing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c/payments/charges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            amount: selectedProduct.amount,
            productCode: selectedProduct.productCode,
            kakaoId: userData.kakaoId,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok || !result.success || !result.checkoutUrl) {
        throw new Error(result.error || "Failed to create Cafe24 checkout URL.");
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Cafe24 charge create error:", error);
      alert(error instanceof Error ? error.message : "Failed to move to checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[480px] rounded-t-[24px] bg-white px-6 pb-6 pt-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-black">Point Charge</h2>
            <p className="mt-1 text-[13px] text-[#666]">
              Select an amount and continue to the Cafe24 checkout page.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-[13px] text-[#666]"
            disabled={isProcessing}
          >
            Close
          </button>
        </div>

        {!isLoggedIn && (
          <div className="mb-4 rounded-xl bg-[#fff3f3] px-4 py-3 text-[13px] text-[#b42318]">
            Sign in before charging points.
          </div>
        )}

        <div className="space-y-3">
          {CHARGE_PRODUCTS.map((product) => (
            <label
              key={product.productCode}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#e5e7eb] px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="chargeAmount"
                  value={product.amount}
                  checked={selectedAmount === product.amount}
                  onChange={() => setSelectedAmount(product.amount)}
                  className="size-4 accent-black"
                />
                <div>
                  <div className="text-[16px] font-semibold text-black">
                    {product.amount.toLocaleString()} KRW
                  </div>
                  <div className="mt-1 text-[13px] text-[#666]">
                    Credit {product.points.toLocaleString()}P
                  </div>
                </div>
              </div>
              {product.bonus > 0 ? (
                <span className="rounded-full bg-[#fff2f2] px-3 py-1 text-[12px] font-medium text-[#d92d20]">
                  Bonus {product.bonus.toLocaleString()}P
                </span>
              ) : product.label ? (
                <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] font-medium text-[#175cd3]">
                  {product.label}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!isLoggedIn || isProcessing || !selectedProduct}
          className="mt-5 h-[52px] w-full rounded-xl bg-black text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#999]"
        >
          {isProcessing ? "Moving..." : "Go to Cafe24 Checkout"}
        </button>
      </div>
    </div>
  );
}

export default function Points() {
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const { userData, isLoggedIn, refreshUserData } = useApp();

  useEffect(() => {
    if (!isLoggedIn) return;
    void refreshUserData();
  }, [isLoggedIn, refreshUserData]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f7f7f8]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-black">Points</h1>
            <p className="mt-1 text-[13px] text-[#666]">
              Charges are processed through Cafe24.
            </p>
          </div>
          <Link to="/" className="text-[14px] text-[#666]">
            Home
          </Link>
        </div>
      </div>

      <div className="p-6">
        <section className="rounded-[24px] bg-white p-6 shadow-sm">
          <p className="text-[13px] text-[#666]">Current balance</p>
          <p className="mt-2 text-[32px] font-semibold text-black">
            {(userData.points || 0).toLocaleString()}P
          </p>
          <p className="mt-3 text-[13px] text-[#666]">
            Points are credited only after server-side verification.
          </p>
          <button
            onClick={() => setIsChargeOpen(true)}
            disabled={!isLoggedIn}
            className="mt-5 h-[52px] w-full rounded-xl bg-black text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#999]"
          >
            Charge Points
          </button>
        </section>

        <section className="mt-4 rounded-[24px] bg-white p-6 shadow-sm">
          <h2 className="text-[17px] font-semibold text-black">Flow</h2>
          <ul className="mt-3 space-y-2 text-[13px] text-[#666]">
            <li>The app creates an internal order first.</li>
            <li>The user pays on Cafe24.</li>
            <li>The backend verifies the order before crediting points.</li>
          </ul>
        </section>
      </div>

      <ChargeModal isOpen={isChargeOpen} onClose={() => setIsChargeOpen(false)} />
    </div>
  );
}
