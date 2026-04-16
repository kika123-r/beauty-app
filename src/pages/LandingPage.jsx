import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  milk:   '#FFF4E1',
  gray:   '#2D2D2D',
  mid:    '#5A5A5A',
  faint:  '#9A9A9A',
  light:  '#F5EDD8',
  border: 'rgba(45,45,45,0.1)',
  accent: '#C8A882',
};

const FEATURES = [
  { title: 'Online rezervácie', desc: 'Klienti si rezervujú termíny 24/7 cez váš unikátny odkaz. Žiadne telefonáty, žiadne čakanie.' },
  { title: 'Správa pracovníkov', desc: 'Priraďte každému pracovníkovi služby ktoré vykonáva. Klient si vyberie koho chce.' },
  { title: 'Email notifikácie', desc: 'Automatické potvrdenia rezervácií, pripomienky deň pred termínom a last-minute ponuky.' },
  { title: 'Last-minute sloty', desc: 'Zaplňte voľné termíny špeciálnymi ponukami. Čakajúci klienti dostanú upozornenie.' },
  { title: 'Analytika a prehľady', desc: 'Sledujte tržby, obsadenosť a výkon salóna. Export dát do CSV.' },
  { title: 'Hodnotenia klientov', desc: 'Po každej návšteve klient hodnotí váš salón. Budujte reputáciu online.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'Pre začínajúce salóny',
    features: ['50 rezervácií / mesiac', '3 služby', 'Salon portal', 'Marketplace listing'],
    cta: 'Začať zadarmo',
  },
  {
    name: 'Starter',
    price: '4.90',
    desc: 'Pre rastúce salóny',
    features: ['300 rezervácií / mesiac', '10 služieb', 'Email notifikácie', 'Export CSV', 'Hodnotenia klientov'],
    cta: 'Vybrať Starter',
  },
  {
    name: 'Pro',
    price: '9.90',
    desc: 'Najpopulárnejší plán',
    highlight: true,
    features: ['Neobmedzené rezervácie', 'Neobmedzené služby', 'Pokročilá analytika', 'Čakacia listina', 'Opakované rezervácie', 'Last-minute notifikácie'],
    cta: 'Vybrať Pro',
  },
  {
    name: 'Business',
    price: '19.90',
    desc: 'Pre viac salónov',
    features: ['Všetko v Pro', 'Multi-salón správa', 'Prioritná podpora', 'Vlastná doména'],
    cta: 'Vybrať Business',
  },
];

