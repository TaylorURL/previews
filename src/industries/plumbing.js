export default {
  fonts: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap',
  titleSuffix: (b) => `Plumber in ${b.town}, ${b.state}`,
  sample: {
    name: 'Bayside Plumbing Co.',
    shortName: 'Bayside Plumbing',
    phone: '(281) 555-0142',
    email: 'service@baysideplumbing.example',
    address: '1200 Market St',
    town: 'Baytown',
    state: 'TX',
    since: 2009,
    rating: 4.9,
    reviewCount: 212,
    serviceArea: ['Baytown', 'Mont Belvieu', 'La Porte', 'Highlands', 'Crosby', 'Pasadena'],
    hours: 'Office Mon–Sat 7am–7pm. Emergency calls answered around the clock.',
    reviews: [
      {
        author: 'Maria G.',
        rating: 5,
        text: 'Water heater went out on a Sunday night. They had a tech here by 9 the next morning and a new tank in by lunch. Price was exactly what they quoted on the phone.',
      },
      {
        author: 'Derek H.',
        rating: 5,
        text: 'Found a slab leak two other companies missed. Showed me the readings on the meter before touching anything.',
      },
      {
        author: 'Lynn P.',
        rating: 5,
        text: 'Cleaned out a kitchen line that kept backing up and ran a camera to show me why. Has not clogged since.',
      },
    ],
  },
  hero: 'photo-1749532125405-70950966b0e5',
  about: 'photo-1676210134190-3f2c0d5cf58d',
  services: [
    {
      title: 'Drain Cleaning',
      text: 'Kitchen, bath and main lines cleared with a cable or hydro-jet, and a camera run when a clog keeps coming back.',
      img: 'photo-1676210133055-eab6ef033ce3',
    },
    {
      title: 'Water Heaters',
      text: 'Tank and tankless units repaired or replaced, usually the same day, with the old one hauled off.',
      img: 'photo-1676210134190-3f2c0d5cf58d',
    },
    {
      title: 'Leak Detection',
      text: 'Slab and wall leaks found with acoustic and thermal gear, so the floor is opened in one spot, not five.',
      img: 'photo-1676210134188-4c05dd172f89',
    },
    {
      title: 'Toilets and Fixtures',
      text: 'Running toilets, dripping faucets, new vanities and disposals, installed and sealed properly.',
      img: 'photo-1676210134050-6f12c6898395',
    },
    {
      title: 'Sewer Line Repair',
      text: 'Root intrusion and broken lines repaired, with trenchless options where the yard allows it.',
      img: 'photo-1646009445351-b8192e095f3a',
    },
    {
      title: 'Repiping',
      text: 'Old galvanized and polybutylene pipe swapped for PEX or copper, room by room, with drywall patched after.',
      img: 'photo-1607472586893-edb57bdc0e39',
    },
  ],
  steps: [
    { title: 'Call or Book Online', text: 'A real person answers, asks what is going on and gives you an arrival window.' },
    { title: 'Get the Price First', text: 'The plumber looks at the problem and quotes a flat price. No work starts until you say yes.' },
    { title: 'Fixed and Cleaned Up', text: 'The job is done, tested in front of you and the work area is left the way it was found.' },
  ],
  promises: ['Licensed and insured', 'Flat-rate pricing', 'Same-day service', '1-year labor warranty'],
};
