interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-[80px] px-[24px] text-center">
      {icon && (
        <div className="mb-[24px] flex justify-center opacity-30">
          {icon}
        </div>
      )}
      <h3 className="font-['Noto_Sans_KR:Medium',sans-serif] text-[16px] text-black mb-[8px]">
        {title}
      </h3>
      {description && (
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-500 mb-[24px] leading-[1.6]">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-black text-white rounded-[8px] px-[24px] h-[44px] font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] active:scale-95 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
