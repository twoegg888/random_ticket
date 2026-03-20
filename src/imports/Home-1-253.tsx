import { Link as RouterLink } from "react-router";
import { useState, useEffect } from "react";
import svgPaths from "./svg-njoq4gzm16";
import imgBanner1 from "figma:asset/805896226fd2f028ef2a11adc5383356de68c2b1.png";
import { apiBase, publicAnonKey } from '../../utils/supabase/info';

const BRAND_LOGO_URL = "https://dbase01.cafe24.com/box_logo.png";
const PLATINUM_BOX_IMAGE_URL = "https://dbase01.cafe24.com/centbox/pla%20box.png";
const DIAMOND_BOX_IMAGE_URL = "https://dbase01.cafe24.com/centbox/dia%20box.png";
const GOLD_BOX_IMAGE_URL = "https://dbase01.cafe24.com/centbox/gold%20box.png";
const RUBY_BOX_IMAGE_URL = "https://dbase01.cafe24.com/centbox/rubybox.png";

// 🔥 관리자가 선택한 메인 상품을 보여주는 ProductShowcase
function ProductShowcase() {
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    brand: string;
    points: number;
    imageUrl: string;
    ticketType: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        // 관리자가 선택한 홈 메인 상품 가져오기
        const response = await fetch(
          `${apiBase}/home-products`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch home products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  if (loading) {
    return (
      <div className="absolute left-[25px] top-[470px] w-[434px] h-[250px] flex items-center justify-center">
        <p className="text-[#999] text-[14px]">상품을 불러오는 중...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="absolute left-[25px] top-[470px] w-[434px] h-[250px] flex items-center justify-center">
        <p className="text-[#999] text-[14px]">등록된 상품이 없습니다</p>
      </div>
    );
  }

  // 티켓 타입에 따른 페이지 경로 매핑
  const getTicketPath = (ticketType: string) => {
    const pathMap: { [key: string]: string } = {
      'diamond': '/tickets/diamond',
      'gold': '/tickets/gold',
      'platinum': '/tickets/platinum',
      'ruby': '/tickets/ruby',
    };
    return pathMap[ticketType] || '/';
  };

  return (
    <div className="absolute left-[25px] top-[470px] w-[434px] h-[250px] overflow-x-auto overflow-y-visible scrollbar-hide">
      <div className="flex gap-[18px] pb-4">
        {products.map((product) => (
          <RouterLink 
            key={product.id} 
            to={getTicketPath(product.ticketType)}
            className="flex-shrink-0 relative h-[240px] cursor-pointer"
          >
            {/* 상품 이미지 */}
            <div className="bg-[#f5f5f5] h-[165px] rounded-[16px] w-[164px] overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/164x165?text=No+Image';
                }}
              />
            </div>
            {/* 상품명 */}
            <div className="absolute top-[190.5px] left-0 w-[164px]">
              <p className="font-['Pretendard:Regular',sans-serif] text-[#020202] text-[14px] tracking-[-0.14px] leading-[normal] truncate">
                {product.name}
              </p>
            </div>
            {/* 가격 */}
            <div className="absolute top-[212.5px] left-0 w-[164px]">
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[#020202] text-[14px] tracking-[-0.14px] leading-[normal]">
                {product.points.toLocaleString()}P
              </p>
            </div>
          </RouterLink>
        ))}
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[362px] top-[470px]">
      <div className="absolute bg-[#d9d9d9] h-[165px] left-[362px] rounded-[16px] top-[470px] w-[164px]" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[2px] top-[470px]">
      <Group4 />
      <div className="absolute bg-[#d9d9d9] h-[165px] left-[2px] rounded-[16px] top-[470px] w-[164px]" />
      <div className="absolute bg-[#d9d9d9] h-[165px] left-[182px] rounded-[16px] top-[470px] w-[164px]" />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11a5580} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black whitespace-nowrap">
        <p className="leading-[13px]">홈</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <RouterLink to="/" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg />
      <Margin />
    </RouterLink>
  );
}

function Container() {
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
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#aeaeae] text-[9.375px] whitespace-nowrap">
        <p className="leading-[13px]">당첨 박스</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <RouterLink to="/winning-tickets" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg1 />
      <Margin1 />
    </RouterLink>
  );
}

function Container1() {
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

function Margin2() {
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
    <RouterLink to="/exchange" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg2 />
      <Margin2 />
    </RouterLink>
  );
}

function Container2() {
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
          <path d={svgPaths.p38413f00} fill="var(--fill-0, white)" id="Vector_2" />
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
    <RouterLink to="/points" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg3 />
      <Margin3 />
    </RouterLink>
  );
}

