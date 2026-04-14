import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSalonBySlug } from '../services/salonService';
import { getServices } from '../services/serviceService';
import { getSlots } from '../services/slotService';
import { getRatings } from '../services/ratingService';
import { SLOT_STATUS } from '../constants';

const DAYS_SK = { mon: 'Po', tue: 'Ut', wed: 'St', thu: 'Št', fri: 'Pi', sat: 'So', sun: 'Ne' };
const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];

const SalonPortal = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon]       = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [ratings, setRatings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { loadData(); }, [slug]);

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
      setServices(sv);
      setSlots(sl);
      setRatings(rt);
    } catch (err) { console.error(err); setNotFound(true); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#979086', fontFamily: 'Jost, sans-serif' }}>Načítavam...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>Salón nenájdený</p>
      <p style={{ fontSize: '13px', color: '#979086' }}>Skontrolujte odkaz ktorý vám bol zaslaný.</p>
    </div>
  );

  const todayKey = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayHours = salon.openHours?.[todayKey];
  const isOpen = todayHours && !todayHours.closed;
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : null;
  const availableSlots = slots.filter(s => s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE);
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySlots = availableSlots.filter(s => s.date === todayStr);
  const upcomingSlots = availableSlots.filter(s => s.date > todayStr).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA', fontFamily: 'Jost, sans-serif' }}>

      {/* Header */}
      <header style={{ background: 'rgba(245,240,234,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E2DE', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B' }}>{salon.name}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate(`/s/${slug}/login`)} style={{ padding: '9px 18px', background: 'transparent', color: '#6A5D52', border: '1px solid #D4C5B0', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Prihlásiť sa
          </button>
          <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '9px 18px', background: '#1C1C1B', color: '#F5F0EA', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Registrovať sa
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #D4C5B0, #A89070)', padding: '60px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(245,240,234,0.3)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(245,240,234,0.2)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(245,240,234,0.2)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#F5F0EA', fontWeight: 300 }}>{salon.name?.charAt(0)}</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#1C1C1B', fontWeight: 400, marginBottom: '8px' }}>{salon.name}</h1>
          {salon.category && <p style={{ fontSize: '12px', color: 'rgba(28,28,27,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{salon.category}</p>}
          <p style={{ fontSize: '14px', color: 'rgba(28,28,27,0.7)', marginBottom: '16px' }}>{salon.address}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {avgRating && <span style={{ fontSize: '13px', color: '#1C1C1B', background: 'rgba(245,240,234,0.4)', padding: '6px 14px', borderRadius: '20px' }}>★ {avgRating} ({ratings.length} hodnotení)</span>}
            <span style={{ fontSize: '13px', color: isOpen ? '#2A5C3A' : '#6B2C2C', background: isOpen ? 'rgba(74,124,89,0.2)' : 'rgba(139,58,58,0.2)', padding: '6px 14px', borderRadius: '20px', fontWeight: 500 }}>
              {isOpen ? `Otvorené · ${todayHours.open}–${todayHours.close}` : 'Zatvorené'}
            </span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Rezervovať CTA */}
        <div style={{ background: '#1C1C1B', borderRadius: '20px', padding: '28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4C5B0', marginBottom: '4px' }}>Online rezervácia</p>
            <p style={{ fontSize: '15px', color: '#F5F0EA', fontFamily: 'Cormorant Garamond, serif' }}>Rezervujte si termín kedykoľvek</p>
          </div>
          <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', color: '#1C1C1B', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
            Rezervovať teraz →
          </button>
        </div>

        {/* Služby */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>Naše služby</p>
          {services.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#979086' }}>Služby sa čoskoro zobrazia.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map(service => (
                <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#F5F0EA', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1B', fontFamily: 'Jost, sans-serif', marginBottom: '3px' }}>{service.name}</p>
                    <p style={{ fontSize: '12px', color: '#979086' }}>{service.duration} min</p>
                    {service.description && <p style={{ fontSize: '12px', color: '#B7AC9B', marginTop: '2px' }}>{service.description}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B' }}>{service.price} €</p>
                    <button onClick={() => navigate(`/s/${slug}/register`)} style={{ marginTop: '6px', padding: '6px 14px', background: '#6A5D52', color: '#F5F0EA', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Rezervovať
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voľné termíny */}
        {(todaySlots.length > 0 || upcomingSlots.length > 0) && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>Voľné termíny</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...todaySlots, ...upcomingSlots].map(slot => {
                const service = services.find(s => s.id === slot.serviceId);
                const isLM = slot.status === SLOT_STATUS.LAST_MINUTE;
                return (
                  <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: isLM ? 'rgba(212,197,176,0.2)' : '#F5F0EA', borderRadius: '12px', border: isLM ? '1px solid #D4C5B0' : 'none' }}>
                    <div>
                      {isLM && <span style={{ fontSize: '9px', color: '#6A5D52', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(106,93,82,0.1)', padding: '2px 6px', borderRadius: '4px', marginBottom: '4px', display: 'inline-block' }}>⚡ Last Minute</span>}
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1B', fontFamily: 'Jost, sans-serif' }}>{service?.name}</p>
                      <p style={{ fontSize: '12px', color: '#979086' }}>{slot.date} · {slot.time}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', color: '#6A5D52', fontWeight: 500, marginBottom: '6px' }}>{service?.price} €</p>
                      <button onClick={() => navigate(`/s/${slug}/register`)} style={{ padding: '7px 14px', background: '#6A5D52', color: '#F5F0EA', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Rezervovať
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pracovné hodiny */}
        {salon.openHours && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>Otváracie hodiny</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DAY_KEYS.map((key, i) => {
                const hours = salon.openHours[key];
                const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                const days = ['Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota','Nedeľa'];
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: isToday ? 'rgba(106,93,82,0.06)' : 'transparent', borderRadius: '8px', border: isToday ? '1px solid #D4C5B0' : 'none' }}>
                    <span style={{ fontSize: '13px', color: isToday ? '#1C1C1B' : '#979086', fontWeight: isToday ? 500 : 400 }}>{days[i]}</span>
                    <span style={{ fontSize: '13px', color: hours?.closed ? '#B7AC9B' : '#1C1C1B', fontWeight: isToday ? 500 : 400 }}>
                      {hours?.closed ? 'Zatvorené' : `${hours?.open} – ${hours?.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kontakt */}
        {(salon.phone || salon.email || salon.instagram || salon.website) && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>Kontakt</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {salon.phone && <a href={`tel:${salon.phone}`} style={{ fontSize: '14px', color: '#6A5D52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📞</span> {salon.phone}</a>}
              {salon.email && <a href={`mailto:${salon.email}`} style={{ fontSize: '14px', color: '#6A5D52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><span>✉️</span> {salon.email}</a>}
              {salon.instagram && <a href={`https://instagram.com/${salon.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#6A5D52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📸</span> {salon.instagram}</a>}
              {salon.website && <a href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#6A5D52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><span>🌐</span> {salon.website}</a>}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#B7AC9B' }}>
          Powered by <span style={{ color: '#6A5D52', fontWeight: 500 }}>BeautyTime</span>
        </p>
      </div>
    </div>
  );
};

export default SalonPortal;
