import TicketDetailTemplate from "../components/TicketDetailTemplate";
import imgPlatinum from "figma:asset/915fa6551696b9d851e927eea54af0715e8833ce.png";

export default function PlatinumTicketDetail() {
  return <TicketDetailTemplate ticketName="플래티넘 박스" mainImage={imgPlatinum} ticketType="platinum" />;
}
