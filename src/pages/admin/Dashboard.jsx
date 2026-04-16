import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import { getBookingsForSalon } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { getSalon } from '../../services/salonService';
import { BOOKING_STATUS, SLOT_STATUS, ROUTES } from '../../constants';
import { TIERS } from '../../constants/tiers';

const AdminDashboard = () => {
  const { salonId, userProfile } = useAuth();
  const { tier, config, hasFeature } = useTier();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [salon, setSalon]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [b, sv, sl, s] = await Promise.all([
        getBookingsForSalon(salonId),
        getServices(salonId),
        getSlots(salonId),
        getSalon(salonId),
      ]);
      setBookings(b); setServices(sv); setSlots(sl); setSalon(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => slots.find(s => s.id === b.slotId)?.date === todayStr).length;
  const monthBookings = bookings.filter(b => b.createdAt?.toDate?.() >= startOfMonth).length;
  const freeSlots = slots.filter(s => s.status === SLOT_STATUS.AVAILABLE).length;
  const completed = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
  const noShows = bookings.filter(b => b.status === BOOKING_STATUS.NO_SHOW).length;
  const revenue = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).reduce((sum, b) => {
    const s = services.find(s => s.id === b.serviceId);
    return sum + (s?.price || 0);
  }, 0);

  const maxBookings = config.maxBookingsPerMonth;
  const maxServices = config.maxServices;
  const maxSlots = config.maxSlots;
  const bookingUsage = maxBookings ? Math.round((monthBookings / maxBookings) * 100) : 0;
  const serviceUsage = maxServices ? Math.round((services.length / maxServices) * 100) : 0;
  const slotUsage = maxSlots ? Math.round((slots.length / maxSlots) * 100) : 0;

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Služba';
  const getSlotInfo = (id) => { const s = slots.find(s => s.id === id); return s ? `${s.date} · ${s.time}` : ''; };

  const STATUS_CONFIG = {
    confirmed: { label: 'Potvrdená', color: '#7A9E7E' },
    completed: { label: 'Dokončená', color: '#C8A882' },
    cancelled: { label: 'Zrušená',   color: '#C8A882' },
    no_show:   { label: 'No-show',   color: '#C8A882' },
    pending:   { label: 'Čaká',      color: '#D4A85A' },
  };

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };

  const UsageBar = ({ label, current, max, unit = '' }) => {
    if (max === null) return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-faint)', fontFamily: 'Jost, sans-serif' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#7A9E7E', fontFamily: 'Jost, sans-serif' }}>{current} / ∞</span>
      </div>
    );
    const pct = Math.min(Math.round((current / max) * 100), 100);
    const color = pct >= 90 ? '#C8A882' : pct >= 70 ? '#D4A85A' : '#7A9E7E';
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-faint)', fontFamily: 'Jost, sans-serif' }}>{label}</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color, fontFamily: 'Jost, sans-serif' }}>{current} / {max}{unit}</span>
        </div>
        <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.5s' }} />
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '860px' }}>

        {/* Vitaj */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Dobré ráno</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '4px', color: 'var(--text)' }}>{userProfile?.name?.split(' ')[0]}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-faint)' }}>{salon?.name}{salon?.address ? ` · ${salon.address}` : ''}</p>
        </div>

        {/* Tier upozornenie */}
        {tier === TIERS.FREE && (
          <div style={{ background: 'linear-gradient(135deg, #1C1C1B, #3A3A38)', borderRadius: '20px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--primary-light)', marginBottom: '4px' }}>Ste na Free pláne</p>
              <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Upgradujte pre neobmedzené rezervácie, analytiku a AI funkcie.</p>
            </div>
            <button onClick={() => navigate('/admin/pricing')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap' }}>
              Upgradovať →
            </button>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

        {/* Štatistiky */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Celkom rezervácií', value: totalBookings, color: 'var(--primary)' },
            { label: 'Dnes',              value: todayBookings,  color: '#7A9E7E' },
            { label: 'Voľné sloty',       value: freeSlots,      color: '#C8A882' },
            { label: 'Tržby celkom',      value: `${revenue} €`, color: '#D4A85A' },
          ].map(stat => (
            <div key={stat.label} style={cardStyle}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: stat.color, marginBottom: '6px', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* Využitie plánu */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Využitie plánu</p>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--primary)', background: 'rgba(106,93,82,0.08)', padding: '3px 10px', borderRadius: '20px' }}>{config.name}</span>
            </div>
            <UsageBar label="Rezervácie / mes" current={monthBookings} max={maxBookings} />
            <UsageBar label="Služby" current={services.length} max={maxServices} />
            <UsageBar label="Časové sloty" current={slots.length} max={maxSlots} />
            {(bookingUsage >= 80 || serviceUsage >= 80 || slotUsage >= 80) && (
              <button onClick={() => navigate('/admin/pricing')} style={{ width: '100%', marginTop: '14px', padding: '10px', background: 'var(--primary-dark)', color: 'var(--text)', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Upgradovať plán →
              </button>
            )}
          </div>

          {/* Rýchle akcie */}
          <div style={cardStyle}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '16px' }}>Rýchle akcie</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '+ Pridať slot',    path: ROUTES.ADMIN_SLOTS },
                { label: '+ Pridať službu',  path: ROUTES.ADMIN_SERVICES },
                { label: 'Rezervácie',       path: ROUTES.ADMIN_BOOKINGS },
                { label: 'Klienti',          path: ROUTES.ADMIN_USERS },
                { label: 'Analytika',        path: ROUTES.ADMIN_ANALYTICS },
                { label: 'Cenové plány',     path: '/admin/pricing' },
              ].map(action => (
                <button key={action.label} onClick={() => navigate(action.path)} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontWeight: 500, color: 'var(--primary)', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: 'Jost, sans-serif', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.target.style.background = 'var(--bg-elevated)'; e.target.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)'; }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posledné rezervácie */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Posledné rezervácie</p>
            <button onClick={() => navigate(ROUTES.ADMIN_BOOKINGS)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zobraziť všetky →</button>
          </div>

          {bookings.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-faint)', textAlign: 'center', padding: '24px 0' }}>Zatiaľ žiadne rezervácie.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bookings.slice(0, 5).map(booking => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
              return (
                <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px', fontFamily: 'Jost, sans-serif' }}>{getServiceName(booking.serviceId)}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{getSlotInfo(booking.slotId)}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: status.color, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: '20px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
