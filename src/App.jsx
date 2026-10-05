import { useEffect, useState } from 'react';
import { INDUSTRIES, fetchBusiness, loadFonts, mergeBusiness, resolveIndustry, resolveSlug } from './site.js';
import PreviewBar from './PreviewBar.jsx';
import Plumbing from './templates/Plumbing.jsx';
import Barber from './templates/Barber.jsx';
import RealEstate from './templates/RealEstate.jsx';

const TEMPLATES = { plumbing: Plumbing, barber: Barber, realestate: RealEstate };

export default function App() {
  const industry = resolveIndustry();
  const slug = resolveSlug();
  const config = INDUSTRIES[industry];
  const [state, setState] = useState(slug ? { status: 'loading' } : { status: 'ready', real: null });

  useEffect(() => {
    loadFonts(config.fonts);
    document.documentElement.dataset.industry = industry;
  }, [config, industry]);

  useEffect(() => {
    if (!slug) return;
    let live = true;
    fetchBusiness(industry, slug)
      .then((real) => live && setState({ status: real ? 'ready' : 'missing', real }))
      .catch(() => live && setState({ status: 'missing', real: null }));
    return () => {
      live = false;
    };
  }, [industry, slug]);

  const business = mergeBusiness(config.sample, state.real);

  useEffect(() => {
    if (state.status === 'ready') document.title = `${business.name} | ${config.titleSuffix(business)}`;
  }, [state.status, business, config]);

  if (state.status === 'loading') return <div className="boot" aria-busy="true" />;
  if (state.status === 'missing') {
    return (
      <main className="missing">
        <h1>This Preview Has Moved</h1>
        <p>The link may have expired. You can still see the template it was built from.</p>
        <a href="/">See the Template</a>
      </main>
    );
  }

  const Template = TEMPLATES[industry];
  return (
    <>
      {business.isPreview && <PreviewBar business={business} />}
      <Template b={business} c={config} />
    </>
  );
}
