import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

interface ShippingRequestModalProps {
  ticketId: string;
  onClose: () => void;
}

export default function ShippingRequestModal({ ticketId, onClose }: ShippingRequestModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestShipping } = useApp();
  const navigate = useNavigate();

  const handleShippingRequest = async () => {
    if (!recipientName || !recipientPhone || !zipCode || !address || !detailAddress) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-]{10,13}$/;
    if (!phoneRegex.test(recipientPhone)) {
      alert('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678 또는 01012345678)');
      return;
    }

    // 우편번호 형식 검증
    if (zipCode.length !== 5 || isNaN(Number(zipCode))) {
      alert('올바른 우편번호를 입력해주세요. (5자리 숫자)');
      return;
    }

    setIsSubmitting(true);

    const shippingInfo = {
      name: recipientName,
      phone: recipientPhone,
      zipCode,
      address,
      detailAddress,
      memo: memo || '',
    };

    const success = await requestShipping(ticketId, shippingInfo);

    if (success) {
      alert('배송 요청이 완료되었습니다!\n관리자 확인 후 배송이 진행됩니다.\n배송 정보는 카카오톡으로 전달됩니다.');
      onClose();
      navigate('/winning-tickets');
    } else {
      alert('배송 요청에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-[90%] max-w-[400px] max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-[20px] border-b border-[#eaeaea] sticky top-0 bg-white">
          <h3 className="font-['Pretendard:Bold',sans-serif] text-[18px] text-black">배송 정보 입력</h3>
          <button onClick={onClose} className="text-[24px] text-[#666] bg-transparent border-0 cursor-pointer">×</button>
        </div>

        <div className="p-[20px]">
          <p className="font-['Pretendard:Regular',sans-serif] text-[14px] text-[#666] mb-[20px]">
            당첨 상품을 받으실 배송 정보를 입력해주세요.<br />
            <span className="text-[#ff6b6b]">*</span> 표시는 필수 입력 항목입니다.
          </p>

          {/* 받는 사람 */}
          <div className="mb-[12px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              받는 사람 <span className="text-[#ff6b6b]">*</span>
            </label>
            <input 
              type="text" 
              placeholder="이름을 입력하세요"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-black"
            />
          </div>

          {/* 연락처 */}
          <div className="mb-[12px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              연락처 <span className="text-[#ff6b6b]">*</span>
            </label>
            <input 
              type="tel" 
              placeholder="010-1234-5678"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-black"
            />
          </div>

          {/* 우편번호 */}
          <div className="mb-[12px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              우편번호 <span className="text-[#ff6b6b]">*</span>
            </label>
            <input 
              type="text" 
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-black"
            />
          </div>

          {/* 주소 */}
          <div className="mb-[12px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              주소 <span className="text-[#ff6b6b]">*</span>
            </label>
            <input 
              type="text" 
              placeholder="서울특별시 강남구 테헤란로 123"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-black"
            />
          </div>

          {/* 상세주소 */}
          <div className="mb-[12px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              상세주소 <span className="text-[#ff6b6b]">*</span>
            </label>
            <input 
              type="text" 
              placeholder="상세주소를 입력하세요 (예: 101동 501호)"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[48px] px-[16px] font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-black"
            />
          </div>

          {/* 배송 메모 */}
          <div className="mb-[20px]">
            <label className="block mb-[6px] font-['Pretendard:Medium',sans-serif] text-[13px] text-black">
              배송 메모 (선택)
            </label>
            <textarea 
              placeholder="배송 시 요청사항을 입력하세요 (예: 부재 시 문앞에 놓아주세요)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-[8px] h-[80px] px-[16px] py-[12px] font-['Pretendard:Regular',sans-serif] text-[14px] resize-none focus:outline-none focus:border-black"
            />
          </div>

          {/* 안내 문구 */}
          <div className="bg-gray-50 rounded-[8px] p-[12px] mb-[20px]">
            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#666] leading-[1.6]">
              • 배송 정보는 신중히 입력해주세요.<br />
              • 잘못된 정보로 인한 배송 오류는 책임지지 않습니다.<br />
              • 배송은 영업일 기준 3-7일 소요됩니다.<br />
              • 배송 진행 상황은 카카오톡으로 안내됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button 
            onClick={handleShippingRequest}
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-[8px] h-[52px] font-['Pretendard:Bold',sans-serif] text-[16px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isSubmitting ? '처리 중...' : '배송 요청하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
