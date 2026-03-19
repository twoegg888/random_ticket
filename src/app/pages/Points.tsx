import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import svgPaths from "../../imports/svg-vzn95yzv5e";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { CHARGE_PRODUCTS } from "../constants/chargeProducts";

const PENDING_CHARGE_STORAGE_KEY = "pending_cafe24_charge";

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
        throw new Error(result.error || "Failed to create checkout URL.");
      }

      localStorage.setItem(
        PENDING_CHARGE_STORAGE_KEY,
        JSON.stringify({
          internalOrderId: result.internalOrderId,
          amount: selectedProduct.amount,
          productCode: selectedProduct.productCode,
          createdAt: new Date().toISOString(),
        }),
      );

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Charge create error:", error);
      alert(error instanceof Error ? error.message : "Failed to move to checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-[480px] rounded-t-[20px] bg-white pb-[20px]">
        <div className="px-[24px] pb-[16px] pt-[24px]">
          <h2 className="mb-[8px] font-['Pretendard:Bold',sans-serif] text-[20px] text-[#020202]">
            포인트 충전
          </h2>
          <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#666]">
            충전 금액을 선택한 뒤 결제를 진행합니다.
          </p>
        </div>

        {!isLoggedIn && (
          <div className="mx-[24px] mb-[16px] rounded-[8px] bg-[#fff3f3] p-[16px] text-[13px] text-[#d92d20]">
            로그인 후 충전할 수 있습니다.
          </div>
        )}

        <div className="mb-[24px] px-[24px]">
          <div className="rounded-[8px] bg-[#f5f5f5] p-[16px]">
            <p className="mb-[8px] font-['Pretendard:Medium',sans-serif] text-[14px] text-[#666]">
              결제 안내
            </p>
            <ul className="space-y-[4px] font-['Pretendard:Regular',sans-serif] text-[13px] text-[#999]">
              <li>선택한 금액으로 결제를 진행합니다.</li>
              <li>결제 완료 후 서버 검증이 끝나면 포인트가 반영됩니다.</li>
              <li>보너스 포인트는 금액별 정책에 따라 자동 적용됩니다.</li>
            </ul>
          </div>
        </div>

        <div className="max-h-[42vh] space-y-[12px] overflow-y-auto px-[24px]">
          {CHARGE_PRODUCTS.map((product) => (
            <label
              key={product.productCode}
              className="flex cursor-pointer items-center justify-between rounded-[12px] border border-[#eaeaea] bg-white px-[16px] py-[14px]"
            >
              <div className="flex items-center gap-[12px]">
                <input
                  type="radio"
                  name="chargeAmount"
                  value={product.amount}
                  checked={selectedAmount === product.amount}
                  onChange={() => setSelectedAmount(product.amount)}
                  className="size-4 accent-black"
                />
                <div>
                  <p className="font-['Pretendard:SemiBold',sans-serif] text-[16px] text-[#020202]">
                    {product.amount.toLocaleString()}원
                  </p>
                  <p className="mt-[2px] font-['Pretendard:Regular',sans-serif] text-[13px] text-[#666]">
                    {product.points.toLocaleString()}P 충전
                  </p>
                </div>
              </div>
              {product.bonus > 0 ? (
                <span className="rounded-full bg-[#111] px-[10px] py-[5px] text-[11px] font-semibold text-white">
                  +{product.bonus.toLocaleString()}P
                </span>
              ) : product.label ? (
                <span className="rounded-full bg-[#f1f1f1] px-[10px] py-[5px] text-[11px] font-semibold text-[#555]">
                  {product.label}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        <div className="mt-[24px] space-y-[12px] px-[24px]">
          <button
            onClick={handleConfirm}
            disabled={!isLoggedIn || isProcessing || !selectedProduct}
            className="h-[52px] w-full rounded-[8px] bg-[#020202] font-['Pretendard:SemiBold',sans-serif] text-[16px] text-white disabled:cursor-not-allowed disabled:bg-[#999]"
          >
            {isProcessing ? "이동 중..." : "결제 진행하기"}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="h-[52px] w-full rounded-[8px] border border-[#ddd] bg-white font-['Pretendard:SemiBold',sans-serif] text-[16px] text-[#666]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute left-0 top-0 h-[56px] w-full bg-white">
      <div className="absolute left-[24px] top-[14px] flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-semibold text-black">
        <p className="leading-[28px]">포인트</p>
      </div>
    </div>
  );
}

function NavItem({
  to,
  active,
  label,
  children,
}: {
  to: string;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const baseText = active ? "text-[#020202]" : "text-[#aeaeae]";

  return (
    <div className="flex min-h-px min-w-px flex-[1_0_0] items-center justify-center">
      {active ? (
        <div className="flex flex-col items-center justify-center">{children}<div className={`pt-[8px] text-[9.375px] ${baseText}`}>{label}</div></div>
      ) : (
        <Link to={to} className="flex flex-col items-center justify-center">
          {children}
          <div className={`pt-[8px] text-[9.375px] ${baseText}`}>{label}</div>
        </Link>
      )}
    </div>
  );
}

function BottomNav() {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 flex h-[64px] w-[480px] -translate-x-1/2 items-center justify-center bg-white">
      <div aria-hidden="true" className="absolute inset-0 border-t border-solid border-[#eaeaea] pointer-events-none" />
      <NavItem to="/" label="홈">
        <div className="size-[24px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11a5580} fill="#DDDDDD" />
          </svg>
        </div>
      </NavItem>
      <NavItem to="/winning-tickets" label="당첨 티켓">
        <div className="size-[24px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p25895e80} fill="#DDDDDD" />
          </svg>
        </div>
      </NavItem>
      <NavItem to="/exchange" label="거래소">
        <div className="size-[24px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p11d16a80} fill="#DDDDDD" />
            <path clipRule="evenodd" d={svgPaths.p27aa6df0} fill="white" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p32251f80} fill="white" fillRule="evenodd" />
          </svg>
        </div>
      </NavItem>
      <NavItem to="/points" active label="포인트 충전">
        <div className="size-[24px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.pace200} fill="#020202" />
            <path d={svgPaths.p3b299900} fill="white" />
          </svg>
        </div>
      </NavItem>
      <NavItem to="/lucky-draw" label="럭키드로우">
        <div className="size-[24px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p1b936200} fill="#AEAEAE" />
            <path d={svgPaths.p32c2ee80} fill="white" />
          </svg>
        </div>
      </NavItem>
    </div>
  );
}

function BalanceCard({
  points,
  onCharge,
}: {
  points: number;
  onCharge: () => void;
}) {
  return (
    <>
      <div className="absolute left-[22px] top-[101px] h-[126px] w-[435px] rounded-[12px] bg-[#f5f5f5]" />
      <div className="absolute left-[51px] top-[133px]">
        <div className="mb-[14px] flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[16px] font-normal tracking-[-0.48px] text-[#020202]">
          <p className="leading-[normal]">보유 포인트</p>
        </div>
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] text-[31px] font-semibold tracking-[-0.93px] text-[#020202]">
          <p className="leading-[normal]">{points.toLocaleString()}P</p>
        </div>
      </div>
      <button onClick={onCharge} className="absolute left-[378px] top-[143px] contents">
        <div className="absolute left-[378px] top-[143px] h-[42px] w-[53px] rounded-[21px] bg-black" />
        <div className="absolute left-[404.5px] top-[164.5px] -translate-x-1/2 -translate-y-1/2 text-center text-[12px] font-bold text-white">
          <p className="leading-[normal]">충전</p>
        </div>
      </button>
    </>
  );
}

export default function Points() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { userData, isLoggedIn, isInitialized, refreshUserData } = useApp();

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate, location]);

  useEffect(() => {
    if (!isInitialized || !isLoggedIn) return;
    void refreshUserData();
  }, [isInitialized, isLoggedIn, refreshUserData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserData();
    window.setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!isInitialized || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-[480px] bg-white">
      <Header />
      <div className="absolute left-0 top-[56px] h-[863px] w-[480px] bg-white" />
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="absolute right-[24px] top-[14px] z-10 rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
        title="포인트 새로고침"
      >
        <svg className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <BalanceCard points={userData.points || 0} onCharge={() => setIsChargeOpen(true)} />

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="absolute left-[411px] top-[267px] -translate-x-1/2 -translate-y-1/2 text-center text-[13px] font-medium tracking-[0.13px] text-[#020202]"
      >
        <p className="leading-[normal]">사용 내역</p>
      </button>
      <div className="absolute left-[444.5px] top-[265px] h-[4.5px] w-[9px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.70711 5.56066">
          <path d={svgPaths.p6cd6900} stroke="black" />
        </svg>
      </div>

      {showHistory && userData.transactions.length > 0 ? (
        <div className="absolute bottom-[100px] left-[22px] right-[22px] top-[295px] overflow-y-auto">
          <div className="space-y-[12px]">
            {userData.transactions.slice(0, 20).map((transaction) => (
              <div key={transaction.id} className="rounded-[8px] border border-[#eee] bg-white p-[16px]">
                <div className="mb-[8px] flex items-start justify-between gap-3">
                  <span className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#020202]">
                    {transaction.description}
                  </span>
                  <span
                    className={`font-['Pretendard:Bold',sans-serif] text-[16px] ${
                      transaction.amount > 0 ? "text-[#4caf50]" : "text-[#ff4444]"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()}P
                  </span>
                </div>
                <span className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#999]">
                  {new Date(transaction.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : showHistory ? (
        <div className="absolute left-[239.5px] top-[475px] -translate-x-1/2 -translate-y-1/2 text-center text-[13px] font-medium tracking-[0.26px] text-[#ddd]">
          <p className="leading-[normal]">내역이 없습니다.</p>
        </div>
      ) : (
        <div className="absolute left-[22px] right-[22px] top-[295px] rounded-[12px] bg-[#fafafa] px-[24px] py-[28px] text-left">
          <h2 className="font-['Pretendard:SemiBold',sans-serif] text-[18px] text-[#020202]">포인트 충전 안내</h2>
          <ul className="mt-[12px] space-y-[8px] font-['Pretendard:Regular',sans-serif] text-[14px] text-[#666]">
            <li>충전 버튼을 누르면 결제 페이지로 이동합니다.</li>
            <li>결제 완료 후 서버 검증이 끝나면 포인트가 자동 반영됩니다.</li>
            <li>보너스 포인트는 결제 금액별 정책에 따라 함께 지급됩니다.</li>
          </ul>
        </div>
      )}

      <BottomNav />
      <ChargeModal isOpen={isChargeOpen} onClose={() => setIsChargeOpen(false)} />
    </div>
  );
}
