import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgDiamond from "figma:asset/b7ac3182447c82f15ab3c7bf8b1397aedd985e1c.png";

export default function DiamondTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="다이아 박스"
      ticketPrice="49,000P"
      mainImage={imgDiamond}
      drawAnimationImage={imgDiamond}
      gradientFrom="#1e3a8a"
      gradientVia="#3b82f6"
      gradientTo="#60a5fa"
    />
  );
}
