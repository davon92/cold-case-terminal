export default function RetroPanel({
    title = 'SYSTEM PANEL',
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="bg-[#c0c0c0] border-4 border-[#9f9f9f] shadow-inner text-black font-mono p-4 w-full max-w-xl space-y-3">
        <div className="bg-[#e0e0e0] border-b-2 border-[#666] px-2 py-1 font-bold text-xs tracking-widest uppercase">
          {title}
        </div>
  
        <div className="bg-white border border-[#999] p-3 text-xs leading-tight space-y-2">
          {children}
        </div>
      </div>
    );
  }
  