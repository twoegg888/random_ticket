import Home1253 from "../../imports/Home-1-253";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const CUSTOMER_SUPPORT_EMAIL = "randomticketcs@gmail.com";

const TERMS_SECTIONS = [
  {
    title: "1. 서비스 소개",
    body:
      "센트박스는 회원이 포인트를 충전하고 랜덤 티켓형 상품 서비스를 이용할 수 있도록 제공하는 모바일 기반 서비스입니다. 회사는 운영 정책에 따라 상품 구성, 응모 방식, 제공 절차를 조정할 수 있습니다.",
  },
  {
    title: "2. 회원 이용",
    body:
      "회원은 회사가 제공하는 로그인 수단을 통해 서비스를 이용합니다. 회원은 본인 정보를 정확하게 유지해야 하며, 계정 및 접근 수단 관리 책임은 회원에게 있습니다.",
  },
  {
    title: "3. 포인트 및 티켓 구매",
    body:
      "회원은 회사가 정한 방식으로 포인트를 충전하고 이를 사용해 티켓을 구매할 수 있습니다. 티켓 구매 결과는 서버 기준으로 확정되며, 구매 완료 후에는 관계 법령 또는 별도 정책상 허용되는 경우를 제외하고 취소나 환불이 제한될 수 있습니다.",
  },
  {
    title: "4. 당첨 상품 처리",
    body:
      "실물 상품 당첨 시 회원은 보관함에서 배송 신청 등 회사가 제공하는 절차를 진행할 수 있습니다. 주소 오기재, 연락 불가 등 회원 책임 사유로 인한 손해는 회사가 책임지지 않습니다.",
  },
  {
    title: "5. 금지행위",
    body:
      "비정상 접근, 자동화 도구 사용, 결과 조작 시도, 타인 정보 도용, 서비스 운영 방해 행위는 금지됩니다. 회사는 위반 행위에 대해 이용 제한, 당첨 취소, 계정 정지 조치를 할 수 있습니다.",
  },
  {
    title: "6. 책임 제한",
    body:
      "회사는 천재지변, 외부 결제사 장애, 플랫폼 또는 통신 장애 등 회사가 합리적으로 통제하기 어려운 사유로 발생한 손해에 대해 책임이 제한될 수 있습니다.",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. 수집 항목",
    body:
      "센트박스는 로그인 식별 정보, 닉네임, 프로필 이미지, 이메일, 서비스 이용 기록, 포인트 및 결제 처리 정보, 배송 신청 시 입력한 수령 정보를 수집할 수 있습니다.",
  },
  {
    title: "2. 이용 목적",
    body:
      "수집한 개인정보는 회원 식별, 로그인 유지, 티켓 구매 처리, 포인트 충전 확인, 당첨 상품 배송, 고객 문의 응대, 부정 이용 방지 및 서비스 품질 개선을 위해 사용됩니다.",
  },
  {
    title: "3. 보관 기간",
    body:
      "회사는 서비스 제공 기간 동안 개인정보를 보관하며, 관계 법령에 따라 필요한 경우 해당 법정 보관기간 동안 별도로 보관합니다. 보관 목적이 종료되면 지체 없이 파기합니다.",
  },
  {
    title: "4. 제3자 제공 및 위탁",
    body:
      "회사는 결제, 인증, 배송, 인프라 운영 등 서비스 제공에 필요한 범위에서 외부 서비스와 정보를 연동하거나 처리 위탁할 수 있습니다. 회사는 법령상 근거 또는 필요한 동의 없이 불필요한 제공을 하지 않습니다.",
  },
  {
    title: "5. 이용자 권리",
    body:
      "회원은 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 다만 관련 법령 또는 정산 절차상 보관이 필요한 정보는 즉시 삭제가 제한될 수 있습니다.",
  },
  {
    title: "6. 보호 조치",
    body:
      "회사는 접근 권한 통제, 인증 정보 보호, 운영 권한 분리 등 합리적인 보안 조치를 적용합니다. 다만 인터넷 환경의 특성상 절대적인 보안을 보장할 수는 없습니다.",
  },
];

function PolicyDialog({
  title,
  description,
  sections,
  triggerLabel,
}: {
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
  triggerLabel: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer" type="button">
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px] rounded-[20px] px-5 py-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-left text-[13px] leading-6 text-[#404040]">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-1 text-[14px] font-semibold text-[#111111]">{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HomeFooterOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[108px] flex justify-center">
      <div className="pointer-events-auto relative w-full max-w-[480px]">
        <div className="absolute inset-x-[20px] bottom-0 rounded-[28px] bg-white px-6 pb-6 pt-5 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-center gap-4 text-[12px] font-semibold text-[#111111]">
            <PolicyDialog
              title="센트박스 이용약관"
              description="센트박스 서비스 이용에 관한 기본 정책입니다."
              sections={TERMS_SECTIONS}
              triggerLabel="이용약관"
            />
            <PolicyDialog
              title="센트박스 개인정보처리방침"
              description="센트박스 서비스 운영을 위한 개인정보 처리 기준입니다."
              sections={PRIVACY_SECTIONS}
              triggerLabel="개인정보처리방침"
            />
            <button className="cursor-default" type="button">
              공지사항
            </button>
          </div>

          <div className="space-y-1 text-center text-[12px] leading-5 text-[#4b4b4b]">
            <p>
              고객센터{" "}
              <a className="underline underline-offset-2" href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}>
                {CUSTOMER_SUPPORT_EMAIL}
              </a>
            </p>
            <p>사업자명 센트박스</p>
            <p>서비스명 센트박스 랜덤티켓</p>
            <p>포인트 기반 랜덤 티켓 구매 및 당첨 상품 보관/배송 서비스를 제공합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative mx-auto w-full max-w-[480px] bg-white">
      <Home1253 />
      <HomeFooterOverlay />
    </div>
  );
}
