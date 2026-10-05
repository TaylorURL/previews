import { useState } from 'react';
import { pic } from '../site.js';

export function Stars({ value = 5, size = 16, className = 'text-star' }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
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

/** A responsive image from a brand file path or an Unsplash URL. */
export function Img({ src, alt = '', sizes = '100vw', className, eager = false }) {
  const { src: url, srcSet } = pic(src);
  return (
    <img
      className={className}
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

/** The logo when the business has one, its name set in type when it does not. */
export function Logo({ b, className = '', textClass = '' }) {
  if (b.brand.logo) {
    return (
      <img
        className={`block h-auto max-w-[44vw] ${className}`}
        src={b.brand.logo}
        alt={b.name}
        style={{ width: b.brand.logoWidth }}
      />
    );
  }
  return <span className={`font-heading text-2xl font-bold ${textClass}`}>{b.shortName}</span>;
}

/**
 * The enquiry form. On a preview it goes nowhere and says so on submit,
 * rather than pretending a message was sent. The template passes the
 * classes for each part in `styles`.
 */
export function EnquiryForm({ b, fields, submitLabel, styles }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className={`grid gap-1 ${styles.done}`} role="status">
        <strong>Thanks. On the live site, this goes straight to {b.shortName}.</strong>
        <span>Nothing was sent from this preview.</span>
      </div>
    );
  }
  return (
    <form
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${styles.form}`}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      {fields.map((f) => (
        <label key={f.name} className={`grid gap-1.5 ${styles.label} ${f.wide ? 'sm:col-span-2' : ''}`}>
          <span>{f.label}</span>
          {f.type === 'select' ? (
            <select className={`w-full ${styles.field}`} name={f.name} required={f.required} defaultValue="">
              <option value="" disabled>
                Choose One
              </option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea className={`w-full ${styles.field}`} name={f.name} rows={4} required={f.required} />
          ) : (
            <input
              className={`w-full ${styles.field}`}
              name={f.name}
              type={f.type || 'text'}
              required={f.required}
              autoComplete={f.autoComplete}
            />
          )}
        </label>
      ))}
      <button type="submit" className={`cursor-pointer sm:col-span-2 ${styles.button}`}>
        {submitLabel}
      </button>
    </form>
  );
}
