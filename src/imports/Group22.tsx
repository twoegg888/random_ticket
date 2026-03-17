import svgPaths from "./svg-oofdos0zh0";
import imgKakao from "figma:asset/152a75c45e952c474894abadfecac91956cd1209.png";
import imgNaver from "figma:asset/e40d8ef429bc3b8aeece6edec09e51af6b4c17ab.png";

function Paragraph() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start not-italic pb-[0.8px] relative shrink-0 w-full whitespace-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold justify-center leading-[28px] relative shrink-0 text-[26.25px] text-black">
        <p className="mb-0">안녕하세요,</p>
        <p>랜덤티켓입니다</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#666] text-[14.875px]">
        <p className="leading-[20.8px]">로그인하고 다양한 혜택을 만나보세요!</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 px-[28px] right-0 top-[136px]" data-name="Margin">
      <Paragraph />
    </div>
  );
}

function Kakao() {
  return (
    <div className="max-w-[432px] relative shrink-0 size-[24px]" data-name="kakao">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgKakao} />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-black text-center whitespace-nowrap">
        <p className="leading-[20.8px]">카카오 로그인</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#f9df4a] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[20px] pr-[20.02px] py-[16px] relative w-full">
          <Kakao />
          <Container1 />
          <div className="shrink-0 size-[24px]" data-name="Rectangle" />
        </div>
      </div>
    </div>
  );
}

function Naver() {
  return (
    <div className="max-w-[432px] relative shrink-0 size-[24px]" data-name="naver">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgNaver} />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-center text-white whitespace-nowrap">
        <p className="leading-[20.8px]">네이버 로그인</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#51af35] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[20px] pr-[20.02px] py-[16px] relative w-full">
          <Naver />
          <Container2 />
          <div className="shrink-0 size-[24px]" data-name="Rectangle" />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bottom-[283px] content-stretch flex flex-col gap-[16px] items-center justify-center left-0 p-[24px] right-0" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function LogoBqW1YgXSvg() {
  return (
    <div className="h-[27.857px] relative shrink-0 w-[30px]" data-name="logo-BQ_W1ygX.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 27.8571">
        <g clipPath="url(#clip0_22_156)" id="logo-BQ_W1ygX.svg">
          <path clipRule="evenodd" d={svgPaths.p1ff28800} fill="var(--fill-0, #FE6555)" fillRule="evenodd" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_22_156">
            <rect fill="white" height="27.8571" width="30" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function LogoBqW1YgXSvgFill() {
  return (
    <div className="content-stretch flex flex-col h-[27.84px] items-center justify-center overflow-clip relative shrink-0 w-[30px]" data-name="logo-BQ_W1ygX.svg fill">
      <LogoBqW1YgXSvg />
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[480px] overflow-clip relative shrink-0 w-[30px]" data-name="logo">
      <LogoBqW1YgXSvgFill />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-white content-stretch flex h-[56px] items-center left-0 max-w-[480px] px-[20px] right-0 top-0" data-name="Background">
      <Logo />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 right-0 top-0">
      <div className="absolute h-[80px] left-0 right-0 top-[56px]" data-name="Rectangle" />
      <Margin />
      <Container />
      <Background />
    </div>
  );
}

function Desktop() {
  return (
    <div className="absolute bg-white h-[919px] left-0 right-0 top-0" data-name="desktop - 1920">
      <Group />
    </div>
  );
}

export default function Group1() {
  return (
    <div className="relative size-full">
      <Desktop />
    </div>
  );
}