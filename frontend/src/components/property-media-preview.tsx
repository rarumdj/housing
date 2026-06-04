type PropertyMediaPreviewProps = {
  title: string;
  variant?: 'aerial' | 'interior';
  roomLabels?: string[];
  caption?: string;
};

export const PropertyMediaPreview = ({
  title,
  variant = 'aerial',
  roomLabels = [],
  caption,
}: PropertyMediaPreviewProps) => {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-stone-300/70 bg-[linear-gradient(145deg,#fff7ed,#ffedd5_45%,#e7e5e4)]">
      <div className="relative min-h-[220px] overflow-hidden px-5 py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(120,113,108,0.14),transparent_32%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              {variant === 'aerial' ? 'Aerial relation' : 'Interior relation'}
            </p>
            <h4 className="mt-2 text-xl font-semibold text-stone-950">{title}</h4>
          </div>
          <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-stone-700">
            3D context
          </div>
        </div>

        <div className="relative mt-6 grid gap-3">
          {roomLabels.map((roomLabel, index) => (
            <div
              key={`${roomLabel}-${index}`}
              className="flex items-center justify-between rounded-[1rem] border border-white/70 bg-white/75 px-4 py-3 shadow-[0_10px_30px_rgba(120,113,108,0.08)]"
            >
              <p className="font-semibold text-stone-900">{roomLabel}</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
                Linked
              </span>
            </div>
          ))}
        </div>

        {caption ? (
          <p className="relative mt-5 text-sm leading-7 text-stone-600">{caption}</p>
        ) : null}
      </div>
    </div>
  );
};
