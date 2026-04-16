import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg:     '#FAF8F4',
  dark:   '#1C1C1A',
  darker: '#111110',
  text:   '#1C1C1A',
  muted:  'rgba(28,28,26,0.5)',
  faint:  'rgba(28,28,26,0.25)',
  accent: '#C8A882',
  tag:    '#EDEDEB',
  border: 'rgba(28,28,26,0.1)',
};

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const SOLUTIONS = [
  { num: '01', title: 'Online rezervácie 24/7', desc: 'Klienti si rezervujú termíny kedykoľvek cez váš unikátny salon portal. Žiadne telefonáty, žiadne čakanie. Každý salón dostane vlastný odkaz s plne prispôsobenou stránkou.' },
  { num: '02', title: 'Správa pracovníkov a služieb', desc: 'Každý pracovník má vlastné priradené služby. Klient si pri rezervácii vyberie konkrétnu osobu — alebo nechá výber na vás. Fotky, bio, pozícia — všetko na jednom mieste.' },
  { num: '03', title: 'Email notifikácie', desc: 'Automatické potvrdenia rezervácií ihneď po zarezervovaní. Pripomienka deň pred termínom. Last-minute ponuky pre čakajúcich klientov. Všetko bez vašej intervencie.' },
  { num: '04', title: 'Analytika a prehľady', desc: 'Sledujte tržby, obsadenosť termínov a výkon jednotlivých pracovníkov. Export dát do CSV. Hodnotenia klientov po každej návšteve budujú reputáciu vášho salóna online.' },
];

const PLANS = [
  { name: 'Free', tag: 'Začiatky', price: '0', desc: 'Pre salóny ktoré práve začínajú. Plná funkcionalita bez poplatku navždy.', features: ['50 rezervácií / mesiac', '3 služby', 'Salon portal', 'Marketplace listing'], cta: 'Začať zadarmo', bg: '#1C1C1A' },
  { name: 'Starter', tag: 'Rast', price: '4.90', desc: 'Pre salóny ktoré rastú a potrebujú viac kapacity a emailovú komunikáciu.', features: ['300 rezervácií / mesiac', '10 služieb', 'Email notifikácie', 'Export CSV', 'Hodnotenia klientov'], cta: 'Vybrať Starter', bg: '#242220' },
  { name: 'Pro', tag: 'Najpopulárnejší', price: '9.90', highlight: true, desc: 'Kompletný systém bez obmedzení. Všetky funkcie pre profesionálny salón.', features: ['Neobmedzené rezervácie', 'Neobmedzené služby', 'Pokročilá analytika', 'Čakacia listina', 'Opakované rezervácie', 'Last-minute notifikácie'], cta: 'Vybrať Pro', bg: '#111110' },
  { name: 'Business', tag: 'Sieť salónov', price: '19.90', desc: 'Pre majiteľov viacerých salónov s centrálnou správou a prioritnou podporou.', features: ['Všetko v Pro', 'Multi-salón správa', 'Prioritná podpora', 'Vlastná doména', 'API prístup'], cta: 'Vybrať Business', bg: '#1A1816' },
];

const FeatureCard = ({ sol, index }) => {
  const [ref, visible] = useInView(0.15);
  const [hovered, setHovered] = useState(false);
  const fromLeft = index % 2 === 0;

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '48px 44px',
        border: '1px solid rgba(28,28,26,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? 'translateY(-8px) scale(1.01) perspective(1000px) rotateX(1deg)'
            : 'translateX(0) translateY(0)'
          : `translateX(${fromLeft ? '-100px' : '100px'})`,
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        transitionDelay: visible ? '0s' : `${index * 0.12}s`,
        boxShadow: hovered
          ? '0 32px 80px rgba(28,28,26,0.12), 0 8px 24px rgba(28,28,26,0.08)'
          : '0 4px 24px rgba(28,28,26,0.06)',
        cursor: 'default',
      }}>
      <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#C8A882', textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'Julius Sans One, sans-serif' }}>{sol.num}</p>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: '#1C1C1A', fontWeight: 400, marginBottom: '16px', lineHeight: 1.2 }}>{sol.title}</h3>
      <div style={{ width: '32px', height: '1px', background: '#C8A882', marginBottom: '20px' }} />
      <p style={{ fontSize: '14px', color: 'rgba(28,28,26,0.55)', lineHeight: 1.9, fontFamily: 'Julius Sans One, sans-serif' }}>{sol.desc}</p>
    </div>
  );
};

