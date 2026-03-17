import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgBeauty from "figma:asset/203c864af61feab09e3ab1afba0475fee98d811d.png";
import imgDrawAnimation from "figma:asset/203c864af61feab09e3ab1afba0475fee98d811d.png";

export default function BeautyTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="뷰티 티켓"
      ticketPrice="39,900P"
      mainImage={imgBeauty}
      drawAnimationImage={imgDrawAnimation}
      gradientFrom="#2d0a1a"
      gradientVia="#4d1a3a"
      gradientTo="#8b2d5a"
    />
  );
}