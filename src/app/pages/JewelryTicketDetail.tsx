import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgJewelry from "figma:asset/a9dbf0d55cefb05c4def32b65330fee4df00d4e6.png";

export default function JewelryTicketDetail() {
  return <TicketDetailTemplate ticketName="주얼리 티켓" mainImage={imgJewelry} ticketType="jewelry" />;
}
