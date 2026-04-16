import { useNavigate } from 'react-router-dom';

const C = {
  egg:    '#F0EDDC',
  stone:  '#8A7260',
  coffee: '#845F4A',
  pink:   '#DFA0AA',
  dark:   '#2A1A10',
  light:  '#E4E0CC',
  border: 'rgba(90,60,40,0.15)',
};

const FEATURES = [
  { icon: '📅', title: 'Online rezervácie', desc: 'Klienti si rezervujú termíny 24/7 cez váš unikátny odkaz.' },
  { icon: '👥', title: 'Správa klientov', desc: 'História, hodnotenia a reliability score každého klienta.' },
  { icon: '📊', title: 'Analytika', desc: 'Prehľad tržieb, obsadenosti a výkonu pracovníkov.' },
  { icon: '✉️', title: 'Email notifikácie', desc: 'Automatické potvrdenia, pripomienky a last-minute ponuky.' },
  { icon: '⚡', title: 'Last-minute sloty', desc: 'Zaplňte voľné termíny špeciálnymi ponukami pre čakajúcich.' },
  { icon: '🔄', title: 'Opakované rezervácie', desc: 'Klienti si nastavia automatické opakovanie návštev.' },
];

const TIERS = [
  { name: 'Free', price: '0', color: C.stone, features: ['50 rezervácií/mes', '3 služby', 'Salon portal', 'Marketplace'] },
  { name: 'Starter', price: '4.90', color: C.coffee, features: ['300 rezervácií/mes', '10 služieb', 'Email notifikácie', 'Export CSV'] },
  { name: 'Pro', price: '9.90', color: C.pink, highlight: true, features: ['Neobmedzené rezervácie', 'Neobmedzené služby', 'Analytika', 'Čakacia listina'] },
  { name: 'Business', price: '19.90', color: C.dark, features: ['Všetko v Pro', 'Multi-salón', 'Prioritná podpora', 'API prístup'] },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: C.egg, fontFamily: 'Raleway, sans-serif', color: C.dark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Raleway:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media(max-width:768px) {
          .landing-hero-title { font-size: 52px !important; }
          .landing-features { grid-template-columns: 1fr !important; }
          .landing-pricing { grid-template-columns: 1fr 1fr !important; }
          .landing-nav-links { display: none !important; }
        }
        @media(max-width:480px) {
          .landing-pricing { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.egg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: C.dark, fontWeight: 400 }}>BeautyTime</span>
          <div className="landing-nav-links" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: '12px', letterSpacing: '0.15em', color: C.stone, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Funkcie</a>
            <a href="#pricing" style={{ fontSize: '12px', letterSpacing: '0.15em', color: C.stone, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 }}>Ceny</a>
            <button onClick={() => navigate('/login')} style={{ fontSize: '12px', letterSpacing: '0.15em', color: C.coffee, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 500 }}>Prihlásiť sa</button>
            <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ fontSize: '12px', letterSpacing: '0.15em', background: C.dark, color: C.egg, border: 'none', padding: '10px 22px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase', fontWeight: 600, borderRadius: '6px' }}>Začať zadarmo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 32px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.light, border: `1px solid ${C.border}`, borderRadius: '999px', padding: '6px 18px', marginBottom: '36px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.coffee, textTransform: 'uppercase', fontWeight: 600 }}>Rezervačný systém pre salóny</span>
        </div>
        <h1 className="landing-hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '80px', color: C.dark, fontWeight: 300, lineHeight: 1.05, marginBottom: '24px' }}>
          Váš salón.<br />Vaši klienti.<br /><span style={{ color: C.pink }}>Vaše podmienky.</span>
        </h1>
        <p style={{ fontSize: '16px', color: C.stone, lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px', fontWeight: 400 }}>
          BeautyTime je moderný rezervačný systém navrhnutý pre beauty salóny. Spravujte rezervácie, klientov a služby — všetko na jednom mieste.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.dark, color: C.egg, border: 'none', padding: '16px 40px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '6px' }}>Vyskúšať zadarmo</button>
          <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: C.coffee, border: `1px solid ${C.border}`, padding: '16px 32px', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 500, borderRadius: '6px' }}>Zobraziť ceny</button>
        </div>
        <p style={{ fontSize: '12px', color: C.stone, marginTop: '16px' }}>Žiadna kreditná karta · Zadarmo navždy pre Free plán</p>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: C.border, maxWidth: '1100px', margin: '0 auto' }} />

      {/* Features */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Prečo BeautyTime</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '44px', color: C.dark, fontWeight: 300 }}>Všetko čo váš salón potrebuje</h2>
        </div>
        <div className="landing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.border }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: C.egg, padding: '36px 32px' }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: C.dark, marginBottom: '10px', fontWeight: 400 }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: C.stone, lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: C.light, padding: '80px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Transparentné ceny</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '44px', color: C.dark, fontWeight: 300 }}>Vyberte si plán</h2>
          </div>
          <div className="landing-pricing" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {TIERS.map((tier, i) => (
              <div key={i} style={{ background: tier.highlight ? C.coffee : '#FAFAF5', border: tier.highlight ? `2px solid ${C.coffee}` : `1px solid ${C.border}`, borderRadius: '16px', padding: '28px 24px', position: 'relative' }}>
                {tier.highlight && <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: C.pink, color: C.dark, fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', padding: '4px 16px', borderRadius: '999px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Odporúčame</div>}
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(240,237,220,0.6)' : C.stone, fontWeight: 600, marginBottom: '12px' }}>{tier.name}</p>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', color: tier.highlight ? C.egg : C.dark, marginBottom: '4px', fontWeight: 300 }}>
                  {tier.price === '0' ? 'Zadarmo' : `${tier.price} €`}
                </div>
                {tier.price !== '0' && <p style={{ fontSize: '12px', color: tier.highlight ? 'rgba(240,237,220,0.5)' : C.stone, marginBottom: '20px' }}>/ mesiac</p>}
                <div style={{ height: '1px', background: tier.highlight ? 'rgba(240,237,220,0.15)' : C.border, margin: '16px 0 20px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {tier.features.map((feat, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: tier.highlight ? C.pink : C.coffee, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: tier.highlight ? 'rgba(240,237,220,0.85)' : C.stone, fontWeight: 400 }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ width: '100%', padding: '12px', background: tier.highlight ? C.egg : 'transparent', color: tier.highlight ? C.coffee : C.coffee, border: tier.highlight ? 'none' : `1px solid ${C.border}`, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '8px' }}>
                  {tier.price === '0' ? 'Začať zadarmo' : `Vybrať ${tier.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.dark, padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: C.egg, fontWeight: 300, marginBottom: '16px' }}>Začnite dnes zadarmo</h2>
          <p style={{ fontSize: '15px', color: 'rgba(240,237,220,0.55)', marginBottom: '36px', lineHeight: 1.8, fontWeight: 400 }}>Žiadna kreditná karta. Nastavenie za 5 minút. Váš salón online okamžite.</p>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: C.pink, color: C.dark, border: 'none', padding: '16px 48px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600, borderRadius: '6px' }}>
            Vytvoriť salón zadarmo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.dark, borderTop: '1px solid rgba(240,237,220,0.06)', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'rgba(240,237,220,0.25)', letterSpacing: '0.1em' }}>© 2025 BeautyTime · Rezervačný systém pre salóny</p>
      </footer>
    </div>
  );
};

export default LandingPage;
