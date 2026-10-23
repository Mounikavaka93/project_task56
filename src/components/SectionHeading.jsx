export default function SectionHeading({ index, title, caption }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-copper">{index}</p>
        <h2 className="mt-1 font-display text-[1.7rem] tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {caption ? <p className="max-w-[14rem] text-right text-sm text-muted sm:max-w-none">{caption}</p> : null}
    </div>
  );
}
