import { useState } from 'react';
import { heroSrcSet, photo, telHref } from '../site.js';
import { EnquiryForm, Stars, ratingLine, yearsIn } from './shared.jsx';
import './realestate.css';

const money = (n) => `$${n.toLocaleString()}`;

export default function RealEstate({ b, c }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const years = yearsIn(b);
  const areas = b.neighborhoods?.length ? b.neighborhoods : [b.town];
  const [filter, setFilter] = useState('All');
  const tags = ['All', ...new Set(c.listings.map((l) => l.tag))];
  const listings = filter === 'All' ? c.listings : c.listings.filter((l) => l.tag === filter);

  return (
    <div className="re">
      <header className="re-nav">
        <a href="#top" className="re-logo">
          {b.shortName}
        </a>
        <nav aria-label="Main">
          <a href="#listings">Listings</a>
          <a href="#sell">Sell</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="re-btn re-btn-outline" href={tel}>
          {b.phone}
        </a>
      </header>

      <section id="top" className="re-hero">
        <img
          className="re-hero-img"
          srcSet={heroSrcSet(c.hero)}
          sizes="100vw"
          src={photo(c.hero, 1400)}
          alt=""
          fetchPriority="high"
        />
        <div className="re-hero-inner">
          <p className="re-eyebrow">
            {b.town}, {b.state} Real Estate
          </p>
          <h1>Find the home that fits the life you want.</h1>
          <form
            className="re-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById('listings').scrollIntoView();
            }}
          >
            <label>
              <span className="sr-only">City, neighborhood or ZIP</span>
              <input placeholder={`Search ${b.town} by neighborhood or ZIP`} />
            </label>
            <select aria-label="Price" defaultValue="">
              <option value="">Any Price</option>
              <option>Under $300k</option>
              <option>$300k – $500k</option>
              <option>$500k+</option>
            </select>
            <select aria-label="Bedrooms" defaultValue="">
              <option value="">Any Beds</option>
              <option>2+ Beds</option>
              <option>3+ Beds</option>
              <option>4+ Beds</option>
            </select>
            <button type="submit">Search Homes</button>
          </form>
        </div>
      </section>

      <section className="re-proof" aria-label="At a glance">
        {b.homesSold ? (
          <div>
            <strong>{b.homesSold.toLocaleString()}+</strong>
            <span>Homes sold</span>
          </div>
        ) : null}
        {years ? (
          <div>
            <strong>{years}</strong>
            <span>Years in {b.town}</span>
          </div>
        ) : null}
        {rating ? (
          <div>
            <strong>{Number(b.rating).toFixed(1)}</strong>
            <span>
              <Stars value={b.rating} size={13} /> {b.reviewCount} reviews
            </span>
          </div>
        ) : null}
        <div>
          <strong>24 hr</strong>
          <span>Reply on every enquiry</span>
        </div>
      </section>

      <section id="listings" className="re-section">
        <div className="re-head">
          <div>
            <p className="re-eyebrow">Featured Listings</p>
            <h2>Homes for sale around {b.town}</h2>
            {b.isPreview && <p className="re-note">Sample homes, shown until your own listings are added.</p>}
          </div>
          <div className="re-filters" role="tablist" aria-label="Filter listings">
            {tags.map((t) => (
              <button key={t} role="tab" aria-selected={filter === t} onClick={() => setFilter(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="re-grid">
          {listings.map((l) => (
            <article key={l.street} className="re-card">
              <div className="re-card-img">
                <img src={photo(l.img, 800)} alt={`${l.street}, ${b.town}`} loading="lazy" />
                <span>{l.tag}</span>
              </div>
              <div className="re-card-body">
                <strong>{money(l.price)}</strong>
                <p>
                  {l.street}, {b.town}
                </p>
                <ul>
                  <li>{l.beds} bd</li>
                  <li>{l.baths} ba</li>
                  <li>{l.sqft.toLocaleString()} sqft</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="sell" className="re-sell">
        <div className="re-sell-imgs">
          {c.interiors.map((i) => (
            <img key={i} src={photo(i, 900)} alt="" loading="lazy" />
          ))}
        </div>
        <div className="re-sell-text">
          <p className="re-eyebrow">Selling</p>
          <h2>What is your home worth today?</h2>
          <p>
            Get a pricing report built from this month&rsquo;s sales on your street, not an automated guess. It
            comes back within a day, with no obligation to list.
          </p>
          <EnquiryForm
            b={b}
            className="re-form"
            submitLabel="Get My Home Value"
            fields={[
              { name: 'address', label: 'Property Address', required: true, wide: true, autoComplete: 'street-address' },
              { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
              { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
            ]}
          />
        </div>
      </section>

      <section id="about" className="re-about">
        <img src={photo(c.agentPhoto, 1200)} alt="" loading="lazy" />
        <div>
          <p className="re-eyebrow">About</p>
          <h2>{b.agent ? `Meet ${b.agent}` : `About ${b.shortName}`}</h2>
          <p>
            {b.shortName} helps buyers and sellers across {b.town} with the parts of a move that are hard to do
            alone: pricing a home right, getting it in front of the right buyers, and negotiating the inspection
            and repairs that follow.
          </p>
          <h3>Neighborhoods</h3>
          <ul className="re-areas">
            {areas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      {(b.reviews.length > 0 || rating) && (
        <section className="re-section re-reviews">
          <p className="re-eyebrow">Client Stories</p>
          {rating && (
            <p className="re-rating">
              <Stars value={b.rating} size={18} /> {rating}
            </p>
          )}
          {b.reviews.length > 0 && (
            <div className="re-quotes">
              {b.reviews.slice(0, 3).map((r) => (
                <figure key={r.author}>
                  <blockquote>{r.text}</blockquote>
                  <figcaption>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      <section id="contact" className="re-contact">
        <div>
          <p className="re-eyebrow">Contact</p>
          <h2>Start the conversation</h2>
          <p>
            <a href={tel}>{b.phone}</a>
            {b.email && (
              <>
                <br />
                <a href={`mailto:${b.email}`}>{b.email}</a>
              </>
            )}
          </p>
          {b.address && (
            <p>
              {b.address}
              <br />
              {b.town}, {b.state}
            </p>
          )}
        </div>
        <EnquiryForm
          b={b}
          className="re-form re-form-light"
          submitLabel="Send Message"
          fields={[
            { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
            { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
            {
              name: 'goal',
              label: 'I Want To',
              type: 'select',
              wide: true,
              options: ['Buy a home', 'Sell my home', 'Buy and sell', 'Just exploring'],
            },
            { name: 'message', label: 'Message', type: 'textarea', wide: true },
          ]}
        />
      </section>

      <footer className="re-footer">
        <span>{b.name}</span>
        <span>Equal Housing Opportunity</span>
      </footer>
    </div>
  );
}
