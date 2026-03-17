import svgPaths from "./svg-96pnf18jvy";

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] top-[14px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[28px]">거래소</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[920px] left-0 overflow-clip top-0 w-[480px]">
      <Container1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[920px] left-0 overflow-clip top-0 w-[480px]">
      <Frame1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-white h-[56px] left-0 right-0 top-0" data-name="Container">
      <Frame />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11a5580} fill="var(--fill-0, #DDDDDD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[10px] whitespace-nowrap">
        <p className="leading-[13px]">홈</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg />
      <Margin />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p25895e80} fill="var(--fill-0, #DDDDDD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ddd] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">당첨 티켓</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg1 />
      <Margin1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link1 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11d16a80} fill="var(--fill-0, #020202)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p27aa6df0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p32251f80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#020202] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">거래소</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg2 />
      <Margin2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link2 />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.pace200} fill="var(--fill-0, #DDDDDD)" id="Vector" />
          <path d={svgPaths.p3b299900} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">포인트 충전</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg3 />
      <Margin3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link3 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p1b936200} fill="var(--fill-0, #AEAEAE)" id="Vector" />
          <path d={svgPaths.p32c2ee80} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">럭키드로우</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg4 />
      <Margin4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link4 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-white content-stretch flex h-[64px] items-center justify-center left-0 right-0 top-[calc(50%+427.5px)]" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-solid border-t inset-0 pointer-events-none" />
      <Container2 />
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[101px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[109px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[130px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[212px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[220px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[241px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[323px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[331px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[352px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[434px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[442px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[463px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[545px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[553px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[574px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[656px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[664px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[685px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[134px] not-italic text-[#020202] text-[13px] text-center top-[767px] whitespace-nowrap">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[180px] top-[775px]">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[177.5px] top-[796px]">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}

export default function Group7() {
  return (
    <div className="relative size-full">
      <Container />
      <div className="absolute bg-white h-[863px] left-0 top-[56px] w-[480px]" />
      <div className="absolute h-[16px] left-[24px] right-[24px] top-[428px]" data-name="Rectangle" />
      <BackgroundHorizontalBorder />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[72px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[84px] w-[72px]" />
      <Group />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[183px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[195px] w-[72px]" />
      <Group1 />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[294px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[306px] w-[72px]" />
      <Group2 />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[405px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[417px] w-[72px]" />
      <Group3 />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[516px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[528px] w-[72px]" />
      <Group4 />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[627px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[639px] w-[72px]" />
      <Group5 />
      <div className="absolute bg-[#fafbfc] border border-[#eaeaea] border-solid h-[95px] left-[24px] rounded-[14px] top-[738px] w-[432px]" />
      <div className="absolute bg-[#d9d9d9] h-[71px] left-[41px] rounded-[9px] top-[750px] w-[72px]" />
      <Group6 />
    </div>
  );
}