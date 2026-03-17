export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-white h-[338px] left-0 rounded-[21px] top-0 w-[239px]" />
      <div className="absolute bg-[#d9d9d9] h-[203px] left-0 top-[35px] w-[239px]" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[15px] top-[274px] tracking-[0.45px] whitespace-nowrap">
        <p className="leading-[normal]">Product_Name</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] left-[25px] not-italic text-[#020202] text-[15px] top-[300px] tracking-[0.45px] whitespace-nowrap">
        <p className="leading-[normal]">Product_Price</p>
      </div>
    </div>
  );
}