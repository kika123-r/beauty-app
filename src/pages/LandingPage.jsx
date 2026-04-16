import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg:     '#2D2D2D',
  card:   '#383838',
  dark:   '#222222',
  milk:   '#FFF4E1',
  muted:  '#C8B89A',
  faint:  '#7A6A52',
  accent: '#C8A882',
  border: 'rgba(255,244,225,0.1)',
};

const FEATURES = [
  { title: 'Online rezervácie', desc: 'Klienti si rezervujú termíny 24/7 cez váš unikátny odkaz.' },
  { title: 'Správa pracovníkov', desc: 'Priraďte každému pracovníkovi služby. Klient si vyberie koho chce.' },
  { title: 'Email notifikácie', desc: 'Automatické potvrdenia, pripomienky a last-minute ponuky.' },
  { title: 'Last-minute sloty', desc: 'Zaplňte voľné termíny. Čakajúci klienti dostanú upozornenie.' },
  { title: 'Analytika', desc: 'Prehľad tržieb, obsadenosti a výkonu salóna. Export CSV.' },
  { title: 'Hodnotenia', desc: 'Po každej návšteve klient hodnotí salón. Budujte reputáciu.' },
];

const PLANS = [
  { name: 'Free', price: '0', desc: 'Pre začínajúce salóny', bg: '#383838', features: ['50 rezervácií / mesiac', '3 služby', 'Salon portal', 'Marketplace'] },
  { name: 'Starter', price: '4.90', desc: 'Pre rastúce salóny', bg: '#3E3530', features: ['300 rezervácií / mesiac', '10 služieb', 'Email notifikácie', 'Export CSV'] },
  { name: 'Pro', price: '9.90', desc: 'Najpopulárnejší', bg: '#C8A882', highlight: true, features: ['Neobmedzené rezervácie', 'Analytika', 'Čakacia listina', 'Opakované rezervácie'] },
  { name: 'Business', price: '19.90', desc: 'Pre viac salónov', bg: '#1A1A1A', features: ['Všetko v Pro', 'Multi-salón', 'Prioritná podpora', 'Vlastná doména'] },
];

