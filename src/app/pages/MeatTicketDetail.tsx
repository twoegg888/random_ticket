import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgMeat from "figma:asset/382d3ba3fc8c328f3858ac2cbee8df1a7bead709.png";
import imgDrawAnimation from "figma:asset/382d3ba3fc8c328f3858ac2cbee8df1a7bead709.png";

export default function MeatTicketDetail() {
  return (
    <TicketDetailTemplate
      ticketName="미트 티켓"
      ticketPrice="29,900P"
      mainImage={imgMeat}
      drawAnimationImage={imgDrawAnimation}
      gradientFrom="#2d0a0a"
      gradientVia="#4d1a1a"
      gradientTo="#8b2d2d"
    />
  );
}