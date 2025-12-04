'use client';

type ContributionVotesCardProps = {
  current: number;
  target: number;
  label: string;
  helper: string;
  status: string;
  isScam: boolean;
};

export function ContributionVotesCard({
  current,
  target,
  label,
  helper,
  status,
  isScam,
}: ContributionVotesCardProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-black/70">
        <span>{label}</span>
        <span>{status}</span>
      </div>
      <div className="mt-3 h-3 rounded-full bg-black/5">
        <div
          className={`h-full rounded-full ${
            isScam ? 'bg-[#c64b13]' : 'bg-black'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-black">
        <span>{current.toLocaleString()} CP</span>
        <span>{target.toLocaleString()} CP</span>
      </div>
      <p className="mt-1 text-xs text-black/60">{helper}</p>
    </div>
  );
}
