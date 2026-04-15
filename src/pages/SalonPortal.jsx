import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonBySlug } from '../services/salonService';
import { getServices } from '../services/serviceService';
import { getSlots } from '../services/slotService';
import { getRatings } from '../services/ratingService';
import { SLOT_STATUS } from '../constants';

const C = {
  green:  '#6D6943',
  brown:  '#48372F',
  cream:  '#F4F3EE',
  pink:   '#C8A1B1',
  muted:  '#9B8E7E',
  border: '#E8E4DC',
  white:  '#142F52',
};

const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAYS_FULL = ['Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota','Nedeľa'];

const SalonPortal = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon]       = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [ratings, setRatings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { loadData(); }, [slug]);

  useEffect(() => {
    if (salon) {
      document.title = `${salon.name} — Rezervácie online`;
    }
    return () => { document.title = 'BeautyTime'; };
  }, [salon]);

  const loadData = async () => {
    try {
      const salonData = await getSalonBySlug(slug);
      if (!salonData) { setNotFound(true); setLoading(false); return; }
      setSalon(salonData);
      const [sv, sl, rt] = await Promise.all([
        getServices(salonData.id),
        getSlots(salonData.id),
        getRatings(salonData.id),
      ]);
      setServices(sv); setSlots(sl); setRatings(rt);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: `2px solid ${C.border}`, borderTopColor: C.green, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '13px', color: C.muted, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}>Načítavam...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: C.brown }}>Salón nenájdený</p>
      <p style={{ fontSize: '13px', color: C.muted, fontFamily: 'Jost, sans-serif' }}>Skontrolujte odkaz ktorý vám bol zaslaný.</p>
    </div>
  );

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayKey = DAY_KEYS[todayIdx];
  const todayHours = salon.openHours?.[todayKey];
  const isOpen = todayHours && !todayHours.closed;
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : null;
  const todayStr = new Date().toISOString().split('T')[0];
  const availableSlots = slots.filter(s => (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) && s.date >= todayStr);

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: 'Jost, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 768px) {
          .portal-hero { padding: 60px 20px 40px !important; }
          .portal-grid { grid-template-columns: 1fr !important; }
          .portal-hours-grid { grid-template-columns: 1fr !important; }
          .portal-nav-links { display: none !important; }
          .portal-menu-btn { display: flex !important; }
          .portal-mobile-menu { display: ${menuOpen ? 'flex' : 'none'} !important; }
          .portal-services-grid { grid-template-columns: 1fr !important; }
          .portal-slots-grid { grid-template-columns: 1fr !important; }
          .portal-cta-row { flex-direction: column !important; align-items: stretch !important; }
          .portal-hero-title { font-size: 2.8rem !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(244,243,238,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.brown, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: C.cream }}>{salon.name?.charAt(0)}</span>
            </div>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: C.brown }}>{salon.name}</span>
          </div>

          <div className="portal-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="#services" style={{ padding: '8px 16px', color: C.muted, fontSize: '13px', textDecoration: 'none', letterSpacing: '0.05em' }}>Služby</a>
            <a href="#hours" style={{ padding: '8px 16px', color: C.muted, fontSize: '13px', textDecoration: 'none', letterSpacing: '0.05em' }}>Hodiny</a>
            <a href="#contact" style={{ padding: '8px 16px', color: C.muted, fontSize: '13px', textDecoration: 'none', letterSpacing: '0.05em' }}>Kontakt</a>
            <button onClick={() => navigate(`/s/${slug}/login`)} style={{ padding: '9px 20px', background: 'transparent', color: C.brown, border: `1px solid ${C.brown}`, borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>Prihlásiť</button>
            <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '9px 20px', background: C.brown, color: C.cream, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>Rezervovať</button>
          </div>

          <button className="portal-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '22px', height: '2px', background: C.brown, borderRadius: '1px' }} />)}
          </button>
        </div>

        <div className="portal-mobile-menu" style={{ display: 'none', flexDirection: 'column', padding: '16px 24px', gap: '8px', borderTop: `1px solid ${C.border}`, background: C.cream }}>
          <a href="#services" onClick={() => setMenuOpen(false)} style={{ padding: '12px 0', color: C.brown, fontSize: '14px', textDecoration: 'none', borderBottom: `1px solid ${C.border}` }}>Služby</a>
          <a href="#hours" onClick={() => setMenuOpen(false)} style={{ padding: '12px 0', color: C.brown, fontSize: '14px', textDecoration: 'none', borderBottom: `1px solid ${C.border}` }}>Otváracie hodiny</a>
          <a href="#contact" onClick={() => setMenuOpen(false)} style={{ padding: '12px 0', color: C.brown, fontSize: '14px', textDecoration: 'none', borderBottom: `1px solid ${C.border}` }}>Kontakt</a>
          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <button onClick={() => navigate(`/s/${slug}/login`)} style={{ flex: 1, padding: '12px', background: 'transparent', color: C.brown, border: `1px solid ${C.brown}`, borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prihlásiť</button>
            <button onClick={() => navigate(`/s/${slug}/register`)} style={{ flex: 1, padding: '12px', background: C.brown, color: C.cream, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rezervovať</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="portal-hero" style={{ padding: '100px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            {salon.category && (
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.green, marginBottom: '16px' }}>{salon.category}</p>
            )}
            <h1 className="portal-hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '4rem', color: C.brown, fontWeight: 400, lineHeight: 1.1, marginBottom: '20px' }}>{salon.name}</h1>
            {salon.description && <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.8, marginBottom: '32px', maxWidth: '480px' }}>{salon.description}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {avgRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: C.pink, fontSize: '16px' }}>★</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: C.brown }}>{avgRating}</span>
                  <span style={{ fontSize: '13px', color: C.muted }}>({ratings.length} hodnotení)</span>
                </div>
              )}
              <div style={{ width: '1px', height: '16px', background: C.border }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOpen ? '#5A7A4A' : '#A05050' }} />
                <span style={{ fontSize: '13px', color: isOpen ? '#3A5A2A' : '#803030', fontWeight: 500 }}>
                  {isOpen ? `Otvorené · ${todayHours.open}–${todayHours.close}` : 'Dnes zatvorené'}
                </span>
              </div>
              {salon.address && (
                <>
                  <div style={{ width: '1px', height: '16px', background: C.border }} />
                  <span style={{ fontSize: '13px', color: C.muted }}>📍 {salon.address}</span>
                </>
              )}
            </div>

            <div className="portal-cta-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '16px 36px', background: C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.target.style.opacity='0.85'} onMouseLeave={e => e.target.style.opacity='1'}>
                Rezervovať termín
              </button>
              <button onClick={() => navigate(`/s/${slug}/login`)} style={{ padding: '16px 24px', background: 'transparent', color: C.brown, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
                Prihlásiť sa
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
            {[
              { value: services.length, label: 'Služieb' },
              { value: availableSlots.length, label: 'Voľných termínov' },
              { value: ratings.length, label: 'Hodnotení' },
            ].map(stat => (
              <div key={stat.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px 24px', minWidth: '160px' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: C.brown, marginBottom: '4px', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: C.border, maxWidth: '1100px', margin: '0 auto' }} />

      {/* Služby */}
      <section id="services" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.green, marginBottom: '12px' }}>Čo ponúkame</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: C.brown, fontWeight: 400, marginBottom: '48px' }}>Naše služby</h2>

        {services.length === 0 ? (
          <p style={{ fontSize: '14px', color: C.muted }}>Služby sa čoskoro zobrazia.</p>
        ) : (
          <div className="portal-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {services.map(service => (
              <div key={service.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(72,55,47,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                {service.imageUrl && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: C.brown, fontWeight: 400 }}>{service.name}</h3>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: C.green, flexShrink: 0, marginLeft: '12px' }}>{service.price} €</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.muted, marginBottom: '16px' }}>{service.duration} min</p>
                  {service.description && <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>}
                  <button onClick={() => navigate(`/s/${slug}/register`)} style={{ width: '100%', padding: '11px', background: C.cream, color: C.brown, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.target.style.background=C.brown} onMouseLeave={e => e.target.style.background=C.cream}
                    onMouseEnter={e => { e.target.style.background=C.brown; e.target.style.color=C.cream; }}
                    onMouseLeave={e => { e.target.style.background=C.cream; e.target.style.color=C.brown; }}>
                    Rezervovať
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Voľné termíny */}
      {availableSlots.length > 0 && (
        <>
          <div style={{ height: '1px', background: C.border, maxWidth: '1100px', margin: '0 auto' }} />
          <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.pink, marginBottom: '12px' }}>Dostupné termíny</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: C.brown, fontWeight: 400, marginBottom: '40px' }}>Voľné termíny</h2>
            <div className="portal-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {availableSlots.slice(0, 6).map(slot => {
                const service = services.find(s => s.id === slot.serviceId);
                const isLM = slot.status === SLOT_STATUS.LAST_MINUTE;
                return (
                  <div key={slot.id} style={{ background: isLM ? `rgba(200,161,177,0.08)` : C.white, border: `1px solid ${isLM ? C.pink : C.border}`, borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      {isLM && <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.pink, display: 'block', marginBottom: '6px' }}>⚡ Last Minute</span>}
                      <p style={{ fontSize: '14px', fontWeight: 500, color: C.brown, fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>{service?.name}</p>
                      <p style={{ fontSize: '12px', color: C.muted }}>{slot.date} · {slot.time}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: C.green, marginBottom: '8px' }}>{service?.price} €</p>
                      <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '8px 16px', background: C.brown, color: C.cream, border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Rezervovať
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Hodiny + Kontakt */}
      <div style={{ background: C.brown }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
          <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>

            {/* Otváracie hodiny */}
            <div id="hours">
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.pink, marginBottom: '12px' }}>Kedy nás nájdete</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: C.cream, fontWeight: 400, marginBottom: '32px' }}>Otváracie hodiny</h2>
              {salon.openHours && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {DAY_KEYS.map((key, i) => {
                    const hours = salon.openHours[key];
                    const isToday = i === todayIdx;
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 6 ? `1px solid rgba(244,243,238,0.1)` : 'none' }}>
                        <span style={{ fontSize: '13px', color: isToday ? C.cream : 'rgba(244,243,238,0.5)', fontWeight: isToday ? 500 : 400 }}>{DAYS_FULL[i]}</span>
                        <span style={{ fontSize: '13px', color: hours?.closed ? 'rgba(244,243,238,0.3)' : isToday ? C.pink : 'rgba(244,243,238,0.6)', fontWeight: isToday ? 500 : 400 }}>
                          {hours?.closed ? 'Zatvorené' : `${hours?.open} – ${hours?.close}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kontakt */}
            <div id="contact">
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.pink, marginBottom: '12px' }}>Kde nás nájdete</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: C.cream, fontWeight: 400, marginBottom: '32px' }}>Kontakt</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {salon.address && (
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.4)', marginBottom: '6px' }}>Adresa</p>
                    <p style={{ fontSize: '14px', color: C.cream }}>{salon.address}</p>
                  </div>
                )}
                {salon.phone && (
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.4)', marginBottom: '6px' }}>Telefón</p>
                    <a href={`tel:${salon.phone}`} style={{ fontSize: '14px', color: C.pink, textDecoration: 'none' }}>{salon.phone}</a>
                  </div>
                )}
                {salon.email && (
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.4)', marginBottom: '6px' }}>Email</p>
                    <a href={`mailto:${salon.email}`} style={{ fontSize: '14px', color: C.pink, textDecoration: 'none' }}>{salon.email}</a>
                  </div>
                )}
                {salon.instagram && (
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.4)', marginBottom: '6px' }}>Instagram</p>
                    <a href={`https://instagram.com/${salon.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: C.pink, textDecoration: 'none' }}>{salon.instagram}</a>
                  </div>
                )}
              </div>

              <button onClick={() => navigate(`/s/${slug}/register`)} style={{ marginTop: '40px', padding: '16px 32px', background: C.cream, color: C.brown, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', width: '100%' }}>
                Rezervovať termín →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: C.brown, borderTop: `1px solid rgba(244,243,238,0.1)`, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'rgba(244,243,238,0.3)', letterSpacing: '0.1em' }}>
          Powered by <span style={{ color: C.pink }}>BeautyTime</span>
        </p>
      </footer>
    </div>
  );
};

export default SalonPortal;
