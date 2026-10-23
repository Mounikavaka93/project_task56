export default function SectionHeading({ index, title, caption }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-copper">{index}</p>
        <h2 className="mt-1 font-display text-[1.7rem] leading-none tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {caption ? <p className="max-w-[46%] shrink-0 text-right text-sm leading-snug text-muted sm:max-w-[18rem]">{caption}</p> : null}
    </div>
  );
}
