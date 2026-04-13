// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForSalon } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { getSalon } from '../../services/salonService';
import { BOOKING_STATUS, SLOT_STATUS, ROUTES } from '../../constants';

const AdminDashboard = () => {
  const { salonId, userProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [salon, setSalon]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bookingsData, servicesData, slotsData, salonData] = await Promise.all([
        getBookingsForSalon(salonId),
        getServices(salonId),
        getSlots(salonId),
        getSalon(salonId),
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
      setSlots(slotsData);
      setSalon(salonData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr      = new Date().toISOString().split('T')[0];
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((b) => {
    const slot = slots.find((s) => s.id === b.slotId);
    return slot?.date === todayStr;
  }).length;
  const freeSlots  = slots.filter((s) => s.status === SLOT_STATUS.AVAILABLE).length;
  const noShows    = bookings.filter((b) => b.status === BOOKING_STATUS.NO_SHOW).length;
  const completed  = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length;
  const revenue    = bookings
    .filter((b) => b.status === BOOKING_STATUS.COMPLETED)
    .reduce((sum, b) => {
      const service = services.find((s) => s.id === b.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const recentBookings = bookings.slice(0, 5);

  const getServiceName = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? s.name : 'Služba';
  };

  const getSlotInfo = (slotId) => {
    const s = slots.find((s) => s.id === slotId);
    return s ? `${s.date} · ${s.time}` : '';
  };

  const STATUS_CONFIG = {
    confirmed: { label: 'Potvrdená', color: '#4A7C59' },
    completed: { label: 'Dokončená', color: '#3A5A7C' },
    cancelled: { label: 'Zrušená',   color: '#8B3A3A' },
    no_show:   { label: 'No-show',   color: '#8B3A3A' },
    pending:   { label: 'Čaká',      color: '#B07D3A' },
  };

  const stats = [
    { label: 'Celkom rezervácií', value: totalBookings, color: '#6A5D52' },
    { label: 'Dnes',              value: todayBookings,  color: '#4A7C59' },
    { label: 'Voľné sloty',       value: freeSlots,      color: '#3A5A7C' },
    { label: 'Tržby',             value: `${revenue} €`, color: '#B07D3A' },
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>

        {/* Vitaj */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
            Dobré ráno
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '4px', color: '#1C1C1B' }}>
            {userProfile?.name?.split(' ')[0]}
          </h2>
          <p style={{ fontSize: '14px', color: '#979086' }}>
            {salon?.name} · {salon?.address}
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {/* Štatistiky */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '28px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E2DE',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
            }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: stat.color, marginBottom: '6px', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#979086', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Rýchle akcie */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E2DE',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086', marginBottom: '16px' }}>
            Rýchle akcie
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: '+ Pridať slot',    path: ROUTES.ADMIN_SLOTS },
              { label: '+ Pridať službu',  path: ROUTES.ADMIN_SERVICES },
              { label: 'Rezervácie',       path: ROUTES.ADMIN_BOOKINGS },
              { label: 'Analytika',        path: ROUTES.ADMIN_ANALYTICS },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid #E2E2DE',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6A5D52',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  fontFamily: 'Jost, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#F5F0EA'; e.target.style.borderColor = '#6A5D52'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = '#E2E2DE'; }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posledné rezervácie */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E2DE',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086' }}>
              Posledné rezervácie
            </p>
            <button
              onClick={() => navigate(ROUTES.ADMIN_BOOKINGS)}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6A5D52', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
            >
              Zobraziť všetky →
            </button>
          </div>

          {recentBookings.length === 0 && (
            <p style={{ fontSize: '14px', color: '#979086', textAlign: 'center', padding: '24px 0' }}>
              Zatiaľ žiadne rezervácie.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentBookings.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
              return (
                <div key={booking.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: '#F5F0EA',
                  borderRadius: '12px',
                }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1B', marginBottom: '3px', fontFamily: 'Jost, sans-serif' }}>
                      {getServiceName(booking.serviceId)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#979086' }}>
                      {getSlotInfo(booking.slotId)}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: status.color,
                    background: 'rgba(255,255,255,0.7)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {status.label}
                  </span>
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