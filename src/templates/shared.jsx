import { useState } from 'react';

export function Stars({ value = 5, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
            fill={i < full ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </span>
  );
}

/** "4.9 from 212 Google reviews", or nothing when the count is unknown. */
export function ratingLine(b) {
  if (!b.rating || !b.reviewCount) return null;
  return `${Number(b.rating).toFixed(1)} from ${b.reviewCount.toLocaleString()} Google reviews`;
}

export function yearsIn(b) {
  return b.since ? new Date().getFullYear() - b.since : null;
}

/**
 * The enquiry form. On a preview it goes nowhere, and says so on submit
 * rather than pretending a message was sent.
 */
export function EnquiryForm({ b, fields, submitLabel, className = '' }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className={`form-done ${className}`} role="status">
        <strong>On the live site, this lands in {b.shortName}&rsquo;s inbox.</strong>
        <span>Every enquiry also texts the owner, so nobody waits on a reply.</span>
      </div>
    );
  }
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      {fields.map((f) => (
        <label key={f.name} className={f.wide ? 'wide' : undefined}>
          <span>{f.label}</span>
          {f.type === 'select' ? (
            <select name={f.name} required={f.required} defaultValue="">
              <option value="" disabled>
                Choose One
              </option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea name={f.name} rows={4} required={f.required} />
          ) : (
            <input name={f.name} type={f.type || 'text'} required={f.required} autoComplete={f.autoComplete} />
          )}
        </label>
      ))}
      <button type="submit" className="wide">
        {submitLabel}
      </button>
    </form>
  );
}
