import TicketDetailTemplate from "../components/TicketDetailTemplate";

const DIAMOND_DETAIL_IMAGE_URL = "https://dbase01.cafe24.com/Centbox/diamond_detail.png";

export default function DiamondTicketDetail() {
  return <TicketDetailTemplate ticketName="다이아 박스" mainImage={DIAMOND_DETAIL_IMAGE_URL} ticketType="diamond" />;
}
