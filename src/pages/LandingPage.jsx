import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg:     '#FAF8F4',
  dark:   '#1C1C1A',
  darker: '#111110',
  text:   '#1C1C1A',
  muted:  'rgba(28,28,26,0.5)',
  faint:  'rgba(28,28,26,0.3)',
  accent: '#C8A882',
  tag:    '#EDEDEB',
  border: 'rgba(28,28,26,0.1)',
  white:  '#FFFFFF',
};

const SOLUTIONS = [
  {
    num: '01',
    title: 'Online rezervácie 24/7',
    desc: 'Klienti si rezervujú termíny kedykoľvek cez váš unikátny salon portal. Žiadne telefonáty, žiadne čakanie. Každý salón dostane vlastný odkaz s plne prispôsobenou stránkou.',
    side: 'left',
  },
  {
    num: '02',
    title: 'Správa pracovníkov a služieb',
    desc: 'Každý pracovník má vlastné priradené služby. Klient si pri rezervácii vyberie konkrétnu osobu — alebo nechá výber na vás. Fotky, bio, pozícia — všetko na jednom mieste.',
    side: 'right',
  },
  {
    num: '03',
    title: 'Email notifikácie',
    desc: 'Automatické potvrdenia rezervácií ihneď po zarezervovaní. Pripomienka deň pred termínom. Last-minute ponuky pre čakajúcich klientov. Všetko bez vašej intervencie.',
    side: 'left',
  },
  {
    num: '04',
    title: 'Analytika a prehľady',
    desc: 'Sledujte tržby, obsadenosť termínov a výkon jednotlivých pracovníkov. Export dát do CSV. Hodnotenia klientov po každej návšteve budujú reputáciu vášho salóna online.',
    side: 'right',
  },
];

const PLANS = [
  {
    name: 'Free',
    tag: 'Začiatky',
    price: '0',
    desc: 'Pre salóny ktoré práve začínajú. Plná funkcionalita bez poplatku.',
    features: ['50 rezervácií / mesiac', '3 služby', 'Salon portal', 'Marketplace listing'],
    cta: 'Začať zadarmo',
    bg: '#1C1C1A',
  },
  {
    name: 'Starter',
    tag: 'Rast',
    price: '4.90',
    desc: 'Pre salóny ktoré rastú a potrebujú viac kapacity a email komunikáciu.',
    features: ['300 rezervácií / mesiac', '10 služieb', 'Email notifikácie', 'Export CSV', 'Hodnotenia klientov'],
    cta: 'Vybrať Starter',
    bg: '#2A2420',
  },
  {
    name: 'Pro',
    tag: 'Najpopulárnejší',
    price: '9.90',
    highlight: true,
    desc: 'Kompletný systém bez obmedzení. Všetky funkcie pre profesionálny salón.',
    features: ['Neobmedzené rezervácie', 'Neobmedzené služby', 'Pokročilá analytika', 'Čakacia listina', 'Opakované rezervácie', 'Last-minute notifikácie'],
    cta: 'Vybrať Pro',
    bg: '#111110',
  },
  {
    name: 'Business',
    tag: 'Sieť salónov',
    price: '19.90',
    desc: 'Pre majiteľov viacerých salónov s centrálnou správou a prioritnou podporou.',
    features: ['Všetko v Pro', 'Multi-salón správa', 'Prioritná podpora', 'Vlastná doména', 'API prístup'],
    cta: 'Vybrať Business',
    bg: '#1C1C1A',
  },
];