const SolutionRow = ({ sol, index }) => {
  const [ref, visible] = useInView(0.2);
  const fromLeft = index % 2 === 0;
  return (
    <div ref={ref} style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderTop: `1px solid ${C.border}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : `translateX(${fromLeft ? '-80px' : '80px'})`,
      transition: 'opacity 0.8s ease, transform 0.8s ease',
      transitionDelay: '0.1s',
    }}>
      {!fromLeft && (
        <div style={{ background: '#F0EDE6', padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '160px', color: 'rgba(28,28,26,0.05)', fontWeight: 300, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em' }}>{sol.num}</div>
        </div>
      )}
      <div style={{ padding: '72px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: C.accent, textTransform: 'uppercase', marginBottom: '18px', fontFamily: 'Julius Sans One, sans-serif' }}>{sol.num}</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', color: C.dark, fontWeight: 400, marginBottom: '20px', lineHeight: 1.15 }}>{sol.title}</h3>
        <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.9, maxWidth: '400px', fontFamily: 'Julius Sans One, sans-serif' }}>{sol.desc}</p>
      </div>
      {fromLeft && (
        <div style={{ background: '#F0EDE6', padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '160px', color: 'rgba(28,28,26,0.05)', fontWeight: 300, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em' }}>{sol.num}</div>
        </div>
      )}
    </div>
  );
};

const PlanCard = ({ plan, index, navigate }) => {
  const [ref, visible] = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: plan.bg,
        borderRadius: '20px',
        padding: '52px 48px',
        cursor: 'pointer',
        border: plan.highlight ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.06)',
        width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)'
          : 'translateY(80px) scale(0.97)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        transitionDelay: visible ? '0s' : `${index * 0.12}s`,
        boxShadow: hovered ? '0 40px 80px rgba(0,0,0,0.35)' : '0 8px 32px rgba(0,0,0,0.2)',
      }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div style={{ background: plan.highlight ? C.accent : 'rgba(255,255,255,0.08)', color: plan.highlight ? C.dark : 'rgba(255,244,225,0.5)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', padding: '5px 14px', borderRadius: '999px', textTransform: 'uppercase', fontFamily: 'Julius Sans One, sans-serif' }}>
          {plan.tag}
        </div>
        <span style={{ fontFamily: 'Julius Sans One, sans-serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,244,225,0.25)' }}>{plan.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: plan.price === '0' ? '80px' : '96px', color: '#FFF4E1', fontWeight: 300, lineHeight: 1 }}>
          {plan.price === '0' ? 'Zadarmo' : plan.price}
        </div>
        {plan.price !== '0' && <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: 'rgba(255,244,225,0.6)', marginBottom: '12px' }}>€</span>}
      </div>
      {plan.price !== '0' && <p style={{ fontSize: '13px', color: 'rgba(255,244,225,0.3)', marginBottom: '0', fontFamily: 'Julius Sans One, sans-serif', letterSpacing: '0.1em' }}>/ mesiac</p>}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '32px 0' }} />

      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontStyle: 'italic', color: 'rgba(255,244,225,0.45)', marginBottom: '28px', lineHeight: 1.6 }}>{plan.desc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {plan.features.map((f, j) => (
          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '20px', height: '1px', background: plan.highlight ? C.accent : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: 'rgba(255,244,225,0.6)', fontFamily: 'Julius Sans One, sans-serif' }}>{f}</span>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/beauty-admin-portal-2024')}
        style={{ width: '100%', padding: '16px', background: plan.highlight ? C.accent : 'rgba(255,255,255,0.07)', color: plan.highlight ? C.dark : '#FFF4E1', border: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '10px', transition: 'all 0.2s' }}>
        {plan.cta}
      </button>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Julius Sans One, sans-serif', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Julius+Sans+One&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        @media(max-width:900px) {
          .sol-row { grid-template-columns: 1fr !important; }
          .sol-num { display: none !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .hero-title { font-size: 52px !important; }
          .hero-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(250,248,244,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: C.dark, fontWeight: 400 }}>BeautyTime</span>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#solutions" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, textDecoration: 'none', textTransform: 'uppercase' }}>Funkcie</a>
            <a href="#pricing" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, textDecoration: 'none', textTransform: 'uppercase' }}>Ceny</a>
            <button onClick={() => navigate('/login')} style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.text, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase' }}>Prihlásiť sa</button>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ fontSize: '11px', letterSpacing: '0.18em', background: C.dark, color: '#FFF4E1', border: 'none', padding: '11px 24px', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase', borderRadius: '6px' }}>Začať zadarmo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 100px' }}>
        <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.9s ease' }}>
          <div style={{ display: 'inline-flex', background: C.tag, borderRadius: '8px', padding: '6px 16px', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Rezervačný systém pre salóny</span>
          </div>
          <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '100px', color: C.dark, fontWeight: 300, lineHeight: 1.0, marginBottom: '40px', maxWidth: '900px' }}>
            Váš salón.<br />Vaši klienti.<br /><span style={{ color: C.accent }}>Vaše podmienky.</span>
          </h1>
          <div className="hero-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.8, maxWidth: '500px' }}>
              Moderný rezervačný systém navrhnutý pre beauty salóny. Rezervácie, klienti, analytika — všetko na jednom mieste.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.dark, color: '#FFF4E1', border: 'none', padding: '16px 40px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px' }}>Vyskúšať zadarmo</button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: C.text, border: `1px solid ${C.border}`, padding: '16px 28px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px' }}>Ceny →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 40px', display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
          {[{ value: '24/7', label: 'Online rezervácie' }, { value: '4 plány', label: 'Od zadarmo' }, { value: '100%', label: 'Automatizované' }, { value: 'Multi', label: 'Salón systém' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: C.dark, fontWeight: 300, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <section id="solutions">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', background: C.tag, borderRadius: '8px', padding: '5px 14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Funkcie</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', color: C.dark, fontWeight: 300 }}>Všetko čo váš<br />salón potrebuje</h2>
            </div>
            <p style={{ fontSize: '14px', color: C.muted, maxWidth: '300px', lineHeight: 1.8, textAlign: 'right' }}>Kompletný ekosystém pre moderný beauty salón — od rezervácií po analytiku.</p>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', paddingBottom: '20px' }}>
          {SOLUTIONS.map((sol, i) => <FeatureCard key={i} sol={sol} index={i} />)}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', background: C.tag, borderRadius: '8px', padding: '5px 14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' }}>Cenové plány</span>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', color: C.dark, fontWeight: 300 }}>Vyberte si plán</h2>
          </div>
          <p style={{ fontSize: '14px', color: C.muted, maxWidth: '280px', lineHeight: 1.8, textAlign: 'right' }}>Začnite zadarmo. Upgradujte keď váš salón rastie.</p>
        </div>
        <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {PLANS.map((plan, i) => <PlanCard key={i} plan={plan} index={i} navigate={navigate} />)}
        </div>
        <p style={{ fontSize: '12px', color: C.faint, marginTop: '24px', textAlign: 'center', letterSpacing: '0.1em' }}>Apple Pay · Google Pay · Karta · Free plán nevyžaduje platobnú kartu</p>
      </section>

      {/* CTA */}
      <section style={{ background: C.dark, padding: '100px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 14px', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,244,225,0.35)', textTransform: 'uppercase' }}>Začnite dnes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '40px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '72px', color: '#FFF4E1', fontWeight: 300, lineHeight: 1.05, maxWidth: '700px' }}>Váš salón online za 5 minút</h2>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.accent, color: C.dark, border: 'none', padding: '18px 48px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', borderRadius: '6px', flexShrink: 0 }}>
              Vytvoriť salón zadarmo
            </button>
          </div>
        </div>
      </section>

      <footer style={{ background: C.darker, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: 'rgba(255,244,225,0.25)' }}>BeautyTime</span>
        <p style={{ fontSize: '11px', color: 'rgba(255,244,225,0.18)', letterSpacing: '0.1em' }}>© 2025 BeautyTime</p>
      </footer>
    </div>
  );
};

export default LandingPage;
