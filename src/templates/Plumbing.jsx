import { photo, telHref } from '../site.js';
import { EnquiryForm, Stars, ratingLine, yearsIn } from './shared.jsx';
import './plumbing.css';

export default function Plumbing({ b, c }) {
  const tel = telHref(b.phone);
  const years = yearsIn(b);
  const rating = ratingLine(b);
  const area = b.serviceArea?.length ? b.serviceArea : [b.town];

  return (
    <div className="pl">
      <div className="pl-alert">
        <span>Burst pipe or no hot water? We answer 24/7.</span>
        <a href={tel}>Call {b.phone}</a>
      </div>

      <header className="pl-nav">
        <a href="#top" className="pl-logo">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 3c4.5 6.2 9 11 9 16a9 9 0 1 1-18 0c0-5 4.5-9.8 9-16z" fill="var(--pl-blue)" />
            <path d="M12 20a4 4 0 0 0 4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <span>{b.shortName}</span>
        </a>
        <nav aria-label="Main">
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
          <a href="#reviews">Reviews</a>
          <a href="#area">Service Area</a>
        </nav>
        <a className="pl-btn pl-btn-orange" href="#book">
          Book a Plumber
        </a>
      </header>

      <section id="top" className="pl-hero" style={{ '--hero': `url(${photo(c.hero, 2000)})` }}>
        <div className="pl-hero-inner">
          {rating && (
            <p className="pl-badge">
              <Stars value={b.rating} size={15} /> {rating}
            </p>
          )}
          <h1>
            Plumbing fixed right the first time in <span>{b.town}</span>.
          </h1>
          <p className="pl-lead">
            Licensed plumbers, a flat price before any work starts, and a truck at your door the same day.
          </p>
          <div className="pl-ctas">
            <a className="pl-btn pl-btn-orange pl-btn-lg" href={tel}>
              Call {b.phone}
            </a>
            <a className="pl-btn pl-btn-ghost pl-btn-lg" href="#book">
              Schedule Online
            </a>
          </div>
          <ul className="pl-promises">
            {c.promises.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pl-stats" aria-label="At a glance">
        {years ? (
          <div>
            <strong>{years}+</strong>
            <span>Years in {b.town}</span>
          </div>
        ) : null}
        {b.reviewCount ? (
          <div>
            <strong>{Number(b.rating).toFixed(1)}</strong>
            <span>Average rating</span>
          </div>
        ) : null}
        <div>
          <strong>24/7</strong>
          <span>Emergency line</span>
        </div>
        <div>
          <strong>Same Day</strong>
          <span>Most repairs</span>
        </div>
      </section>

      <section id="services" className="pl-section">
        <div className="pl-head">
          <p className="pl-kicker">What We Fix</p>
          <h2>Residential and light commercial plumbing</h2>
        </div>
        <div className="pl-grid">
          {c.services.map((s) => (
            <article key={s.title} className="pl-card">
              <img src={photo(s.img, 640)} alt="" loading="lazy" width="640" height="400" />
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <a href="#book">Get a Price</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="pl-how">
        <div className="pl-how-photo">
          <img src={photo(c.about, 1200)} alt="A plumber servicing a water heater" loading="lazy" />
        </div>
        <div className="pl-how-text">
          <p className="pl-kicker">How It Works</p>
          <h2>No surprises on the bill</h2>
          <ol>
            {c.steps.map((s, i) => (
              <li key={s.title}>
                <span className="pl-step">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="reviews" className="pl-section pl-reviews">
        <div className="pl-head">
          <p className="pl-kicker">Reviews</p>
          <h2>What {b.town} homeowners say</h2>
          {rating && (
            <p className="pl-rating">
              <Stars value={b.rating} size={20} /> {rating}
            </p>
          )}
        </div>
        {b.reviews.length > 0 && (
          <div className="pl-quotes">
            {b.reviews.slice(0, 3).map((r) => (
              <figure key={r.author}>
                <Stars value={r.rating} />
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.author}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section id="area" className="pl-area">
        <div>
          <p className="pl-kicker">Service Area</p>
          <h2>Serving {b.town} and the towns around it</h2>
          <ul>
            {area.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div id="book" className="pl-book">
          <h2>Book a Plumber</h2>
          <p>Tell us what is going on and we will call back within 15 minutes during office hours.</p>
          <EnquiryForm
            b={b}
            className="pl-form"
            submitLabel="Request Service"
            fields={[
              { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
              { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
              {
                name: 'service',
                label: 'Service',
                type: 'select',
                required: true,
                wide: true,
                options: [...c.services.map((s) => s.title), 'Something else'],
              },
              { name: 'details', label: 'What is happening?', type: 'textarea', wide: true },
            ]}
          />
        </div>
      </section>

      <footer className="pl-footer">
        <div>
          <strong>{b.name}</strong>
          <p>
            {b.address}
            {b.address ? ', ' : ''}
            {b.town}, {b.state}
          </p>
          {b.hours && <p>{Array.isArray(b.hours) ? b.hours.map((h) => h.join(' ')).join(' · ') : b.hours}</p>}
        </div>
        <div>
          <a href={tel}>{b.phone}</a>
          {b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}
        </div>
      </footer>

      <a className="pl-float" href={tel}>
        Call Now
      </a>
    </div>
  );
}
