import { useEffect } from 'react';
import { recordView } from './site.js';
import PreviewBar from './PreviewBar.jsx';
import { TEMPLATES } from './templates.js';

export default function App({ brand, path = '' }) {
  useEffect(() => {
    if (!brand) return;
    document.title = `${brand.name} | ${brand.town}, ${brand.state}`;
    recordView(brand);
  }, [brand]);

  if (!brand) {
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

  const Template = TEMPLATES[brand.template]?.default;
  return (
    <>
      {brand.preview && <PreviewBar b={brand} />}
      <Template b={brand} path={path} />
    </>
  );
}