function Container3() {
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
    <RouterLink to="/lucky-draw" className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Link">
      <Svg4 />
      <Margin4 />
    </RouterLink>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Link4 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-white content-stretch flex h-[64px] items-center justify-center left-0 right-0 top-[calc(50%+890px)]" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-solid border-t inset-0 pointer-events-none" />
      <Container />
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute left-1/2 top-[1775px] h-[28px] w-[116px] -translate-x-1/2">
      <img alt="Centbox" className="h-full w-full object-contain" src={BRAND_LOGO_URL} />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[227px] top-[1789px]">
      <Group1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[142px] top-[1686px]">
      <div className="absolute left-[200px] top-[1685px] flex h-[32px] w-[132px] items-center justify-center" data-name="image 4">
        <img alt="Centbox" className="h-full w-full object-contain" src={BRAND_LOGO_URL} />
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[142px] not-italic text-[#020202] text-[12px] top-[1760px] tracking-[0.12px] whitespace-nowrap">
        <p className="leading-[normal]">이용약관</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[144px] not-italic text-[#020202] text-[12px] top-[1777px] tracking-[0.12px] whitespace-nowrap">
        <p className="leading-[normal]">고객센터</p>
      </div>
      <a className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[188px] not-italic text-[#020202] text-[12px] top-[1777px] whitespace-nowrap" href="mailto:randomticketcs@gmail.com">
        <p className="cursor-pointer leading-[normal]">randomticketcs@gmail.com</p>
      </a>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[168px] not-italic text-[#020202] text-[12px] top-[1795px] whitespace-nowrap">
        <p className="leading-[normal]">{`사업자 정보 `}</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[199px] not-italic text-[#020202] text-[12px] top-[1760px] whitespace-nowrap">
        <p className="leading-[normal]">개인정보처리방침</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[297px] not-italic text-[#020202] text-[12px] top-[1760px] whitespace-nowrap">
        <p className="leading-[normal]">공지사항</p>
      </div>
      <Group />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white relative w-[480px] min-h-[1880px]" data-name="/HOME">
      <div className="absolute bg-white min-h-[1880px] left-0 top-0 w-[480px]" />
      <RouterLink to="/my-page" className="absolute inset-[0.86%_4.72%_98.26%_91.25%] cursor-pointer" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.3333 19.3333">
          <path d={svgPaths.pf0ef200} fill="var(--fill-0, #DDDDDD)" id="Vector" />
        </svg>
      </RouterLink>
      <div className="absolute left-[23px] top-[12px] flex h-[32px] w-[132px] items-center" data-name="brand-logo">
        <img alt="Centbox" className="h-full w-full object-contain object-left" src={BRAND_LOGO_URL} />
      </div>
      <ProductShowcase />
      <RouterLink to="/ticket/gold" className="absolute h-[139px] left-[25px] top-[1155px] w-[434px] cursor-pointer z-10" data-name="456">
        <img alt="골드 박스" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={GOLD_BOX_IMAGE_URL} />
      </RouterLink>
      <RouterLink to="/ticket/diamond" className="absolute h-[139px] left-[25px] top-[1003px] w-[434px] cursor-pointer z-10" data-name="458">
        <img alt="다이아 박스" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={DIAMOND_BOX_IMAGE_URL} />
      </RouterLink>
      <div className="absolute h-[139px] left-[25px] top-[851px] w-[434px]" data-name="459">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={PLATINUM_BOX_IMAGE_URL} />
      </div>
      <RouterLink to="/ticket/platinum" className="absolute h-[139px] left-[25px] top-[851px] w-[434px] cursor-pointer z-10" data-name="467">
        <img alt="플래티넘 박스" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={PLATINUM_BOX_IMAGE_URL} />
      </RouterLink>
      <div className="absolute h-[139px] left-[25px] top-[1003px] w-[434px]" data-name="466">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={DIAMOND_BOX_IMAGE_URL} />
      </div>
      <RouterLink to="/ticket/ruby" className="absolute h-[139px] left-[25px] top-[1307px] w-[434px] cursor-pointer z-10" data-name="468">
        <img alt="루비 박스" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={RUBY_BOX_IMAGE_URL} />
      </RouterLink>
      <div className="absolute h-[139px] left-[25px] top-[1155px] w-[434px]" data-name="464">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={GOLD_BOX_IMAGE_URL} />
      </div>
      <div className="absolute h-[139px] left-[25px] top-[1307px] w-[434px]" data-name="457">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={RUBY_BOX_IMAGE_URL} />
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[23px] top-[813.5px] tracking-[1.38px] whitespace-nowrap">
        <p className="leading-[normal]">
          <span>도전해</span>
          <span>{` `}</span>
          <span>보세요!</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[26px] not-italic text-[#020202] text-[23px] top-[784.5px] tracking-[0.46px] whitespace-nowrap">
        <p className="leading-[normal]">박스 오픈에</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[14px] top-[904.5px] whitespace-nowrap z-20">
        <p className="leading-[normal]">플래티넘 박스</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[20px] top-[933px] whitespace-nowrap z-20">
        <p className="leading-[normal]">99,000P</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[14px] top-[1056.5px] whitespace-nowrap z-20">
        <p className="leading-[normal]">다이아 박스</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[20px] top-[1085px] whitespace-nowrap z-20">
        <p className="leading-[normal]">49,000P</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[14px] top-[1208.5px] whitespace-nowrap z-20">
        <p className="leading-[normal]">골드 박스</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[20px] top-[1237px] whitespace-nowrap z-20">
        <p className="leading-[normal]">14,900P</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[14px] top-[1360.5px] whitespace-nowrap z-20">
        <p className="leading-[normal]">루비 박스</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] left-[59px] not-italic text-[#020202] text-[20px] top-[1389px] whitespace-nowrap z-20">
        <p className="leading-[normal]">9,900P</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[23px] top-[432.5px] tracking-[0.46px] whitespace-nowrap">
        <p className="leading-[normal]">상품이 나왔을까요?</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[26px] not-italic text-[#020202] text-[23px] top-[403.5px] tracking-[0.46px] whitespace-nowrap">
        <p className="leading-[normal]">박스에서 어떤</p>
      </div>
      <div className="absolute h-[289px] left-[24px] rounded-[12px] top-[57px] w-[433px]" data-name="banner 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgBanner1} />
      </div>
      <BackgroundHorizontalBorder />
    </div>
  );
}
