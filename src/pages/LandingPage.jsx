import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    desc: 'Pre začiatok',
    color: '#7691AD',
    features: ['50 rezervácií / mesiac', '3 služby', 'Online rezervácie', 'Marketplace', 'Last-minute sloty'],
    cta: 'Začať zadarmo',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 4.90,
    desc: 'Pre začínajúci salón',
    color: '#6DB88A',
    features: ['300 rezervácií / mesiac', '10 služieb', 'Emailové notifikácie', 'Hodnotenia klientov', 'Export dát', 'Marketplace'],
    cta: 'Vybrať Starter',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.90,
    desc: 'Najpopulárnejší',
    color: '#FF929A',
    features: ['Neobmedzené rezervácie', 'Neobmedzené služby', 'Pokročilá analytika', 'AI odporúčania', 'Opakované rezervácie', 'Čakacia listina', 'Export dát'],
    cta: 'Vybrať Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 19.90,
    desc: 'Pre väčšie tímy',
    color: '#E8F0F8',
    features: ['Všetko z Pro', 'Multi-salón správa', 'Prioritná podpora', 'Vlastná doména', 'API prístup', 'Pokročilé reporty'],
    cta: 'Vybrať Business',
    popular: false,
  },
];

const FAQS = [
  { q: 'Môžem kedykoľvek zrušiť predplatné?', a: 'Áno, predplatné môžete zrušiť kedykoľvek bez poplatkov. Prístup zostane aktívny do konca zaplateného obdobia.' },
  { q: 'Ako prebieha platba?', a: 'Platba prebieha bezpečne cez Stripe. Akceptujeme karty, Apple Pay a Google Pay. Platíte mesačne, žiadne dlhodobé záväzky.' },
  { q: 'Čo sa stane po uplynutí Free plánu?', a: 'Free plán je navždy bezplatný. Obmedzenia sa vzťahujú len na počet rezervácií a služieb.' },
  { q: 'Potrebujem technické znalosti?', a: 'Vôbec nie. BeautyTime je navrhnutý tak, aby bol intuitívny a jednoduchý na používanie pre každého.' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handlePlan = async (plan) => {
    if (plan.id === 'free') {
      navigate('/beauty-admin-portal-2024');
      return;
    }
    setLoading(plan.id);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, salonId: 'new', email: '' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Chyba pri platbe. Skúste znova.');
      }
    } catch {
      toast.error('Chyba pri platbe. Skúste znova.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1F36', fontFamily: 'Jost, sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(245,240,234,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E2DE', position: 'sticky', top: 0, zIndex: 100, padding: '0 40px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#E8F0F8', fontWeight: 400 }}>BeautyTime</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#FF929A', fontSize: '13px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500, letterSpacing: '0.05em' }}>
            Prihlásiť sa
          </button>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: '#E8F0F8', color: '#0A1F36', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
            Začať zadarmo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(106,93,82,0.1)', borderRadius: '20px', padding: '6px 16px', marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#FF929A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Rezervačný systém pre salóny</span>
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: '#E8F0F8', fontWeight: 400, lineHeight: 1.15, marginBottom: '24px' }}>
          Váš salón.<br />Vaši klienti.<br />
          <span style={{ color: '#FF929A' }}>Vaše podmienky.</span>
        </h1>
        <p style={{ fontSize: '17px', color: '#7691AD', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px', fontWeight: 300 }}>
          BeautyTime je moderný rezervačný systém navrhnutý pre beauty salóny. Spravujte rezervácie, klientov a služby — všetko na jednom mieste.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: '#E8F0F8', color: '#0A1F36', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
            Vyskúšať zadarmo
          </button>
          <a href="#pricing" style={{ background: 'transparent', color: '#FF929A', border: '1px solid #D4C5B0', borderRadius: '12px', padding: '16px 32px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', textDecoration: 'none', display: 'inline-block' }}>
            Zobraziť ceny
          </a>
        </div>
        <p style={{ fontSize: '12px', color: '#53728A', marginTop: '20px' }}>Žiadna kreditná karta · Zadarmo navždy pre Free plán</p>
      </section>

      {/* Features */}
      <section style={{ background: '#142F52', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '12px' }}>Prečo BeautyTime</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#E8F0F8', textAlign: 'center', marginBottom: '56px', fontWeight: 400 }}>Všetko čo váš salón potrebuje</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { icon: '📅', title: 'Online rezervácie', desc: 'Klienti si rezervujú termíny online 24/7. Žiadne telefonáty, žiadne omyly.' },
              { icon: '📊', title: 'Analytika a prehľady', desc: 'Sledujte tržby, no-show klientov a vyťaženosť salóna v reálnom čase.' },
              { icon: '⚡', title: 'Last-minute sloty', desc: 'Zaplňte voľné termíny automaticky. Systém upozorní záujemcov.' },
              { icon: '⭐', title: 'Hodnotenia klientov', desc: 'Zbierajte recenzie po každej návšteve a budujte reputáciu salóna.' },
              { icon: '🔔', title: 'Automatické notifikácie', desc: 'Emailové pripomienky pre klientov znižujú počet no-show o 60%.' },
              { icon: '🛍️', title: 'Marketplace', desc: 'Váš salón sa zobrazuje v BeautyTime marketplace. Noví klienti zadarmo.' },
            ].map((f) => (
              <div key={f.title} style={{ background: '#0A1F36', border: '1px solid #F0EDE8', borderRadius: '20px', padding: '28px' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#E8F0F8', marginBottom: '8px', fontFamily: 'Jost, sans-serif' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#7691AD', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '12px' }}>Cenové plány</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#E8F0F8', textAlign: 'center', marginBottom: '12px', fontWeight: 400 }}>Transparentné ceny</h2>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#7691AD', marginBottom: '56px' }}>Bez skrytých poplatkov. Zrušíte kedykoľvek.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{ background: plan.popular ? '#E8F0F8' : '#142F52', border: `1.5px solid ${plan.popular ? '#E8F0F8' : 'rgba(185,207,221,0.12)'}`, borderRadius: '24px', padding: '32px 24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#B9CFDD', color: '#E8F0F8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Najpopulárnejší
                  </div>
                )}
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: plan.popular ? '#B9CFDD' : '#7691AD', marginBottom: '12px' }}>{plan.name}</p>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', color: plan.popular ? '#0A1F36' : '#E8F0F8', fontWeight: 400 }}>
                    {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: '13px', color: plan.popular ? '#53728A' : '#7691AD' }}> € / mes</span>}
                  {plan.price === 0 && <span style={{ fontSize: '13px', color: '#7691AD' }}> €</span>}
                </div>
                <p style={{ fontSize: '12px', color: plan.popular ? '#53728A' : '#7691AD', marginBottom: '24px' }}>{plan.desc}</p>
                <div style={{ flex: 1, marginBottom: '28px' }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: plan.popular ? '#B9CFDD' : '#FF929A', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <span style={{ fontSize: '13px', color: plan.popular ? '#B9CFDD' : '#FF929A', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handlePlan(plan)}
                  disabled={loading === plan.id}
                  style={{ width: '100%', padding: '14px', background: plan.popular ? '#B9CFDD' : '#E8F0F8', color: plan.popular ? '#E8F0F8' : '#0A1F36', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif', transition: 'opacity 0.2s', opacity: loading === plan.id ? 0.6 : 1 }}
                >
                  {loading === plan.id ? 'Presmerovávam...' : plan.cta}
                </button>
                {plan.id !== 'free' && (
                  <p style={{ fontSize: '11px', color: plan.popular ? '#FF929A' : '#53728A', textAlign: 'center', marginTop: '10px' }}>
                    Apple Pay · Google Pay · Karta
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#142F52', padding: '80px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '12px' }}>FAQ</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#E8F0F8', textAlign: 'center', marginBottom: '48px', fontWeight: 400 }}>Časté otázky</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: '#0A1F36', border: '1px solid #F0EDE8', borderRadius: '16px', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontFamily: 'Jost, sans-serif' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#E8F0F8' }}>{faq.q}</span>
                  <span style={{ color: '#FF929A', fontSize: '18px', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ fontSize: '13px', color: '#7691AD', lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', color: '#E8F0F8', marginBottom: '20px', fontWeight: 400 }}>
            Pripravení začať?
          </h2>
          <p style={{ fontSize: '15px', color: '#7691AD', marginBottom: '36px', lineHeight: 1.6 }}>
            Zaregistrujte svoj salón za 2 minúty. Free plán navždy zadarmo.
          </p>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: '#E8F0F8', color: '#0A1F36', border: 'none', borderRadius: '14px', padding: '18px 40px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
            Začať zadarmo →
          </button>
          <p style={{ fontSize: '12px', color: '#53728A', marginTop: '16px' }}>Žiadna kreditná karta · Zrušíte kedykoľvek</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E2E2DE', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#E8F0F8' }}>BeautyTime</span>
        <p style={{ fontSize: '12px', color: '#53728A' }}>© 2025 BeautyTime. Všetky práva vyhradené.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#7691AD', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Prihlásenie</button>
          <button onClick={() => navigate('/beauty-admin-portal-2024')} style={{ background: 'none', border: 'none', color: '#7691AD', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Registrácia</button>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
