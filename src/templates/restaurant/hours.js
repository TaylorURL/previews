/**
 * Reading the hours rows of a brand file - [["Mon – Thu", "11 AM – 9 PM"], ...] -
 * as days of the week, so the page can mark today's row.
 */
import { useEffect, useState } from 'react';

const KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The days of the week (0 is Sunday) a label such as "Mon – Fri" or "Saturday" covers. */
export function daysOf(label = '') {
  const s = String(label).toLowerCase();
  if (/daily|every ?day|7 days|all week/.test(s)) return [0, 1, 2, 3, 4, 5, 6];
  if (/weekdays/.test(s)) return [1, 2, 3, 4, 5];
  if (/weekends/.test(s)) return [0, 6];
  const found = [...s.matchAll(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/g)].map((m) => ({
    day: KEYS.indexOf(m[1]),
    end: m.index + m[0].length,
    start: m.index,
  }));
  const days = new Set();
  found.forEach((t, i) => {
    days.add(t.day);
    const next = found[i + 1];
    if (next && /[–—-]|\bto\b|through|thru/.test(s.slice(t.end, next.start))) {
      for (let d = t.day; d !== next.day; d = (d + 1) % 7) days.add(d);
    }
  });
  return [...days];
}

export const isClosed = (time) => !time || /closed/i.test(time);

/** Today's day of the week where the restaurant is, in Houston. */
function todayInHouston(now = new Date()) {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Chicago' }).format(now);
  return KEYS.indexOf(name.slice(0, 3).toLowerCase());
}

/**
 * Today's day of the week, known only once the page is in a browser, so the
 * prerendered page and the live one agree on first paint.
 */
export function useToday() {
  const [today, setToday] = useState(null);
  useEffect(() => setToday(todayInHouston()), []);
  return today;
}
