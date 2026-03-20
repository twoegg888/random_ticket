import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import TicketDetailTemplate from "../components/TicketDetailTemplate";
import { TicketType } from "../types";
import imgRuby from "figma:asset/02a9a581d7e7cf5847a4d891be812058ce8409af.png";
import imgGold from "figma:asset/fa1f6a548a94aeafe98cb1c1b77f91a89f5ff7ca.png";
import imgDiamond from "figma:asset/b7ac3182447c82f15ab3c7bf8b1397aedd985e1c.png";
import imgPlatinum from "figma:asset/915fa6551696b9d851e927eea54af0715e8833ce.png";
import imgBeauty from "figma:asset/203c864af61feab09e3ab1afba0475fee98d811d.png";
import imgMeat from "figma:asset/110157f20f9d259cf10ef370b6aa3b30ec937e1f.png";
import imgJewelry from "figma:asset/a9dbf0d55cefb05c4def32b65330fee4df00d4e6.png";
import { useApp } from "../context/AppContext";

const ticketMeta: Record<TicketType, { ticketName: string; mainImage: string }> = {
  ruby: { ticketName: "루비 박스", mainImage: imgRuby },
  gold: { ticketName: "골드 박스", mainImage: imgGold },
  diamond: { ticketName: "다이아 박스", mainImage: imgDiamond },
  platinum: { ticketName: "플래티넘 박스", mainImage: imgPlatinum },
  beauty: { ticketName: "뷰티 티켓", mainImage: imgBeauty },
  meat: { ticketName: "미트 티켓", mainImage: imgMeat },
  jewelry: { ticketName: "주얼리 티켓", mainImage: imgJewelry },
};

export default function TicketDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const { ticketType } = useParams<{ ticketType: TicketType }>();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } });
    }
  }, [isLoggedIn, navigate, location]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticketType || !(ticketType in ticketMeta)) {
    return (
      <div className="bg-white relative w-[480px] mx-auto min-h-screen flex items-center justify-center">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[16px] text-black">티켓을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <TicketDetailTemplate
      ticketName={ticketMeta[ticketType].ticketName}
      mainImage={ticketMeta[ticketType].mainImage}
      ticketType={ticketType}
    />
  );
}
