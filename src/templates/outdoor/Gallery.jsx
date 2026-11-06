/**
 * The work, shown first: the business's own photos in a grid laid out for how
 * many there are. Every frame is cut to a shape no more than half again as
 * wide as it is tall, nor taller than wide by more than a little, so a photo
 * of any common shape keeps well over half of itself.
 *
 * On a large screen the photos go in threes (one large beside two stacked,
 * the large one on alternate sides) and in pairs (a wide one beside a
 * narrower one, swapping sides row by row), whichever leaves no gap. On a
 * tablet they run two across; on a phone the first runs the full width and
 * the rest two across, the last full width when it would stand alone.
 */
import { ArrowUpRight } from 'lucide-react';
import { Img } from '../shared.jsx';

/** How many photos each block of the large-screen grid takes, in order. */
function blocks(n) {
  const out = [];
  let left = n;
  while (left > 0) {
    const take = left === 4 || left === 2 ? 2 : 3;
    out.push(Math.min(take, left));
    left -= take;
  }
  return out;
}

function tileClasses(n) {
  const out = [];
  let trio = 0;
  let pair = 0;
  for (const size of blocks(n)) {
    if (size === 3) {
      const flip = trio % 2 === 1;
      out.push(`lg:col-span-8 lg:row-span-2 lg:aspect-auto ${flip ? 'lg:col-start-5' : 'lg:col-start-1'}`);
      out.push(`lg:col-span-4 lg:aspect-[4/3] ${flip ? 'lg:col-start-1' : 'lg:col-start-9'}`);
      out.push(`lg:col-span-4 lg:aspect-[4/3] ${flip ? 'lg:col-start-1' : 'lg:col-start-9'}`);
      trio += 1;
    } else {
      const wide = 'lg:col-span-7 lg:aspect-auto';
      const narrow = 'lg:col-span-5 lg:aspect-[27/25]';
      out.push(...(pair % 2 === 0 ? [wide, narrow] : [narrow, wide]));
      pair += 1;
    }
  }
  return out.map((large, i) => {
    const rest = n - 1;
    const phone = i === 0 || (rest % 2 === 1 && i === n - 1) ? 'col-span-2 aspect-[4/3]' : 'col-span-1 aspect-square';
    const tablet = n % 2 === 1 && i === 0 ? 'md:col-span-2 md:aspect-[3/2]' : 'md:col-span-1 md:aspect-[4/3]';
    return `${phone} ${tablet} ${large}`;
  });
}

/**
 * The width to ask each photo for. A frame is cut from its photo, so it needs
 * the photo at the width its height calls for (a wide photo in a squarer
 * frame is wider than the frame), not at the frame's own width.
 */
function sizesOf(classes) {
  const large = classes.includes('lg:col-span-8') ? 80 : classes.includes('lg:col-span-4') ? 40 : 55;
  const tablet = classes.includes('md:col-span-2') ? 100 : 55;
  const phone = classes.startsWith('col-span-2') ? 100 : 72;
  return `(min-width: 1024px) ${large}vw, (min-width: 768px) ${tablet}vw, ${phone}vw`;
}

function Caption({ photo }) {
  if (!photo.title) return null;
  return (
    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.35)_55%,transparent)] px-4 pb-4 pt-14 text-white sm:px-6 sm:pb-5">
      <span className="min-w-0">
        <span className="block font-heading text-[16px] font-bold leading-snug sm:text-[19px]">{photo.title}</span>
        {photo.place && <span className="mt-0.5 block text-[13px] text-white/80 sm:text-[14px]">{photo.place}</span>}
      </span>
      {photo.href && (
        <span className="hidden h-10 w-10 flex-none place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white group-hover:text-ink sm:grid" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
      )}
    </figcaption>
  );
}

function Tile({ photo, className, sizes }) {
  const body = (
    <figure className="m-0 h-full w-full">
      <Img
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        src={photo.src}
        alt={photo.alt}
        sizes={sizes}
      />
      <Caption photo={photo} />
    </figure>
  );
  const frame = `group relative min-h-0 overflow-hidden rounded-[18px] bg-[color:var(--paper)] sm:rounded-[22px] ${className}`;
  return photo.href ? (
    <a href={photo.href} className={`${frame} block no-underline`} aria-label={photo.title}>
      {body}
    </a>
  ) : (
    <div className={frame}>{body}</div>
  );
}

export default function Gallery({ photos }) {
  if (!photos.length) return null;
  if (photos.length === 1) {
    const [photo] = photos;
    // One photo is drawn whole in its own proportions, no wider than it can fill sharply.
    return (
      <div className="group relative mx-auto max-w-3xl overflow-hidden rounded-[22px]">
        <Img className="block h-auto w-full" src={photo.src} alt={photo.alt} sizes="(min-width: 768px) 768px, 100vw" />
        <Caption photo={photo} />
      </div>
    );
  }
  const classes = tileClasses(photos.length);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-flow-row-dense lg:grid-cols-12">
      {photos.map((photo, i) => (
        <Tile key={photo.src} photo={photo} className={classes[i]} sizes={sizesOf(classes[i])} />
      ))}
    </div>
  );
}