const PricingDeck = ({ plans, navigate }) => {
  const [current, setCurrent] = useState(0);
  const startY = useRef(null);

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(plans.length - 1, c + 1));

  const onTouchStart = e => { startY.current = e.touches[0].clientY; };
  const onTouchEnd = e => {
    if (startY.current === null) return;
    const diff = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    startY.current = null;
  };

  return (
    <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>

      {/* Deck */}
      <div style={{ position: 'relative', width: '340px', height: '480px', flexShrink: 0 }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <style>{`
          .deck-card { position: absolute; width: 100%; border-radius: 16px; padding: 40px 36px; transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.1); cursor: pointer; backface-visibility: hidden; }
        `}</style>

        {plans.map((plan, i) => {
          const offset = i - current;
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 2;
          if (!isVisible) return null;

          const scale = isActive ? 1 : 1 - Math.abs(offset) * 0.06;
          const translateY = offset * 24;
          const translateZ = -Math.abs(offset) * 40;
          const opacity = isActive ? 1 : 1 - Math.abs(offset) * 0.25;
          const zIndex = plans.length - Math.abs(offset);
          const bg = plan.highlight ? C.gray : C.milk;
          const textColor = plan.highlight ? C.milk : C.gray;
          const mutedColor = plan.highlight ? 'rgba(255,244,225,0.55)' : C.mid;

          return (
            <div key={plan.name} className="deck-card"
              style={{ background: bg, border: `1px solid ${plan.highlight ? 'transparent' : C.border}`, transform: `translateY(${translateY}px) scale(${scale})`, opacity, zIndex, boxShadow: isActive ? '0 20px 60px rgba(45,45,45,0.15)' : '0 4px 20px rgba(45,45,45,0.06)' }}
              onClick={() => { if (!isActive) setCurrent(i); }}>

              {plan.highlight && (
                <div style={{ display: 'inline-block', background: C.accent, color: C.gray, fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', padding: '4px 14px', borderRadius: '999px', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Odporúčame
                </div>
              )}

              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: mutedColor, marginBottom: '8px', fontFamily: 'Raleway, sans-serif' }}>{plan.name}</p>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: plan.price === '0' ? '42px' : '52px', color: textColor, fontWeight: 300, lineHeight: 1, marginBottom: '6px' }}>
                {plan.price === '0' ? 'Zadarmo' : `${plan.price} €`}
              </div>
              {plan.price !== '0' && <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '0', fontFamily: 'Raleway, sans-serif' }}>/ mesiac</p>}

              <div style={{ height: '1px', background: plan.highlight ? 'rgba(255,244,225,0.12)' : C.border, margin: '24px 0' }} />

              <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '16px', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px' }}>{plan.desc}</p>

              {isActive && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '1px', height: '14px', background: plan.highlight ? 'rgba(255,244,225,0.3)' : C.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: plan.highlight ? 'rgba(255,244,225,0.8)' : C.mid, fontFamily: 'Raleway, sans-serif', fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls + CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px', paddingTop: '40px' }}>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.faint, textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
            {current + 1} / {plans.length}
          </p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: C.gray, fontWeight: 300, marginBottom: '8px' }}>{plans[current].name}</h3>
          <p style={{ fontSize: '14px', color: C.mid, fontFamily: 'Raleway, sans-serif' }}>{plans[current].desc}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prev} disabled={current === 0} style={{ width: '44px', height: '44px', border: `1px solid ${C.border}`, background: 'transparent', borderRadius: '50%', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '18px', color: current === 0 ? C.faint : C.gray, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>↑</button>
          <button onClick={next} disabled={current === plans.length - 1} style={{ width: '44px', height: '44px', border: `1px solid ${C.border}`, background: 'transparent', borderRadius: '50%', cursor: current === plans.length - 1 ? 'not-allowed' : 'pointer', fontSize: '18px', color: current === plans.length - 1 ? C.faint : C.gray, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>↓</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {plans.map((p, i) => (
            <button key={p.name} onClick={() => setCurrent(i)} style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '20px', height: '1px', background: i === current ? C.gray : C.border, transition: 'all 0.2s' }} />
              <span style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: i === current ? C.gray : C.faint, fontFamily: 'Raleway, sans-serif', fontWeight: i === current ? 600 : 400, transition: 'all 0.2s' }}>{p.name}</span>
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.gray, color: C.milk, border: 'none', padding: '14px 32px', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '6px' }}>
          {plans[current].cta}
        </button>
        <p style={{ fontSize: '12px', color: C.faint, fontFamily: 'Raleway, sans-serif' }}>Apple Pay · Google Pay · Karta</p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: C.milk, fontFamily: 'Raleway, sans-serif', color: C.gray }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;1,300&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        @media(max-width:768px) {
          .hero-title { font-size: 52px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.milk, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: C.gray, fontWeight: 400, letterSpacing: '0.02em' }}>BeautyTime</span>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.mid, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Funkcie</a>
            <a href="#pricing" style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.mid, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Ceny</a>
            <button onClick={() => navigate('/login')} style={{ fontSize: '11px', letterSpacing: '0.18em', color: C.gray, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 500 }}>Prihlásiť sa</button>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ fontSize: '11px', letterSpacing: '0.18em', background: C.gray, color: C.milk, border: 'none', padding: '10px 22px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 600, borderRadius: '4px' }}>Začať zadarmo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '110px 40px 90px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: `1px solid ${C.border}`, borderRadius: '999px', padding: '6px 20px', marginBottom: '40px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.accent }} />
          <span style={{ fontSize: '11px', letterSpacing: '0.22em', color: C.mid, textTransform: 'uppercase', fontWeight: 600 }}>Rezervačný systém pre salóny</span>
        </div>
        <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '88px', color: C.gray, fontWeight: 300, lineHeight: 1.0, marginBottom: '28px' }}>
          Váš salón.<br />Vaši klienti.<br /><span style={{ color: C.accent }}>Vaše podmienky.</span>
        </h1>
        <p style={{ fontSize: '16px', color: C.mid, lineHeight: 1.9, maxWidth: '520px', margin: '0 auto 44px', fontWeight: 400 }}>
          BeautyTime je moderný rezervačný systém pre beauty salóny. Spravujte rezervácie, klientov a služby — všetko na jednom mieste.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.gray, color: C.milk, border: 'none', padding: '16px 44px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '4px' }}>Vyskúšať zadarmo</button>
          <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: C.gray, border: `1px solid ${C.border}`, padding: '16px 32px', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 500, borderRadius: '4px' }}>Zobraziť ceny</button>
        </div>
        <p style={{ fontSize: '12px', color: C.faint, marginTop: '16px', letterSpacing: '0.05em' }}>Žiadna kreditná karta · Zadarmo navždy pre Free plán</p>
      </section>

      <div style={{ height: '1px', background: C.border, maxWidth: '1100px', margin: '0 auto' }} />

      {/* Features */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '90px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.28em', color: C.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>Prečo BeautyTime</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: C.gray, fontWeight: 300 }}>Všetko čo váš salón potrebuje</h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.border }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: C.milk, padding: '40px 36px' }}>
              <div style={{ width: '24px', height: '1px', background: C.accent, marginBottom: '24px' }} />
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: C.gray, marginBottom: '12px', fontWeight: 400 }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: C.mid, lineHeight: 1.8, fontWeight: 400 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: C.border, maxWidth: '1100px', margin: '0 auto' }} />

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1100px', margin: '0 auto', padding: '90px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.28em', color: C.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>Transparentné ceny</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: C.gray, fontWeight: 300, marginBottom: '12px' }}>Vyberte si plán</h2>
          <p style={{ fontSize: '14px', color: C.mid }}>Pretočte kartičky nahor alebo nadol</p>
        </div>
        <PricingDeck plans={PLANS} navigate={navigate} />
      </section>

      {/* CTA */}
      <section style={{ background: C.gray, padding: '90px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: C.milk, fontWeight: 300, marginBottom: '16px' }}>Začnite dnes zadarmo</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,244,225,0.5)', marginBottom: '40px', lineHeight: 1.9, fontWeight: 400 }}>Žiadna kreditná karta. Nastavenie za 5 minút. Váš salón online okamžite.</p>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.milk, color: C.gray, border: 'none', padding: '16px 48px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '4px' }}>
            Vytvoriť salón zadarmo
          </button>
        </div>
      </section>

      <footer style={{ background: C.gray, borderTop: '1px solid rgba(255,244,225,0.06)', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,244,225,0.2)', letterSpacing: '0.1em', fontFamily: 'Raleway, sans-serif' }}>© 2025 BeautyTime</p>
      </footer>
    </div>
  );
};

export default LandingPage;
