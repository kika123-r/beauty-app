import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForClient } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { getDocuments } from '../../firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logoutUser } from '../../firebase/auth';
import { BOOKING_STATUS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  confirmed: { label: 'Potvrdená', color: '#4A7C59', bg: 'rgba(74,124,89,0.1)' },
  pending:   { label: 'Čaká',      color: '#B07D3A', bg: 'rgba(176,125,58,0.1)' },
  cancelled: { label: 'Zrušená',   color: '#8B3A3A', bg: 'rgba(139,58,58,0.1)' },
  completed: { label: 'Dokončená', color: '#3A5A7C', bg: 'rgba(58,90,124,0.1)' },
  no_show:   { label: 'No-show',   color: '#8B3A3A', bg: 'rgba(139,58,58,0.1)' },
};

const ClientDashboard = () => {
  const { firebaseUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [services, setServices]   = useState([]);
  const [slots, setSlots]         = useState([]);
  const [salons, setSalons]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const salonsSnap = await getDocuments(collection(db, 'salons'));
      setSalons(salonsSnap);

      const allBookings = [];
      const allServices = [];
      const allSlots = [];

      await Promise.all(salonsSnap.map(async (salon) => {
        const [b, sv, sl] = await Promise.all([
          getBookingsForClient(salon.id, firebaseUser.uid),
          getServices(salon.id),
          getSlots(salon.id),
        ]);
        allBookings.push(...b);
        allServices.push(...sv);
        allSlots.push(...sl);
      }));

      setBookings(allBookings);
      setServices(allServices);
      setSlots(allSlots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? s.name : 'Služba';
  };

  const getServicePrice = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? `${s.price} €` : '';
  };

  const getSlotInfo = (slotId) => {
    const s = slots.find((s) => s.id === slotId);
    return s ? { date: s.date, time: s.time } : null;
  };

  const getSalonName = (salonId) => {
    const s = salons.find((s) => s.id === salonId);
    return s ? s.name : '';
  };

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Odhlásený');
    navigate(ROUTES.LOGIN);
  };

  const upcomingBookings = bookings.filter((b) =>
    b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING
  );
  const pastBookings = bookings.filter((b) =>
    b.status === BOOKING_STATUS.COMPLETED ||
    b.status === BOOKING_STATUS.CANCELLED ||
    b.status === BOOKING_STATUS.NO_SHOW
  );

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const firstSalon = salons[0];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E2DE', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(28,28,27,0.04)' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#6A5D52' }}>BeautyTime</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>Kalendár</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}>Marketplace</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notifications')}>Notifikácie</button>
          <div onClick={handleLogout} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(106,93,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#6A5D52', cursor: 'pointer' }}>
            {initials}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>Vitaj späť</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', marginBottom: '4px' }}>{userProfile?.name?.split(' ')[0]}</h1>
          <p style={{ color: '#979086', fontSize: '14px' }}>Tvoj osobný beauty priestor</p>
        </div>

        {firstSalon && (
          <div style={{ background: 'linear-gradient(135deg, #D4C5B0 0%, #B7AC9B 60%, #A89070 100%)', borderRadius: '24px', padding: '28px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', border: '1px solid rgba(245,240,234,0.25)' }} />
            <p style={{ fontSize: '10px', color: 'rgba(245,240,234,0.7)', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Váš salón</p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#F5F0EA', marginBottom: '4px', fontWeight: 400 }}>{firstSalon.name}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(245,240,234,0.7)', marginBottom: '24px' }}>{firstSalon.address}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate(`/book/${firstSalon.id}`)} style={{ padding: '10px 20px', background: '#F5F0EA', color: '#6A5D52', border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Rezervovať
              </button>
              <button onClick={() => navigate('/calendar')} style={{ padding: '10px 20px', background: 'rgba(245,240,234,0.2)', color: '#F5F0EA', border: '1px solid rgba(245,240,234,0.3)', borderRadius: '12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Kalendár
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Celkom', value: bookings.length, color: '#6A5D52' },
            { label: 'Nadchádzajúce', value: upcomingBookings.length, color: '#4A7C59' },
            { label: 'Dokončené', value: pastBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length, color: '#3A5A7C' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
              <p style={{ fontSize: '24px', fontWeight: 600, color: stat.color, marginBottom: '4px', fontFamily: 'Cormorant Garamond, serif' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#979086', letterSpacing: '0.05em' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#FFFFFF', borderRadius: '14px', padding: '4px', marginBottom: '20px', border: '1px solid #E2E2DE', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
          {[{ key: 'upcoming', label: 'Nadchádzajúce' }, { key: 'past', label: 'História' }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: activeTab === tab.key ? '#6A5D52' : 'transparent', color: activeTab === tab.key ? '#F5F0EA' : '#979086', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

        {!loading && displayBookings.length === 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#1C1C1B', marginBottom: '8px' }}>
              {activeTab === 'upcoming' ? 'Žiadne nadchádzajúce rezervácie' : 'Žiadna história'}
            </p>
            <p style={{ fontSize: '13px', color: '#979086', marginBottom: '20px' }}>
              {activeTab === 'upcoming' ? 'Rezervuj si termín a uvidíš ho tu.' : 'Tvoje dokončené rezervácie sa zobrazia tu.'}
            </p>
            {activeTab === 'upcoming' && firstSalon && (
              <button onClick={() => navigate(`/book/${firstSalon.id}`)} style={{ padding: '12px 28px', background: '#6A5D52', color: '#F5F0EA', border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Rezervovať teraz
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayBookings.map((booking) => {
            const status   = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
            const slotInfo = getSlotInfo(booking.slotId);
            return (
              <div key={booking.id} style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>✂️</div>
                  <div>
                    <p style={{ fontWeight: 500, color: '#1C1C1B', marginBottom: '4px', fontSize: '15px', fontFamily: 'Jost, sans-serif' }}>{getServiceName(booking.serviceId)}</p>
                    {slotInfo && <p style={{ fontSize: '13px', color: '#979086' }}>{slotInfo.date} · {slotInfo.time}</p>}
                    <p style={{ fontSize: '12px', color: '#979086', marginTop: '2px' }}>{getSalonName(booking.salonId)}</p>
                    <p style={{ fontSize: '12px', color: '#6A5D52', marginTop: '2px' }}>{getServicePrice(booking.serviceId)}</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: status.color, background: status.bg, padding: '5px 12px', borderRadius: '20px', fontWeight: 500, flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