const SolutionRow = ({ sol, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isRight = sol.side === 'right';

  return (
    <div ref={ref} style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0',
      borderTop: `1px solid ${C.border}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 0.7s ease',
      transitionDelay: `${index * 0.1}s`,
    }}>
      {isRight && (
        <div style={{ background: C.dark, padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '120px', color: 'rgba(255,255,255,0.06)', fontWeight: 300, lineHeight: 1, userSelect: 'none' }}>{sol.num}</div>
        </div>
      )}
      <div style={{ padding: '64px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: isRight ? C.bg : C.bg }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: C.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px', fontFamily: 'Julius Sans One, sans-serif' }}>{sol.num}</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: C.dark, fontWeight: 400, marginBottom: '20px', lineHeight: 1.2 }}>{sol.title}</h3>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.8, fontFamily: 'Julius Sans One, sans-serif', fontWeight: 400, maxWidth: '420px' }}>{sol.desc}</p>
      </div>
      {!isRight && (
        <div style={{ background: C.dark, padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '120px', color: 'rgba(255,255,255,0.06)', fontWeight: 300, lineHeight: 1, userSelect: 'none' }}>{sol.num}</div>
        </div>
      )}
    </div>
  );
};

const PlanCard = ({ plan, index, navigate }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: plan.bg,
        borderRadius: '16px',
        padding: '40px 36px',
        cursor: 'pointer',
        border: plan.highlight ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0)'
          : 'scale(0.9)',
        transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
        transitionDelay: visible ? '0s' : `${index * 0.1}s`,
        boxShadow: hovered ? '0 32px 64px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.2)',
      }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div style={{ display: 'inline-block', background: plan.highlight ? C.accent : 'rgba(255,255,255,0.1)', color: plan.highlight ? C.dark : 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', fontFamily: 'Julius Sans One, sans-serif' }}>
          {plan.tag}
        </div>
        <div style={{ fontFamily: 'Julius Sans One, sans-serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{plan.name}</div>
      </div>

      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: plan.price === '0' ? '52px' : '64px', color: '#FFF4E1', fontWeight: 300, lineHeight: 1, marginBottom: '8px' }}>
        {plan.price === '0' ? 'Zadarmo' : `${plan.price} €`}
      </div>
      {plan.price !== '0' && <p style={{ fontSize: '13px', color: 'rgba(255,244,225,0.4)', marginBottom: '0', fontFamily: 'Julius Sans One, sans-serif' }}>/ mesiac</p>}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />

      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', color: 'rgba(255,244,225,0.55)', marginBottom: '24px', lineHeight: 1.5 }}>{plan.desc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {plan.features.map((f, j) => (
          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '18px', height: '1px', background: plan.highlight ? C.accent : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,244,225,0.65)', fontFamily: 'Julius Sans One, sans-serif', fontWeight: 400 }}>{f}</span>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/beauty-admin-portal-2024')}
        style={{ width: '100%', padding: '14px', background: plan.highlight ? C.accent : 'rgba(255,255,255,0.08)', color: plan.highlight ? C.dark : '#FFF4E1', border: 'none', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', fontWeight: 600, borderRadius: '8px', transition: 'all 0.2s' }}>
        {plan.cta}
      </button>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Julius Sans One, sans-serif', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Julius+Sans+One&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        @media(max-width:768px) {
          .hero-title { font-size: 48px !important; }
          .sol-grid { grid-template-columns: 1fr !important; }
          .sol-num-box { display: none !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: C.dark, fontWeight: 400, letterSpacing: '0.02em' }}>BeautyTime</span>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {['Funkcie', 'Ceny'].map(l => (
              <a key={l} href={`#${l === 'Funkcie' ? 'solutions' : 'pricing'}`} style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, textDecoration: 'none', textTransform: 'uppercase' }}>{l}</a>
            ))}
            <button onClick={() => navigate('/login')} style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.text, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase' }}>Prihlásiť sa</button>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ fontSize: '11px', letterSpacing: '0.18em', background: C.dark, color: '#FFF4E1', border: 'none', padding: '11px 24px', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase', borderRadius: '6px' }}>Začať zadarmo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 100px' }}>
        <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.tag, borderRadius: '8px', padding: '6px 16px', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Rezervačný systém pre salóny</span>
          </div>
          <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '96px', color: C.dark, fontWeight: 300, lineHeight: 1.0, marginBottom: '32px', maxWidth: '900px' }}>
            Váš salón.<br />Vaši klienti.<br /><span style={{ color: C.accent }}>Vaše podmienky.</span>
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.8, maxWidth: '480px' }}>
              BeautyTime je moderný rezervačný systém pre beauty salóny. Spravujte rezervácie, klientov a služby — všetko na jednom mieste.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.dark, color: '#FFF4E1', border: 'none', padding: '16px 40px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px' }}>Vyskúšať zadarmo</button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: C.text, border: `1px solid ${C.border}`, padding: '16px 28px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px' }}>Ceny →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px', display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { value: '24/7', label: 'Online rezervácie' },
            { value: '4 plány', label: 'Od zadarmo' },
            { value: '100%', label: 'Automatizované notifikácie' },
            { value: 'Multi', label: 'Salón systém' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: C.dark, fontWeight: 300, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <section id="solutions">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
              <div style={{ display: 'inline-flex', background: C.tag, borderRadius: '8px', padding: '5px 14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Funkcie</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: C.dark, fontWeight: 300 }}>Všetko čo váš<br />salón potrebuje</h2>
            </div>
            <p style={{ fontSize: '14px', color: C.muted, maxWidth: '300px', lineHeight: 1.8, textAlign: 'right' }}>Kompletný ekosystém pre moderný beauty salón — od rezervácií po analytiku.</p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '0' }}>
          {SOLUTIONS.map((sol, i) => (
            <div key={i} className="sol-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderTop: `1px solid ${C.border}`,
            }}>
              {sol.side === 'right' && (
                <div className="sol-num-box" style={{ background: '#F0EDE6', padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '140px', color: 'rgba(28,28,26,0.06)', fontWeight: 300, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em' }}>{sol.num}</div>
                </div>
              )}
              <div style={{ padding: '64px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: C.accent, textTransform: 'uppercase', marginBottom: '16px' }}>{sol.num}</p>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', color: C.dark, fontWeight: 400, marginBottom: '20px', lineHeight: 1.15 }}>{sol.title}</h3>
                <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.9, maxWidth: '400px' }}>{sol.desc}</p>
              </div>
              {sol.side === 'left' && (
                <div className="sol-num-box" style={{ background: '#F0EDE6', padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '140px', color: 'rgba(28,28,26,0.06)', fontWeight: 300, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em' }}>{sol.num}</div>
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}` }} />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', background: C.tag, borderRadius: '8px', padding: '5px 14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Cenové plány</span>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: C.dark, fontWeight: 300 }}>Vyberte si plán</h2>
          </div>
          <p style={{ fontSize: '14px', color: C.muted, maxWidth: '280px', lineHeight: 1.8, textAlign: 'right' }}>Začnite zadarmo. Upgradujte keď váš salón rastie.</p>
        </div>
        <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {PLANS.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} navigate={navigate} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: C.faint, marginTop: '24px', textAlign: 'center', letterSpacing: '0.08em' }}>Apple Pay · Google Pay · Karta · Žiadna kreditná karta pre Free plán</p>
      </section>

      {/* CTA */}
      <section style={{ background: C.dark, padding: '100px 40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '5px 14px', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,244,225,0.4)', textTransform: 'uppercase' }}>Začnite dnes</span>
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '72px', color: '#FFF4E1', fontWeight: 300, marginBottom: '24px', lineHeight: 1.05 }}>Váš salón online za 5 minút</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <p style={{ fontSize: '16px', color: 'rgba(255,244,225,0.45)', lineHeight: 1.8, maxWidth: '440px' }}>Žiadna kreditná karta. Nastavenie za 5 minút. Váš salón online okamžite.</p>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.accent, color: C.dark, border: 'none', padding: '16px 48px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px', flexShrink: 0 }}>
              Vytvoriť salón zadarmo
            </button>
          </div>
        </div>
      </section>

      <footer style={{ background: C.darker, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'rgba(255,244,225,0.3)' }}>BeautyTime</span>
        <p style={{ fontSize: '11px', color: 'rgba(255,244,225,0.2)', letterSpacing: '0.1em' }}>© 2025 BeautyTime · Rezervačný systém pre salóny</p>
      </footer>
    </div>
  );
};

export default LandingPage;
