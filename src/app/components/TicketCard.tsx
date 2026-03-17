import { Link } from 'react-router';
import { WinningTicket, TICKET_GRADES } from '../types';

interface TicketCardProps {
  ticket: WinningTicket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const gradeInfo = TICKET_GRADES[ticket.ticketType];
  
  return (
    <Link 
      to={`/winning-ticket/${ticket.id}`}
      className="block bg-white border border-[#eaeaea] rounded-[12px] p-[16px] hover:shadow-md transition-shadow"
    >
      <div className="flex gap-[16px]">
        {/* 상품 이미지 */}
        <div className="w-[80px] h-[80px] rounded-[8px] bg-[#f5f5f5] overflow-hidden flex-shrink-0">
          <img 
            src={ticket.productImage} 
            alt={ticket.productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-[8px]">
            <div>
              <span 
                className="inline-block px-[8px] py-[2px] rounded-full text-[11px] font-['Pretendard:Medium',sans-serif] mb-[6px]"
                style={{ 
                  backgroundColor: `${gradeInfo.color}20`, 
                  color: gradeInfo.color 
                }}
              >
                {gradeInfo.name}
              </span>
              <h3 className="font-['Pretendard:SemiBold',sans-serif] text-[15px] text-[#020202] line-clamp-1">
                {ticket.productBrand}
              </h3>
              <p className="font-['Pretendard:Regular',sans-serif] text-[13px] text-[#666] line-clamp-1">
                {ticket.productName}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-[8px]">
            <span className="font-['Pretendard:Bold',sans-serif] text-[18px] text-[#020202]">
              {ticket.points.toLocaleString()}P
            </span>
            <span className="font-['Pretendard:Regular',sans-serif] text-[11px] text-[#999]">
              {new Date(ticket.wonAt).toLocaleDateString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\. /g, '. ')}
            </span>
          </div>
        </div>
      </div>

      {ticket.status !== 'active' && (
        <div className="mt-[12px] pt-[12px] border-t border-[#eaeaea]">
          <span className="text-[12px] font-['Pretendard:Medium',sans-serif] text-[#999]">
            {ticket.status === 'converted' && '포인트로 전환됨'}
            {ticket.status === 'exchanged' && '거래소에 등록됨'}
            {ticket.status === 'shipped' && '배송 중'}
            {ticket.status === 'delivered' && '배송 완료'}
          </span>
        </div>
      )}
    </Link>
  );
}
