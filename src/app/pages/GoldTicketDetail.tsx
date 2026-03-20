import TicketDetailTemplate from "../components/TicketDetailTemplate";

const GOLD_DETAIL_IMAGE_URL = "https://dbase01.cafe24.com/Centbox/gold_detail.png";

export default function GoldTicketDetail() {
  return <TicketDetailTemplate ticketName="골드 박스" mainImage={GOLD_DETAIL_IMAGE_URL} ticketType="gold" />;
}
