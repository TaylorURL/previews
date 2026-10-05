export default {
  fonts:
    'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap',
  titleSuffix: (b) => `Barber Shop in ${b.town}, ${b.state}`,
  sample: {
    name: 'Sharp Line Barber Co.',
    shortName: 'Sharp Line',
    phone: '(281) 555-0187',
    email: 'book@sharpline.example',
    address: '418 W Texas Ave',
    town: 'Baytown',
    state: 'TX',
    since: 2016,
    rating: 4.9,
    reviewCount: 348,
    hours: [
      ['Mon', 'Closed'],
      ['Tue – Fri', '9am – 7pm'],
      ['Sat', '8am – 5pm'],
      ['Sun', '10am – 3pm'],
    ],
    reviews: [
      {
        author: 'Jordan T.',
        rating: 5,
        text: 'Cleanest fade I have had in years. Booked online at lunch and was in the chair by 5.',
      },
      {
        author: 'Chris M.',
        rating: 5,
        text: 'Brought my son for his first real haircut. They were patient with him and he walked out grinning.',
      },
      {
        author: 'Andre W.',
        rating: 5,
        text: 'The hot towel shave is worth every dollar. Good music, no rush, fair prices.',
      },
    ],
  },
  hero: 'photo-1503951914875-452162b0f3f1',
  shop: 'photo-1585747860715-2ba37e788b70',
  menu: [
    { name: 'Classic Cut', price: 30, time: '30 min', text: 'Scissor or clipper cut, washed and styled.' },
    { name: 'Skin Fade', price: 35, time: '40 min', text: 'Bald to blended, finished with a straight-razor line.' },
    { name: 'Beard Trim', price: 20, time: '20 min', text: 'Shaped, lined and finished with a hot towel.' },
    { name: 'Cut and Beard', price: 45, time: '50 min', text: 'The full service, start to finish.' },
    { name: 'Hot Towel Shave', price: 35, time: '35 min', text: 'Lather, straight razor, two hot towels, cold finish.' },
    { name: 'Kids Cut', price: 22, time: '25 min', text: 'Twelve and under.' },
  ],
  gallery: [
    'photo-1599351431202-1e0f0137899a',
    'photo-1657105052497-f996284ffff8',
    'photo-1599011176306-4a96f1516d4d',
    'photo-1621605815971-fbc98d665033',
    'photo-1647140655214-e4a2d914971f',
    'photo-1621645582931-d1d3e6564943',
  ],
  team: [
    { name: 'Marcus', role: 'Owner, Fades', img: 'photo-1599351431202-1e0f0137899a' },
    { name: 'Eli', role: 'Beards and Shaves', img: 'photo-1605497788044-5a32c7078486' },
    { name: 'Tony', role: 'Classic Cuts', img: 'photo-1593702275687-f8b402bf1fb5' },
  ],
};
