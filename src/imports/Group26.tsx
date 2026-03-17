import svgPaths from "./svg-98n3k4j9hp";
import imgWatchSeries11 from "figma:asset/7918a0d9c3700905e84b27c5e9be4f901938ea73.png";
import img from "figma:asset/00a82f0525f69201435f22db39a2bdf6fd0009dc.png";
import imgAirPodsPro3 from "figma:asset/620b4d5ebd3e376c830e86dbd88bdc9d18269501.png";

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[28px]">럭키드로우</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12.188px] text-black text-center whitespace-nowrap">
        <p className="leading-[19.5px]">응모 내역</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[40px] items-center justify-center px-[14px] relative rounded-[33554400px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#eaeaea] border-solid inset-0 pointer-events-none rounded-[33554400px]" />
      <Container2 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-white content-stretch flex h-[56px] items-center justify-between left-0 pl-[24px] pr-[23.99px] py-[11px] right-0 top-0" data-name="Container">
      <Container1 />
      <Button />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[6px] items-start justify-center left-[24px] pt-[16px] right-[24px] top-[404px]" data-name="Container">
      <div className="bg-[#666] rounded-[33554400px] shrink-0 size-[8px]" data-name="Button - 배너 1" />
      <div className="bg-[#eaeaea] rounded-[33554400px] shrink-0 size-[8px]" data-name="Button - 배너 2" />
      <div className="bg-[#eaeaea] rounded-[33554400px] shrink-0 size-[8px]" data-name="Button - 배너 3" />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[11.25px] text-black whitespace-nowrap">
        <p className="leading-[15.6px]">미당첨시 100% 환급</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[31px] items-start justify-center left-[24px] pb-[8px] pt-[7px] px-[12px] right-[24px] rounded-[10px] top-[444px]" data-name="Background">
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[15.125px] text-center whitespace-nowrap">
        <p className="leading-[20.8px]">전체</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[15px] pt-[14px] px-[2px] relative shrink-0" data-name="Button">
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-black text-center whitespace-nowrap">
        <p className="leading-[20.8px]">진행중</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[15px] pt-[14px] px-[2px] relative shrink-0" data-name="Button">
      <Container6 />
      <div className="absolute bg-black bottom-px h-[2px] left-0 right-0" data-name="Horizontal Divider" />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[15.125px] text-center whitespace-nowrap">
        <p className="leading-[20.8px]">종료</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[15px] pt-[14px] px-[2px] relative shrink-0" data-name="Button">
      <Container7 />
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute bg-white h-[48.02px] left-[-24px] right-[-24px] top-0" data-name="Nav">
      <div className="content-stretch flex gap-[16px] items-center overflow-x-auto overflow-y-clip px-[24px] relative size-full">
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute h-[48px] left-[24px] right-[24px] top-[499px]" data-name="Margin">
      <Nav />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[13.344px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">Apple</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[10px] right-0 top-[155.25px]" data-name="Margin">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.234px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">Watch Series 11</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[2px] right-0 top-[183.46px]" data-name="Margin">
      <Container11 />
    </div>
  );
}

function WatchSeries() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Watch Series 11">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgWatchSeries11} />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-[1_0_0] h-[155.25px] items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Background">
      <WatchSeries />
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex items-center justify-center left-0 overflow-clip right-0 rounded-[14px] top-0" data-name="Background">
      <Background2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[203.66px] left-0 right-[225px] top-0" data-name="Container">
      <Margin1 />
      <Margin2 />
      <Background1 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[13.344px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">LOUIS VUITTON</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[10px] right-0 top-[155.25px]" data-name="Margin">
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.125px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">빅토린 월릿</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[2px] right-0 top-[183.46px]" data-name="Margin">
      <Container14 />
    </div>
  );
}

function Component() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="빅토린 월릿">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img} />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-[1_0_0] h-full items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Background">
      <Component />
    </div>
  );
}

function Background3() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[155.25px] items-center justify-center left-0 overflow-clip right-0 rounded-[14px] top-0" data-name="Background">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Background4 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[203.66px] left-[225px] right-0 top-0" data-name="Container">
      <Margin3 />
      <Margin4 />
      <Background3 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[13.344px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">APPLE</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[10px] right-0 top-[155.25px]" data-name="Margin">
      <Container16 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.234px] text-black w-full">
        <p className="leading-[18.2px] whitespace-pre-wrap">AirPods Pro 3</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pt-[2px] right-0 top-[183.45px]" data-name="Margin">
      <Container17 />
    </div>
  );
}

function AirPodsPro() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="AirPods Pro 3">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAirPodsPro3} />
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-[1_0_0] h-full items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Background">
      <AirPodsPro />
    </div>
  );
}

function Background5() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[155.25px] items-center justify-center left-0 overflow-clip right-0 rounded-[14px] top-0" data-name="Background">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Background6 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[203.66px] left-0 right-[225px] top-[221.66px]" data-name="Container">
      <Margin5 />
      <Margin6 />
      <Background5 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[425.31px] left-[24px] right-[24px] top-[571px]" data-name="Container">
      <Container9 />
      <Container12 />
      <Container15 />
    </div>
  );
}

function AirPodsPro1() {
  return (
    <div className="flex-[1_0_0] h-[324px] min-h-px min-w-px relative" data-name="AirPods Pro 3">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAirPodsPro3} />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[26.797px] text-black whitespace-nowrap">
        <p className="leading-[28px]">14 : 11 : 09</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container22 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container21 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-0 right-0 top-[2px]" data-name="Container">
      <Container20 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[22.875px] text-black text-center whitespace-nowrap">
        <p className="leading-[28.8px]">APPLE AirPods Pro 3</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 right-0" data-name="Container">
      <Container24 />
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 w-full" data-name="Button">
      <AirPodsPro1 />
      <Container19 />
      <Container23 />
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[82px_24px_667px_24px] items-start" data-name="Container">
      <Button4 />
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

function Margin7() {
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
      <Margin7 />
    </div>
  );
}

function Container25() {
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

function Margin8() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">당첨 티켓</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg1 />
      <Margin8 />
    </div>
  );
}

function Container26() {
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
          <path d={svgPaths.p11d16a80} fill="var(--fill-0, #DDDDDD)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p27aa6df0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p32251f80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Margin9() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">거래소</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg2 />
      <Margin9 />
    </div>
  );
}

function Container27() {
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

function Margin10() {
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
      <Margin10 />
    </div>
  );
}

function Container28() {
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
          <path d={svgPaths.p1b936200} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p32c2ee80} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Margin11() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[9.375px] text-black whitespace-nowrap">
        <p className="leading-[13px]">럭키드로우</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg4 />
      <Margin11 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link4 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-white content-stretch flex h-[64px] items-center justify-center left-0 right-0 top-[calc(50%+496.5px)]" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-solid border-t inset-0 pointer-events-none" />
      <Container25 />
      <Container26 />
      <Container27 />
      <Container28 />
      <Container29 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <Container />
      <div className="absolute bg-white h-[945px] left-0 top-[56px] w-[480px]" />
      <Container3 />
      <div className="absolute h-[16px] left-[24px] right-[24px] top-[428px]" data-name="Rectangle" />
      <Background />
      <Margin />
      <Container8 />
      <Container18 />
      <BackgroundHorizontalBorder />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group1 />
    </div>
  );
}

function Lucky() {
  return (
    <div className="absolute bg-white h-[1057px] left-0 overflow-clip top-0 w-[480px]" data-name="/Lucky">
      <Group2 />
    </div>
  );
}

export default function Group3() {
  return (
    <div className="relative size-full">
      <Lucky />
    </div>
  );
}