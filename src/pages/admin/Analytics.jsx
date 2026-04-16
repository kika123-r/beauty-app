import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import { getBookingsForSalon } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { BOOKING_STATUS } from '../../constants';
import { getRatings } from '../../services/ratingService';
import { getDocuments, usersCol } from '../../firebase/firestore';

const Analytics = () => {
  const { salonId } = useAuth();
  const { hasFeature, config } = useTier();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [users, setUsers] = useState([]);

  const canUse = hasFeature('analytics');

  useEffect(() => {
    if (!canUse) { setLoading(false); return; }
    Promise.all([
      getBookingsForSalon(salonId),
      getServices(salonId),
      getSlots(salonId),
      getRatings(salonId),
      getDocuments(usersCol()),
    ]).then(([b, sv, sl, rt, u]) => {
      setBookings(b); setServices(sv); setSlots(sl); setRatings(rt); setUsers(u);
    }).finally(() => setLoading(false));
  }, []);

  if (!canUse) {
    return (
      <AdminLayout>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Analytika</h2>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: 'var(--text)', marginBottom: '12px' }}>Pokročilá analytika</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '8px', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 24px' }}>
              Sledujte tržby, vyťaženosť a správanie klientov. Dostupné od plánu <strong>Pro</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              {['Tržby za mesiac', 'No-show štatistiky', 'Vyťaženosť slotov', 'Top služby', 'Verní klienti'].map(f => (
                <span key={f} style={{ fontSize: '12px', color: 'var(--text-faint)', background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: '20px', opacity: 0.6 }}>{f}</span>
              ))}
            </div>
            <button onClick={() => navigate('/admin/pricing')} style={{ padding: '13px 28px', background: 'var(--primary-dark)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              Upgradovať na Pro →
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).reduce((sum, b) => {
    const s = services.find(sv => sv.id === b.serviceId);
    return sum + (s?.price || 0);
  }, 0);
  const completed = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
  const cancelled = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length;
  const noShow = bookings.filter(b => b.status === BOOKING_STATUS.NO_SHOW).length;
  const total = bookings.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const serviceStats = services.map(s => ({
    name: s.name,
    count: bookings.filter(b => b.serviceId === s.id && b.status === BOOKING_STATUS.COMPLETED).length,
    revenue: bookings.filter(b => b.serviceId === s.id && b.status === BOOKING_STATUS.COMPLETED).length * s.price,
  })).sort((a, b) => b.count - a.count);

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—';
  const getUserName = (uid) => users.find(u => u.uid === uid)?.name || 'Klient';

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Analytika</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Celkové tržby', value: `${totalRevenue} €`, color: '#D4A85A' },
            { label: 'Dokončené rezervácie', value: completed, color: '#7A9E7E' },
            { label: 'Úspešnosť', value: `${completionRate}%`, color: '#C8A882' },
            { label: 'No-show', value: noShow, color: '#C8A882' },
            { label: 'Priemerné hodnotenie', value: `${avgRating} ★`, color: '#D4A85A' },
          ].map(stat => (
            <div key={stat.label} style={cardStyle}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: stat.color, marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '16px' }}>Top služby</p>
          {serviceStats.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Zatiaľ žiadne dokončené rezervácie.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {serviceStats.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--text-faint)' }}>#{i + 1}</span>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{s.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{s.revenue} €</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{s.count}x</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hodnotenia */}
        <div style={cardStyle}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '16px' }}>Hodnotenia klientov</p>
          {ratings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Zatiaľ žiadne hodnotenia.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ratings.slice().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(r => (
                <div key={r.id} style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{getUserName(r.clientId)}</p>
                    <span style={{ fontSize: '16px', color: '#D4A85A', letterSpacing: '2px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.6 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