const HorizontalDeck = ({ navigate }) => {
  const [current, setCurrent] = useState(0);
  const startX = useRef(null);

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(PLANS.length - 1, c + 1));

  return (
    <div>
      <style>{`
        .plan-track { display: flex; transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
        .plan-card { flex-shrink: 0; width: 340px; margin-right: 20px; border-radius: 20px; padding: 44px 40px; cursor: pointer; transition: all 0.3s; }
        .plan-card:hover { transform: translateY(-4px); }
        @media(max-width:768px){ .plan-card { width: 280px; padding: 36px 28px; } }
      `}</style>

      {/* Track */}
      <div style={{ overflow: 'hidden', paddingBottom: '8px' }}>
        <div className="plan-track" style={{ transform: `translateX(calc(${-current * 360}px))` }}>
          {PLANS.map((plan, i) => {
            const isActive = i === current;
            const textColor = plan.highlight ? '#2D2D2D' : C.milk;
            const mutedColor = plan.highlight ? 'rgba(45,45,45,0.55)' : C.muted;

            return (
              <div key={plan.name} className="plan-card"
                onClick={() => setCurrent(i)}
                style={{ background: plan.bg, border: isActive ? `1px solid ${plan.highlight ? 'transparent' : 'rgba(200,168,130,0.5)'}` : `1px solid rgba(255,244,225,0.06)`, boxShadow: isActive ? '0 24px 64px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.2)', opacity: isActive ? 1 : 0.65 }}>

                {plan.highlight && (
                  <div style={{ display: 'inline-block', background: '#2D2D2D', color: C.accent, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', padding: '4px 14px', borderRadius: '999px', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'Raleway, sans-serif' }}>
                    Odporúčame
                  </div>
                )}

                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: mutedColor, marginBottom: '12px', fontFamily: 'Raleway, sans-serif' }}>{plan.name}</p>

                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: plan.price === '0' ? '48px' : '60px', color: textColor, fontWeight: 300, lineHeight: 1.0, marginBottom: '6px' }}>
                  {plan.price === '0' ? 'Zadarmo' : `${plan.price} €`}
                </div>
                {plan.price !== '0' && <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '0', fontFamily: 'Raleway, sans-serif' }}>/ mesiac</p>}

                <div style={{ height: '1px', background: plan.highlight ? 'rgba(45,45,45,0.15)' : 'rgba(255,244,225,0.08)', margin: '28px 0' }} />

                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', color: mutedColor, marginBottom: '20px' }}>{plan.desc}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '20px', height: '1px', background: plan.highlight ? 'rgba(45,45,45,0.3)' : C.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: mutedColor, fontFamily: 'Raleway, sans-serif', fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {isActive && (
                  <button onClick={e => { e.stopPropagation(); navigate('/beauty-admin-portal-2024'); }}
                    style={{ width: '100%', padding: '13px', background: plan.highlight ? '#2D2D2D' : C.accent, color: plan.highlight ? C.accent : '#2D2D2D', border: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 700, borderRadius: '6px' }}>
                    {plan.price === '0' ? 'Začať zadarmo' : `Vybrať ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '36px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prev} disabled={current === 0} style={{ width: '40px', height: '40px', border: `1px solid ${C.border}`, background: 'transparent', borderRadius: '50%', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '16px', color: current === 0 ? C.faint : C.milk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <button onClick={next} disabled={current === PLANS.length - 1} style={{ width: '40px', height: '40px', border: `1px solid ${C.border}`, background: 'transparent', borderRadius: '50%', cursor: current === PLANS.length - 1 ? 'not-allowed' : 'pointer', fontSize: '16px', color: current === PLANS.length - 1 ? C.faint : C.milk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PLANS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? '24px' : '6px', height: '6px', borderRadius: '999px', background: i === current ? C.accent : C.faint, border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: C.faint, fontFamily: 'Raleway, sans-serif', marginLeft: 'auto' }}>
          {current + 1} / {PLANS.length}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Raleway, sans-serif', color: C.milk }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        @media(max-width:768px) {
          .hero-title { font-size: 52px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: C.milk, fontWeight: 400, letterSpacing: '0.02em' }}>BeautyTime</span>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Funkcie</a>
            <a href="#pricing" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Ceny</a>
            <button onClick={() => navigate('/login')} style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 500 }}>Prihlásiť sa</button>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ fontSize: '11px', letterSpacing: '0.18em', background: C.accent, color: C.bg, border: 'none', padding: '10px 22px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 700, borderRadius: '4px' }}>Začať zadarmo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '110px 40px 90px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: `1px solid ${C.border}`, borderRadius: '999px', padding: '6px 20px', marginBottom: '44px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.accent }} />
          <span style={{ fontSize: '11px', letterSpacing: '0.22em', color: C.muted, textTransform: 'uppercase', fontWeight: 600 }}>Rezervačný systém pre salóny</span>
        </div>
        <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '88px', color: C.milk, fontWeight: 300, lineHeight: 1.0, marginBottom: '28px' }}>
          Váš salón.<br />Vaši klienti.<br /><span style={{ color: C.accent }}>Vaše podmienky.</span>
        </h1>
        <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.9, maxWidth: '520px', margin: '0 auto 44px', fontWeight: 400 }}>
          BeautyTime je moderný rezervačný systém pre beauty salóny. Spravujte rezervácie, klientov a služby — všetko na jednom mieste.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.accent, color: C.bg, border: 'none', padding: '16px 44px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 700, borderRadius: '4px' }}>Vyskúšať zadarmo</button>
          <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, padding: '16px 32px', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 500, borderRadius: '4px' }}>Zobraziť ceny</button>
        </div>
        <p style={{ fontSize: '12px', color: C.faint, marginTop: '16px', letterSpacing: '0.05em' }}>Žiadna kreditná karta · Zadarmo navždy pre Free plán</p>
      </section>

      <div style={{ height: '1px', background: C.border, maxWidth: '1200px', margin: '0 auto' }} />

      {/* Features */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.28em', color: C.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>Prečo BeautyTime</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: C.milk, fontWeight: 300 }}>Všetko čo váš salón potrebuje</h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.border }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: C.bg, padding: '44px 40px' }}>
              <div style={{ width: '24px', height: '1px', background: C.accent, marginBottom: '28px' }} />
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', color: C.milk, marginBottom: '14px', fontWeight: 400 }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.8, fontWeight: 400 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: C.border, maxWidth: '1200px', margin: '0 auto' }} />

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 40px' }}>
        <div style={{ marginBottom: '60px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.28em', color: C.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>Transparentné ceny</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: C.milk, fontWeight: 300, marginBottom: '8px' }}>Vyberte si plán</h2>
          <p style={{ fontSize: '14px', color: C.muted }}>Pretočte kartičky doľava alebo doprava</p>
        </div>
        <HorizontalDeck navigate={navigate} />
      </section>

      {/* CTA */}
      <section style={{ background: '#1A1A1A', padding: '90px 40px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: C.milk, fontWeight: 300, marginBottom: '16px' }}>Začnite dnes zadarmo</h2>
          <p style={{ fontSize: '15px', color: C.muted, marginBottom: '40px', lineHeight: 1.9, fontWeight: 400 }}>Žiadna kreditná karta. Nastavenie za 5 minút. Váš salón online okamžite.</p>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.accent, color: C.bg, border: 'none', padding: '16px 48px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 700, borderRadius: '4px' }}>
            Vytvoriť salón zadarmo
          </button>
        </div>
      </section>

      <footer style={{ background: '#1A1A1A', borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: C.faint, letterSpacing: '0.1em', fontFamily: 'Raleway, sans-serif' }}>© 2025 BeautyTime</p>
      </footer>
    </div>
  );
};

export default LandingPage;
