import imgWhiskMwolfwylfgoyugox0Snkftotgtzxqtlljwom1Iz1 from "figma:asset/d93971fce89fc80719f7ab3b853148ed8cbca631.png";

interface Group45Props {
  onClose?: () => void;
  productName?: string;
  productPrice?: string;
  productImage?: string;
}

interface GroupProps {
  productName?: string;
  productPrice?: string;
  productImage?: string;
}

function Group({ productName = "당첨 상품", productPrice = "100P", productImage }: GroupProps) {
  return (
    <div className="relative w-[239px] h-[338px]">
      <div className="absolute bg-white h-[338px] left-0 rounded-[21px] top-0 w-[239px]" />
      <div className="absolute h-[203px] left-0 top-[35px] w-[239px] overflow-hidden rounded-t-[21px]">
        {productImage ? (
          <img 
            src={productImage} 
            alt={productName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#d9d9d9]" />
        )}
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[15px] top-[274px] tracking-[0.45px] whitespace-nowrap">
        <p className="leading-[normal]">{productName}</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[15px] top-[300px] tracking-[0.45px] whitespace-nowrap">
        <p className="leading-[normal]">{productPrice}</p>
      </div>
    </div>
  );
}

export default function Group1({ onClose, productName, productPrice, productImage }: Group45Props = {}) {
  return (
    <div className="relative w-full h-screen max-w-[480px] mx-auto">
      {/* 배경 */}
      <div className="absolute bg-[#1e0200] w-full h-full left-0 top-0" />
      
      {/* 이미지 소스 영역 - 화면 전체 기준으로 상단 여백만 주고 나머지는 채움 */}
      <div className="absolute w-full left-0 top-[178px] bottom-0">
        <img 
          alt="" 
          className="w-full h-full object-cover pointer-events-none" 
          src={imgWhiskMwolfwylfgoyugox0Snkftotgtzxqtlljwom1Iz1} 
        />
      </div>
      
      {/* 텍스트 - Figma 디자인 위치 그대로 */}
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[124px] not-italic text-[30px] text-white top-[160px] tracking-[0.9px] whitespace-nowrap z-10">
        <p className="leading-[normal]">당첨을 축하합니다!</p>
      </div>
      
      {/* 상품 카드 - 전체 페이지 기준 가로/세로 완전 중앙 정렬 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <Group productName={productName} productPrice={productPrice} productImage={productImage} />
      </div>
      
      {/* 확인 버튼 */}
      <button 
        onClick={onClose}
        className="absolute bottom-[40px] left-[32px] right-[32px] h-[52px] bg-[#171717] rounded-[8px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white z-20 active:bg-[#2a2a2a] transition-colors"
      >
        확인
      </button>
    </div>
  );
}