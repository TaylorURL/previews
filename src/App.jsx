import { useEffect, useState } from 'react';
import { loadBrand, recordView, resolveSlug } from './site.js';
import PreviewBar from './PreviewBar.jsx';
import Plumbing from './templates/Plumbing.jsx';
import Barber from './templates/Barber.jsx';
import RealEstate from './templates/RealEstate.jsx';

const TEMPLATES = { plumbing: Plumbing, barber: Barber, realestate: RealEstate };

export default function App() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const slug = resolveSlug();
    if (!slug) {
      setState({ status: 'missing' });
      return;
    }
    loadBrand(slug).then((brand) => {
      setState(brand ? { status: 'ready', brand } : { status: 'missing' });
      if (brand) {
        document.title = `${brand.name} | ${brand.town}, ${brand.state}`;
        recordView(brand);
      }
    });
  }, []);

  if (state.status === 'loading') return <div className="min-h-screen" aria-busy="true" />;
  if (state.status === 'missing') {
    return (
      <main className="mx-auto my-[20vh] max-w-md px-4 text-center font-sans">
        <h1 className="text-2xl font-semibold">Nothing Here Yet</h1>
        <p className="mt-2 text-neutral-600">This address does not have a site on it.</p>
        <a className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-3 text-white" href="https://www.taylorurl.com">
          Visit TaylorURL
        </a>
      </main>
    );
  }

  const { brand } = state;
  const Template = TEMPLATES[brand.template];
  return (
    <>
      {brand.preview && <PreviewBar b={brand} />}
      <Template b={brand} />
    </>
  );
}
