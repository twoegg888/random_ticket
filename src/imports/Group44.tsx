interface Group44Props {
  onVideoEnd?: () => void;
}

export default function Group({ onVideoEnd }: Group44Props = {}) {
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration - video.currentTime <= 1) {
      if (onVideoEnd) {
        onVideoEnd();
      }
    }
  };

  return (
    <div className="relative w-full h-screen max-w-[480px] mx-auto">
      {/* 배경 */}
      <div className="absolute bg-[#280600] w-full h-full left-0 top-0" />
      
      {/* 비디오 소스 영역 - 화면 전체 기준으로 상단 여백만 주고 나머지는 채움 */}
      <div className="absolute w-full left-0 top-[178px] bottom-0">
        <video 
          autoPlay 
          className="w-full h-full object-cover" 
          controlsList="nodownload" 
          playsInline
          muted
          onTimeUpdate={handleTimeUpdate}
        >
          <source src="https://res.cloudinary.com/dznubvml4/video/upload/v1772365174/grok-video-6b567bbd-14bc-4897-b1bb-43f044287617_rqx09n.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* 텍스트 - Figma 디자인 위치 그대로 */}
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[187px] not-italic text-[30px] text-white top-[150px] tracking-[0.9px] whitespace-nowrap z-10">
        <p className="leading-[normal]">두근두근</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[156px] not-italic text-[30px] text-white top-[184px] tracking-[0.9px] whitespace-nowrap z-10">
        <p className="leading-[normal]">선물을 뽑아요</p>
      </div>
    </div>
  );
}