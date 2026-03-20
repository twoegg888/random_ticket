import TicketDetailTemplate from "../components/TicketDetailTemplate";

const PLATINUM_DETAIL_IMAGE_URL = "https://dbase01.cafe24.com/Centbox/platinum_detail.png";

export default function PlatinumTicketDetail() {
  return <TicketDetailTemplate ticketName="플래티넘 박스" mainImage={PLATINUM_DETAIL_IMAGE_URL} ticketType="platinum" />;
}
