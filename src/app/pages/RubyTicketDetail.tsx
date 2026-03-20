import TicketDetailTemplate from "../components/TicketDetailTemplate";

const RUBY_DETAIL_IMAGE_URL = "https://dbase01.cafe24.com/Centbox/ruby_detail.png";

export default function RubyTicketDetail() {
  return <TicketDetailTemplate ticketName="루비 박스" mainImage={RUBY_DETAIL_IMAGE_URL} ticketType="ruby" />;
}
