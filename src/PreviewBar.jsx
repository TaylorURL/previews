/**
 * The strip across the top of a personalised preview. It stays on screen the
 * whole time, so nobody who is forwarded the link takes the page for the
 * business's own site.
 */
export default function PreviewBar({ business }) {
  const claim = `https://www.taylorurl.com/start?ref=preview&business=${encodeURIComponent(business.name)}`;
  return (
    <div className="preview-bar" role="note">
      <p>
        <strong>A preview, not a live site.</strong> TaylorURL built this sample for {business.shortName}.
      </p>
      <a href={claim}>Make It Yours</a>
    </div>
  );
}
