export function FactoryLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-stretch text-base font-bold relative">
        <span className="bg-[oklch(0.55_0.2_27)] text-white px-2 py-1 tracking-wider">FAC</span>
        <span className="border border-[oklch(0.5_0.07_210)] text-[oklch(0.5_0.07_210)] px-2 py-1 tracking-wider">TORY</span>
        <span className="absolute -right-3 -top-1 text-[0.55rem] text-[oklch(0.5_0.07_210)]">™</span>
      </div>
      <div className="text-[0.6rem] tracking-[0.2em] text-[oklch(0.5_0.07_210)] font-medium">
        ERP SOLUTION PROVIDERS
      </div>
    </div>
  );
}