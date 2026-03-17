import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgPlatinum from "figma:asset/915fa6551696b9d851e927eea54af0715e8833ce.png";
import imgDrawAnimation from "figma:asset/915fa6551696b9d851e927eea54af0715e8833ce.png";

export default function PlatinumTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="플래티넘 티켓"
      ticketPrice="99,900P"
      mainImage={imgPlatinum}
      drawAnimationImage={imgDrawAnimation}
      gradientFrom="#1a1a2d"
      gradientVia="#2d2d4d"
      gradientTo="#4d4d8b"
    />
  );
}