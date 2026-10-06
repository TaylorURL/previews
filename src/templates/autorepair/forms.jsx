import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { openDays } from './hours.js';
import { cardTitle, href, solid } from './ui.jsx';

const field =
  'min-h-[50px] w-full rounded-none border border-line bg-surface px-3.5 py-2.5 font-body text-[16px] font-normal text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20';
const label = 'grid gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ink';

/**
 * Where a form on this site sends its reader. A prerendered page lives at
 * /<path>; a preview URL or localhost names the business and page in the
 * query instead, so the same form works in both.
 */
function go(path, params) {
  const here = new URLSearchParams(window.location.search);
  const query = new URLSearchParams(params);
  if (here.get('b')) {
    query.set('b', here.get('b'));
    query.set('p', path);
    window.location.assign(`${window.location.pathname}?${query}`);
  } else {
    window.location.assign(`${href(path)}?${query}`);
  }
}

function Choice({ name, options, value, required, placeholder = 'Choose One' }) {
  return (
    <select className={`${field} cursor-pointer`} name={name} required={required} defaultValue={value || ''}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

const serviceOptions = (b) => [...b.services.map((s) => s.title), 'State Inspection', 'Something Else'];

/** The short form in the hero: the vehicle and the service, carried on to the appointment page. */
export function QuickBook({ b }) {
  const makes = b.makes?.length ? b.makes : null;
  return (
    <form
      action={href('appointment')}
      method="get"
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        go('appointment', Object.fromEntries(Object.entries(data).filter(([, v]) => v)));
      }}
    >
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3">
        <label className={label}>
          <span>Year</span>
          <input className={field} name="year" inputMode="numeric" maxLength={4} autoComplete="off" />
        </label>
        <label className={label}>
          <span>Make</span>
          {makes ? <Choice name="make" options={[...makes, 'Other']} placeholder="Choose" /> : <input className={field} name="make" />}
        </label>
      </div>
      <label className={label}>
        <span>Service</span>
        <Choice name="service" options={serviceOptions(b)} />
      </label>
      <button type="submit" className={`${solid} w-full cursor-pointer`}>
        Continue <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

/**
 * The appointment request. On a preview it goes nowhere and says so on
 * submit, rather than pretending a request was sent. Anything the hero's
 * short form or a service page carried over in the address is filled in.
 */
export function AppointmentForm({ b }) {
  const [sent, setSent] = useState(false);
  const [given, setGiven] = useState(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const service = q.get('service');
    const group = b.services.find((s) => s.slug === service);
    setGiven({
      year: q.get('year') || '',
      make: q.get('make') || '',
      model: q.get('model') || '',
      service: group ? group.title : service || '',
    });
  }, [b.services]);

  if (sent) {
    return (
      <div className="grid gap-2 border-l-4 border-primary bg-surface p-6" role="status">
        <strong className={`text-[20px] ${cardTitle}`}>Thanks. On the live site, this goes straight to {b.shortName}.</strong>
        <span className="text-muted">Nothing was sent from this preview.</span>
      </div>
    );
  }

  const v = given || {};
  const days = openDays(b.hours);
  const makes = b.makes?.length ? [...b.makes, 'Other'] : null;
  const services = serviceOptions(b);

  return (
    <form
      key={given ? 'filled' : 'empty'}
      className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <fieldset className="contents">
        <legend className="sr-only">Vehicle</legend>
        <p className={`text-[18px] sm:col-span-6 ${cardTitle}`}>The Vehicle</p>
        <label className={`${label} sm:col-span-2`}>
          <span>Year</span>
          <input className={field} name="year" inputMode="numeric" maxLength={4} required defaultValue={v.year} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span>Make</span>
          {makes && (!v.make || makes.includes(v.make)) ? (
            <Choice name="make" options={makes} value={v.make} required />
          ) : (
            <input className={field} name="make" required defaultValue={v.make} />
          )}
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span>Model</span>
          <input className={field} name="model" required defaultValue={v.model} />
        </label>
        <label className={`${label} sm:col-span-6`}>
          <span>Service</span>
          <Choice name="service" options={services.includes(v.service) || !v.service ? services : [v.service, ...services]} value={v.service} required />
        </label>
        <label className={`${label} sm:col-span-6`}>
          <span>What Is It Doing?</span>
          <textarea className={`${field} min-h-[110px]`} name="details" rows={4} />
        </label>
      </fieldset>
      <fieldset className="contents">
        <legend className="sr-only">When</legend>
        <p className={`mt-2 border-t border-line pt-6 text-[18px] sm:col-span-6 ${cardTitle}`}>When</p>
        <label className={`${label} sm:col-span-3`}>
          <span>Preferred Day</span>
          {days.length ? <Choice name="day" options={days} required /> : <input className={field} name="day" required />}
        </label>
        <label className={`${label} sm:col-span-3`}>
          <span>Drop Off or Wait</span>
          <Choice name="wait" options={['Drop it off', 'Wait for it']} />
        </label>
      </fieldset>
      <fieldset className="contents">
        <legend className="sr-only">You</legend>
        <p className={`mt-2 border-t border-line pt-6 text-[18px] sm:col-span-6 ${cardTitle}`}>You</p>
        <label className={`${label} sm:col-span-3`}>
          <span>Name</span>
          <input className={field} name="name" required autoComplete="name" />
        </label>
        <label className={`${label} sm:col-span-3`}>
          <span>Phone</span>
          <input className={field} name="phone" type="tel" required autoComplete="tel" />
        </label>
        <label className={`${label} sm:col-span-6`}>
          <span>Email</span>
          <input className={field} name="email" type="email" autoComplete="email" />
        </label>
      </fieldset>
      <button type="submit" className={`${solid} w-full cursor-pointer sm:col-span-6`}>
        Request Appointment
      </button>
      <p className="text-[15px] text-muted sm:col-span-6">We call you back to confirm the time.</p>
    </form>
  );
}
