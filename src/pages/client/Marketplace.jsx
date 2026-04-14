import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSlots } from '../../services/slotService';
import { getServices } from '../../services/serviceService';
import { createBooking } from '../../services/bookingService';
import { getDocuments } from '../../firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logoutUser } from '../../firebase/auth';
import { SLOT_STATUS, ROUTES } from '../../constants';
import { getRatings } from '../../services/ratingService';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [salons, setSalons]     = useState([]);
  const [ratings, setRatings]   = useState({});
  const [selectedSalonDetail, setSelectedSalonDetail] = useState(null);
  const [slots, setSlots]       = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(null);
  const [filter, setFilter]     = useState('all');
  const [selectedSalon, setSelectedSalon] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const salonsData = await getDocuments(collection(db, 'salons'));
      setSalons(salonsData);
      const allSlots = [], allServices = [];
      await Promise.all(salonsData.map(async salon => {
        const [sl, sv] = await Promise.all([getSlots(salon.id), getServices(salon.id)]);
        allSlots.push(...sl.map(s => ({ ...s, salonId: salon.id })));
        allServices.push(...sv.map(s => ({ ...s, salonId: salon.id })));
      }));
      setSlots(allSlots);
      setServices(allServices);
      const ratingsMap = {};
      await Promise.all(salonsData.map(async salon => {
        const rt = await getRatings(salon.id);
        const avg = rt.length > 0 ? (rt.reduce((s, r) => s + r.rating, 0) / rt.length).toFixed(1) : null;
        ratingsMap[salon.id] = { avg, count: rt.length };
      }));
      setRatings(ratingsMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getService = (serviceId) => services.find(s => s.id === serviceId);
  const getSalon = (salonId) => salons.find(s => s.id === salonId);

  const today = new Date().toISOString().split('T')[0];

  const available = slots.filter(s =>
    (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) && s.date >= today
  );

  const filtered = available.filter(s => {
    if (filter === 'last_minute' && s.status !== SLOT_STATUS.LAST_MINUTE) return false;
    if (selectedSalon !== 'all' && s.salonId !== selectedSalon) return false;
    return true;
  });

  const todaySlots = filtered.filter(s => s.date === today);
  const upcomingSlots = filtered.filter(s => s.date > today);

  const handleBook = async (slot) => {
    setBooking(slot.id);
    try {
      await createBooking(slot.salonId, firebaseUser.uid, slot.id, slot.serviceId);
      toast.success('Rezervácia potvrdená!');
      loadData();
    } catch { toast.error('Chyba pri rezervácii.'); }
    finally { setBooking(null); }
  };

  const btnStyle = (active) => ({
    flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
    background: active ? '#6A5D52' : 'transparent',
    color: active ? '#F5F0EA' : '#979086',
    fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em',
    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E2DE', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(28,28,27,0.04)' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#6A5D52' }}>BeautyTime</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}>Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>Kalendár</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notifications')}>Notifikácie</button>
        </div>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #D4C5B0 0%, #B7AC9B 100%)', padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(245,240,234,0.3)' }} />
        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.8)', marginBottom: '12px' }}>Exkluzívne ponuky</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#F5F0EA', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Last Minute & Voľné termíny</h2>
        <p style={{ fontSize: '14px', color: 'rgba(245,240,234,0.75)', maxWidth: '400px', margin: '0 auto' }}>Rezervuj dostupné termíny v najlepších salónoch</p>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Filtre */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '14px', padding: '4px', marginBottom: '12px', display: 'flex', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
          <button style={btnStyle(filter === 'all')} onClick={() => setFilter('all')}>Všetky termíny</button>
          <button style={btnStyle(filter === 'last_minute')} onClick={() => setFilter('last_minute')}>⚡ Last Minute</button>
        </div>

        {/* Salon karty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {salons.map(salon => {
            const rt = ratings[salon.id];
            const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
            const hours = salon.openHours?.[todayKey];
            const isOpen = hours && !hours.closed;
            return (
              <div key={salon.id} onClick={() => setSelectedSalonDetail(selectedSalonDetail === salon.id ? null : salon.id)}
                style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '16px', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#1C1C1B', fontFamily: 'Jost, sans-serif' }}>{salon.name}</p>
                      {salon.category && <span style={{ fontSize: '10px', color: '#6A5D52', background: 'rgba(106,93,82,0.08)', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.06em' }}>{salon.category}</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#979086', marginBottom: '4px' }}>{salon.address}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {rt?.avg && <span style={{ fontSize: '12px', color: '#B07D3A' }}>★ {rt.avg} ({rt.count})</span>}
                      <span style={{ fontSize: '11px', color: isOpen ? '#4A7C59' : '#8B3A3A', fontWeight: 500 }}>{isOpen ? `Otvorené · ${hours.open}–${hours.close}` : 'Zatvorené'}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#979086' }}>{selectedSalonDetail === salon.id ? '▲' : '▼'}</span>
                </div>
                {selectedSalonDetail === salon.id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F0EA' }}>
                    {salon.description && <p style={{ fontSize: '13px', color: '#979086', lineHeight: 1.6, marginBottom: '12px' }}>{salon.description}</p>}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {salon.phone && <a href={`tel:${salon.phone}`} style={{ fontSize: '12px', color: '#6A5D52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>📞 {salon.phone}</a>}
                      {salon.email && <a href={`mailto:${salon.email}`} style={{ fontSize: '12px', color: '#6A5D52', textDecoration: 'none' }}>✉️ {salon.email}</a>}
                      {salon.instagram && <a href={`https://instagram.com/${salon.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6A5D52', textDecoration: 'none' }}>Instagram {salon.instagram}</a>}
                      {salon.website && <a href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6A5D52', textDecoration: 'none' }}>🌐 Web</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {salons.length > 1 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '14px', padding: '4px', marginBottom: '24px', display: 'flex', gap: '4px', flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <button style={btnStyle(selectedSalon === 'all')} onClick={() => setSelectedSalon('all')}>Všetky salóny</button>
            {salons.map(s => (
              <button key={s.id} style={btnStyle(selectedSalon === s.id)} onClick={() => setSelectedSalon(s.id)}>{s.name}</button>
            ))}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

        {!loading && filtered.length === 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '16px' }}>🌿</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>Momentálne žiadne voľné termíny</p>
            <p style={{ fontSize: '13px', color: '#979086' }}>Skontroluj neskôr alebo si rezervuj cez kalendár</p>
          </div>
        )}

        {todaySlots.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086' }}>Dnes</p>
              <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
              <span style={{ fontSize: '10px', color: '#6A5D52', fontWeight: 500, background: 'rgba(106,93,82,0.08)', padding: '3px 10px', borderRadius: '20px' }}>{todaySlots.length} dostupných</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todaySlots.map(slot => <SlotCard key={slot.id} slot={slot} service={getService(slot.serviceId)} salon={getSalon(slot.salonId)} onBook={handleBook} isBooking={booking === slot.id} />)}
            </div>
          </div>
        )}

        {upcomingSlots.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086' }}>Nadchádzajúce</p>
              <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingSlots.map(slot => <SlotCard key={slot.id} slot={slot} service={getService(slot.serviceId)} salon={getSalon(slot.salonId)} onBook={handleBook} isBooking={booking === slot.id} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SlotCard = ({ slot, service, salon, onBook, isBooking }) => {
  const isLastMinute = slot.status === SLOT_STATUS.LAST_MINUTE;
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${isLastMinute ? '#D4C5B0' : '#E2E2DE'}`, borderRadius: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: isLastMinute ? '0 4px 20px rgba(106,93,82,0.08)' : '0 2px 12px rgba(28,28,27,0.04)', position: 'relative', overflow: 'hidden' }}>
      {isLastMinute && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #D4C5B0, #6A5D52)' }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: isLastMinute ? 'linear-gradient(135deg, #D4C5B0, #B7AC9B)' : '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>✂️</div>
        <div>
          {isLastMinute && <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6A5D52', background: 'rgba(106,93,82,0.08)', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginBottom: '6px' }}>⚡ Last Minute</span>}
          <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '15px', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>{service?.name || 'Služba'}</p>
          <p style={{ fontSize: '13px', color: '#979086' }}>{slot.date} · {slot.time}</p>
          <p style={{ fontSize: '12px', color: '#6A5D52', marginTop: '2px' }}>{salon?.name}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#1C1C1B', marginBottom: '8px' }}>{service?.price} €</p>
        <button onClick={() => onBook(slot)} disabled={isBooking} style={{ padding: '9px 20px', background: isBooking ? '#B7AC9B' : '#6A5D52', color: '#F5F0EA', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: isBooking ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
          {isBooking ? '...' : 'Rezervovať'}
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
