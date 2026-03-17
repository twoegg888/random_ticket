import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgGold from "figma:asset/fa1f6a548a94aeafe98cb1c1b77f91a89f5ff7ca.png";

export default function GoldTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="골드 티켓"
      ticketPrice="14,900P"
      mainImage={imgGold}
      drawAnimationImage={imgGold}
      gradientFrom="#854d0e"
      gradientVia="#ca8a04"
      gradientTo="#fbbf24"
    />
  );
}