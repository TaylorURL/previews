/**
 * Reading the hours rows of a brand file - [["Mon – Fri", "7:30 AM – 6 PM"], ...] -
 * as days of the week, so a page can say what today's hours are.
 */

const KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The days of the week (0 is Sunday) a label such as "Mon – Fri" or "Saturday" covers. */
export function daysOf(label = '') {
  const s = String(label).toLowerCase();
  if (/daily|every ?day|7 days|all week/.test(s)) return [0, 1, 2, 3, 4, 5, 6];
  if (/weekdays/.test(s)) return [1, 2, 3, 4, 5];
  if (/weekends/.test(s)) return [0, 6];
  const found = [...s.matchAll(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/g)].map((m) => ({
    day: KEYS.indexOf(m[1]),
    start: m.index,
    end: m.index + m[0].length,
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

/** The hours given for a day of the week, or null when no row covers it. */
export function hoursOn(hours = [], day) {
  let value = null;
  for (const [label, time] of hours) if (daysOf(label).includes(day)) value = time;
  return value;
}

export const isClosed = (time) => !time || /closed/i.test(time);

/** The days the shop is open, Monday first, by name. */
export function openDays(hours = []) {
  return [1, 2, 3, 4, 5, 6, 0].filter((d) => !isClosed(hoursOn(hours, d))).map((d) => DAY_NAMES[d]);
}

/** Today's day of the week where the shop is, in Houston. */
export function todayInHouston(now = new Date()) {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Chicago' }).format(now);
  return KEYS.indexOf(name.slice(0, 3).toLowerCase());
}
