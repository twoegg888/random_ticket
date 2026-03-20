import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgRuby from "figma:asset/02a9a581d7e7cf5847a4d891be812058ce8409af.png";

export default function RubyTicketDetail() {
  return <TicketDetailTemplate ticketName="루비 박스" mainImage={imgRuby} ticketType="ruby" />;
}
