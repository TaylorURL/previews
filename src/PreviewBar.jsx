/**
 * The strip across the top of a prospect's preview. It stays on screen the
 * whole time, so nobody who is forwarded the link takes the page for the
 * business's own site.
 */
export default function PreviewBar({ b }) {
  const claim = `https://www.taylorurl.com/start?ref=preview&business=${encodeURIComponent(b.name)}`;
  return (
    <div
      role="note"
      className="sticky top-0 z-50 flex h-11 items-center justify-between gap-4 bg-[#0b1220] px-4 font-sans text-[13px] text-[#e6ecff] sm:justify-center"
    >
      <p className="m-0 truncate">
        <strong className="font-semibold">A preview, not a live site.</strong>{' '}
        <span className="hidden sm:inline">TaylorURL designed this for {b.name}.</span>
      </p>
      <a href={claim} className="relative flex-none rounded-full bg-[#2f6bff] px-3.5 py-1.5 font-semibold text-white no-underline before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']">
        Make It Yours
      </a>
    </div>
  );
}
