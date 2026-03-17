import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgJewelry from "figma:asset/110157f20f9d259cf10ef370b6aa3b30ec937e1f.png";
import imgDrawAnimation from "figma:asset/110157f20f9d259cf10ef370b6aa3b30ec937e1f.png";

export default function JewelryTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="주얼리 티켓"
      ticketPrice="19,900P"
      mainImage={imgJewelry}
      drawAnimationImage={imgDrawAnimation}
      gradientFrom="#0a1a1a"
      gradientVia="#0a2d2d"
      gradientTo="#1a7b7b"
    />
  );
}