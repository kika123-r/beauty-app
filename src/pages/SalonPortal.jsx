import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonBySlug } from '../services/salonService';
import { getServices } from '../services/serviceService';
import { getSlots } from '../services/slotService';
import { getRatings } from '../services/ratingService';
import { SLOT_STATUS } from '../constants';

const C = {
  egg:    '#2D2D2D',
  stone:  '#7A6A52',
  coffee: '#C8A882',
  pink:   '#C8A882',
  dark:   '#FFF4E1',
  light:  '#222222',
  border: 'rgba(255,244,225,0.1)',
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
      let desc = document.querySelector('meta[name="description"]');
      if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
      desc.content = salon.description || `Rezervujte si termín v ${salon.name} online.`;
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
    <div style={{ minHeight: '100vh', background: C.egg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: `1px solid ${C.border}`, borderTopColor: C.pink, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: C.stone, fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase' }}>Načítavam</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: C.egg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: C.dark }}>Salón nenájdený</p>
      <p style={{ fontSize: '13px', color: C.stone, fontFamily: 'Julius Sans One, sans-serif' }}>Skontrolujte odkaz ktorý vám bol zaslaný.</p>
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
    <div style={{ minHeight: '100vh', background: C.egg, fontFamily: 'Julius Sans One, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Julius+Sans+One:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .portal-nav-links{display:none!important;}
          .portal-menu-btn{display:flex!important;}
          .portal-mobile-menu{display:${menuOpen?'flex':'none'}!important;}
          .portal-hero-title{font-size:48px!important;}
          .portal-stats{gap:24px!important;}
          .portal-services-grid{grid-template-columns:1fr!important;}
          .portal-slots-grid{grid-template-columns:1fr!important;}
          .portal-footer-grid{grid-template-columns:1fr!important;}
          .portal-cta-btns{flex-direction:column!important;}
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.egg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.3em', color: C.stone, textTransform: 'uppercase' }}>{salon.name}</span>
          <div className="portal-nav-links" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a href="#services" style={{ fontSize: '10px', letterSpacing: '0.18em', color: C.stone, textDecoration: 'none', textTransform: 'uppercase' }}>Služby</a>
            <a href="#hours" style={{ fontSize: '10px', letterSpacing: '0.18em', color: C.stone, textDecoration: 'none', textTransform: 'uppercase' }}>Hodiny</a>
            <a href="#contact" style={{ fontSize: '10px', letterSpacing: '0.18em', color: C.stone, textDecoration: 'none', textTransform: 'uppercase' }}>Kontakt</a>
            <button onClick={() => navigate(`/s/${slug}/login`)} style={{ fontSize: '10px', letterSpacing: '0.18em', color: C.coffee, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase' }}>Prihlásiť sa</button>
            <button onClick={() => navigate(`/s/${slug}/register`)} style={{ fontSize: '10px', letterSpacing: '0.18em', background: C.coffee, color: C.egg, border: 'none', padding: '9px 20px', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', textTransform: 'uppercase' }}>Rezervovať</button>
          </div>
          <button className="portal-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '20px', height: '1px', background: C.coffee }} />)}
          </button>
        </div>
        {menuOpen && (
          <div className="portal-mobile-menu" style={{ flexDirection: 'column', padding: '16px 32px', gap: '12px', borderTop: `1px solid ${C.border}`, background: C.egg }}>
            {['Služby', 'Hodiny', 'Kontakt'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ fontSize: '12px', letterSpacing: '0.18em', color: C.coffee, textDecoration: 'none', textTransform: 'uppercase', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>{l}</a>
            ))}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button onClick={() => navigate(`/s/${slug}/login`)} style={{ flex: 1, padding: '11px', background: 'transparent', color: C.coffee, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Prihlásiť</button>
              <button onClick={() => navigate(`/s/${slug}/register`)} style={{ flex: 1, padding: '11px', background: C.coffee, color: C.egg, border: 'none', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Rezervovať</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 32px 60px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        {salon.category && <p style={{ fontSize: '10px', letterSpacing: '0.35em', color: C.pink, textTransform: 'uppercase', marginBottom: '20px' }}>{salon.category} · {salon.address}</p>}
        <h1 className="portal-hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '72px', color: C.dark, fontWeight: 300, lineHeight: 1.0, marginBottom: '10px' }}>{salon.name}</h1>
        {salon.description && <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: C.coffee, fontStyle: 'italic', fontWeight: 300, marginBottom: '28px' }}>— {salon.description} —</p>}

        {/* Dekoratívny prvok */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '1px', background: C.stone }} />
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.pink }} />
          <div style={{ width: '40px', height: '1px', background: C.stone }} />
        </div>

        <p style={{ fontSize: '13px', color: C.stone, fontWeight: 300, lineHeight: 1.9, maxWidth: '340px', margin: '0 auto 36px' }}>
          Prémiové beauty služby. Rezervujte si termín online kedykoľvek a odkiaľkoľvek.
        </p>

        <div className="portal-cta-btns" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => navigate(`/s/${slug}/register`)} style={{ background: C.coffee, color: C.egg, border: 'none', padding: '15px 40px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif' }}>Rezervovať termín</button>
          <button onClick={() => navigate(`/s/${slug}/login`)} style={{ background: 'transparent', color: C.coffee, border: `1px solid rgba(132,95,74,0.25)`, padding: '15px 28px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif' }}>Prihlásiť sa</button>
        </div>
      </section>

      {/* Štatistiky */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.egg }}>
        <div className="portal-stats" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 32px', display: 'flex', justifyContent: 'center', gap: '48px' }}>
          {[
            { value: avgRating ? `${avgRating} ★` : '—', label: 'Hodnotenie' },
            { value: services.length || '—', label: 'Služieb' },
            { value: availableSlots.length || '—', label: 'Voľných termínov' },
            { value: isOpen ? 'Otvorené' : 'Zatvorené', label: todayHours && !todayHours.closed ? `${todayHours.open}–${todayHours.close}` : 'Dnes' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: i === 3 ? (isOpen ? '#6A8C5A' : '#C0605A') : C.coffee }}>{stat.value}</div>
              <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: C.stone, textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Služby */}
      <section id="services" style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', marginBottom: '12px' }}>Čo ponúkame</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: C.dark, fontWeight: 300 }}>Naše služby</h2>
        </div>
        {services.length === 0 ? (
          <p style={{ textAlign: 'center', color: C.stone, fontSize: '13px' }}>Služby sa čoskoro zobrazia.</p>
        ) : (
          <div className="portal-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: C.border }}>
            {services.map(service => (
              <div key={service.id} style={{ background: C.egg, padding: '32px' }}>
                {service.imageUrl && <div style={{ height: '160px', overflow: 'hidden', marginBottom: '20px' }}><img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: C.dark, fontWeight: 400 }}>{service.name}</h3>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: C.coffee, flexShrink: 0, marginLeft: '12px' }}>{service.price} €</span>
                </div>
                <p style={{ fontSize: '11px', color: C.stone, letterSpacing: '0.1em', marginBottom: '12px' }}>{service.duration} min</p>
                {service.description && <p style={{ fontSize: '13px', color: C.stone, lineHeight: 1.7, marginBottom: '20px', fontWeight: 300 }}>{service.description}</p>}
                <button onClick={() => navigate(`/s/${slug}/register`)} style={{ width: '100%', padding: '11px', background: 'transparent', color: C.coffee, border: `1px solid rgba(132,95,74,0.2)`, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.background=C.coffee; e.target.style.color=C.egg; }}
                  onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color=C.coffee; }}>
                  Rezervovať
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Voľné termíny */}
      {availableSlots.length > 0 && (
        <section style={{ background: C.light, padding: '80px 32px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', marginBottom: '12px' }}>Dostupné termíny</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: C.dark, fontWeight: 300 }}>Voľné termíny</h2>
            </div>
            <div className="portal-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: C.border }}>
              {availableSlots.slice(0, 6).map(slot => {
                const service = services.find(s => s.id === slot.serviceId);
                const isLM = slot.status === SLOT_STATUS.LAST_MINUTE;
                return (
                  <div key={slot.id} style={{ background: C.egg, padding: '24px' }}>
                    {isLM && <p style={{ fontSize: '9px', letterSpacing: '0.2em', color: C.pink, textTransform: 'uppercase', marginBottom: '8px' }}>⚡ Last Minute</p>}
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: C.dark, marginBottom: '6px', fontWeight: 400 }}>{service?.name}</h3>
                    <p style={{ fontSize: '12px', color: C.stone, marginBottom: '16px' }}>{slot.date} · {slot.time}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: C.coffee }}>{service?.price} €</span>
                      <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '8px 16px', background: C.coffee, color: C.egg, border: 'none', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif' }}>Rezervovať</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Hodiny + Kontakt */}
      <section style={{ background: C.coffee }}>
        <div className="portal-footer-grid" style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <div id="hours">
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', marginBottom: '12px' }}>Kedy nás nájdete</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: C.egg, fontWeight: 300, marginBottom: '32px' }}>Otváracie hodiny</h2>
            {salon.openHours && DAY_KEYS.map((key, i) => {
              const hours = salon.openHours[key];
              const isToday = i === todayIdx;
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 6 ? `1px solid rgba(240,237,220,0.08)` : 'none' }}>
                  <span style={{ fontSize: '13px', color: isToday ? C.egg : 'rgba(240,237,220,0.45)', fontWeight: isToday ? 500 : 300 }}>{DAYS_FULL[i]}</span>
                  <span style={{ fontSize: '13px', color: hours?.closed ? 'rgba(240,237,220,0.2)' : isToday ? C.pink : 'rgba(240,237,220,0.5)', fontWeight: isToday ? 500 : 300 }}>
                    {hours?.closed ? 'Zatvorené' : `${hours?.open} – ${hours?.close}`}
                  </span>
                </div>
              );
            })}
          </div>
          <div id="contact">
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: C.pink, textTransform: 'uppercase', marginBottom: '12px' }}>Kde nás nájdete</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: C.egg, fontWeight: 300, marginBottom: '32px' }}>Kontakt</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              {salon.address && <div><p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(240,237,220,0.35)', textTransform: 'uppercase', marginBottom: '6px' }}>Adresa</p><p style={{ fontSize: '14px', color: C.egg, fontWeight: 300 }}>{salon.address}</p></div>}
              {salon.phone && <div><p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(240,237,220,0.35)', textTransform: 'uppercase', marginBottom: '6px' }}>Telefón</p><a href={`tel:${salon.phone}`} style={{ fontSize: '14px', color: C.pink, textDecoration: 'none', fontWeight: 300 }}>{salon.phone}</a></div>}
              {salon.email && <div><p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(240,237,220,0.35)', textTransform: 'uppercase', marginBottom: '6px' }}>Email</p><a href={`mailto:${salon.email}`} style={{ fontSize: '14px', color: C.pink, textDecoration: 'none', fontWeight: 300 }}>{salon.email}</a></div>}
              {salon.instagram && <div><p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(240,237,220,0.35)', textTransform: 'uppercase', marginBottom: '6px' }}>Instagram</p><a href={`https://instagram.com/${salon.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: C.pink, textDecoration: 'none', fontWeight: 300 }}>{salon.instagram}</a></div>}
            </div>
            <button onClick={() => navigate(`/s/${slug}/register`)} style={{ width: '100%', padding: '15px', background: C.egg, color: C.coffee, border: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Julius Sans One, sans-serif', fontWeight: 500 }}>
              Rezervovať termín →
            </button>
          </div>
        </div>
        <div style={{ borderTop: `1px solid rgba(240,237,220,0.08)`, padding: '20px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,237,220,0.2)', letterSpacing: '0.15em' }}>Powered by <span style={{ color: C.pink }}>BeautyTime</span></p>
        </div>
      </section>
    </div>
  );
};

export default SalonPortal;
