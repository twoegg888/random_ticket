import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgMeat from "figma:asset/110157f20f9d259cf10ef370b6aa3b30ec937e1f.png";

export default function MeatTicketDetail() {
  return <TicketDetailTemplate ticketName="미트 티켓" mainImage={imgMeat} ticketType="meat" />;
}
