import { heroSrcSet, photo, telHref } from '../site.js';
import { EnquiryForm, Stars, ratingLine } from './shared.jsx';
import './barber.css';

export default function Barber({ b, c }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const menu = b.menu?.length ? b.menu : c.menu;
  const team = b.isPreview ? b.team || [] : c.team;
  const hours = Array.isArray(b.hours) ? b.hours : null;
  const mapQuery = encodeURIComponent(`${b.name} ${b.address || ''} ${b.town} ${b.state}`);

  return (
    <div className="bb">
      <header className="bb-nav">
        <a href="#top" className="bb-logo">
          {b.shortName}
        </a>
        <nav aria-label="Main">
          <a href="#menu">Services</a>
          {team.length > 0 && <a href="#team">Barbers</a>}
          <a href="#work">Work</a>
          <a href="#visit">Visit</a>
        </nav>
        <a className="bb-btn" href="#book">
          Book Now
        </a>
      </header>

      <section id="top" className="bb-hero">
        <img
          className="bb-hero-img"
          srcSet={heroSrcSet(c.hero)}
          sizes="100vw"
          src={photo(c.hero, 1400)}
          alt=""
          fetchPriority="high"
        />
        <div className="bb-hero-inner">
          <p className="bb-eyebrow">
            {b.town}, {b.state}
            {b.since ? ` · Since ${b.since}` : ''}
          </p>
          <h1>
            Sharp cuts.
            <br />
            No waiting around.
          </h1>
          <p className="bb-lead">
            Fades, beards and hot towel shaves at {b.shortName}. Pick a barber, pick a time, and walk straight
            to the chair.
          </p>
          <div className="bb-ctas">
            <a className="bb-btn bb-btn-lg" href="#book">
              Book Your Cut
            </a>
            <a className="bb-link" href={tel}>
              or call {b.phone}
            </a>
          </div>
          {rating && (
            <p className="bb-rating">
              <Stars value={b.rating} /> {rating}
            </p>
          )}
        </div>
      </section>

      <section id="menu" className="bb-section bb-menu">
        <div className="bb-head">
          <p className="bb-eyebrow">The Menu</p>
          <h2>Services and Prices</h2>
        </div>
        <ul>
          {menu.map((m) => (
            <li key={m.name}>
              <div className="bb-menu-row">
                <h3>{m.name}</h3>
                <span className="bb-dots" aria-hidden="true" />
                <strong>${m.price}</strong>
              </div>
              <p>
                {m.text} <em>{m.time}</em>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bb-split">
        <img src={photo(c.shop, 1400)} alt="Barber chairs inside the shop" loading="lazy" />
        <div>
          <p className="bb-eyebrow">The Shop</p>
          <h2>A chair that is ready when you get here</h2>
          <p>
            Online booking holds your slot, so the time you pick is the time you sit down. Walk-ins are welcome
            whenever a chair is open.
          </p>
          <a className="bb-btn" href="#book">
            See Open Times
          </a>
        </div>
      </section>

      {team.length > 0 && (
      <section id="team" className="bb-section">
        <div className="bb-head">
          <p className="bb-eyebrow">The Barbers</p>
          <h2>Pick Your Barber</h2>
        </div>
        <div className="bb-team">
          {team.map((t, i) => (
            <figure key={t.name}>
              <img src={photo(t.img || c.team[i % c.team.length].img, 700)} alt="" loading="lazy" />
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      )}

      <section id="work" className="bb-gallery" aria-label="Recent work">
        {c.gallery.map((g) => (
          <img key={g} src={photo(g, 700)} alt="" loading="lazy" />
        ))}
      </section>

      {(b.reviews.length > 0 || rating) && (
        <section className="bb-section bb-reviews">
          <div className="bb-head">
            <p className="bb-eyebrow">Reviews</p>
            <h2>From the Chair</h2>
            {rating && (
              <p className="bb-rating">
                <Stars value={b.rating} /> {rating}
              </p>
            )}
          </div>
          {b.reviews.length > 0 && (
            <div className="bb-quotes">
              {b.reviews.slice(0, 3).map((r) => (
                <figure key={r.author}>
                  <blockquote>&ldquo;{r.text}&rdquo;</blockquote>
                  <figcaption>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      <section id="visit" className="bb-visit">
        <div id="book" className="bb-book">
          <h2>Book a Chair</h2>
          <EnquiryForm
            b={b}
            className="bb-form"
            submitLabel="Request This Time"
            fields={[
              { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
              { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
              {
                name: 'service',
                label: 'Service',
                type: 'select',
                required: true,
                options: menu.map((m) => m.name),
              },
              {
                name: 'barber',
                label: 'Barber',
                type: 'select',
                options: ['First available', ...team.map((t) => t.name)],
              },
              { name: 'when', label: 'Day and Time', type: 'datetime-local', required: true, wide: true },
            ]}
          />
        </div>
        <div className="bb-info">
          <h2>Visit</h2>
          {b.address && (
            <p>
              {b.address}
              <br />
              {b.town}, {b.state}
            </p>
          )}
          <p>
            <a href={tel}>{b.phone}</a>
          </p>
          {hours ? (
            <dl>
              {hours.map(([d, h]) => (
                <div key={d}>
                  <dt>{d}</dt>
                  <dd>{h}</dd>
                </div>
              ))}
            </dl>
          ) : (
            b.hours && <p>{b.hours}</p>
          )}
          <a className="bb-link" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}>
            Get Directions
          </a>
        </div>
      </section>

      <footer className="bb-footer">
        <span>{b.name}</span>
        <span>
          {b.town}, {b.state}
        </span>
      </footer>

      <a className="bb-float" href="#book">
        Book Now
      </a>
    </div>
  );
}
