import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgBeauty from "figma:asset/203c864af61feab09e3ab1afba0475fee98d811d.png";

export default function BeautyTicketDetail() {
  return <TicketDetailTemplate ticketName="뷰티 티켓" mainImage={imgBeauty} ticketType="beauty" />;
}
