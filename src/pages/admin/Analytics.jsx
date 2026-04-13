// src/pages/admin/Analytics.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForSalon } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { BOOKING_STATUS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6A5D52', '#B7AC9B', '#D4C5B0', '#979086', '#1C1C1B'];

const Analytics = () => {
  const { salonId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bookingsData, servicesData] = await Promise.all([
        getBookingsForSalon(salonId),
        getServices(salonId),
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total     = bookings.length;
  const completed = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length;
  const cancelled = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length;
  const confirmed = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED).length;
  const noShows   = bookings.filter((b) => b.status === BOOKING_STATUS.NO_SHOW).length;
  const noShowRate = total > 0 ? Math.round((noShows / total) * 100) : 0;

  const revenue = bookings
    .filter((b) => b.status === BOOKING_STATUS.COMPLETED)
    .reduce((sum, b) => {
      const service = services.find((s) => s.id === b.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const serviceStats = services.map((service) => ({
    name:  service.name.length > 14 ? service.name.slice(0, 14) + '...' : service.name,
    count: bookings.filter((b) => b.serviceId === service.id).length,
  })).filter((s) => s.count > 0);

  const statusData = [
    { name: 'Potvrdené',  value: confirmed },
    { name: 'Dokončené',  value: completed },
    { name: 'Zrušené',    value: cancelled },
    { name: 'No-show',    value: noShows },
  ].filter((s) => s.value > 0);

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E2DE',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
  };

  const stats = [
    { label: 'Celkom rezervácií', value: total,        color: '#6A5D52' },
    { label: 'Dokončených',        value: completed,    color: '#4A7C59' },
    { label: 'No-show rate',       value: `${noShowRate}%`, color: '#8B3A3A' },
    { label: 'Tržby',              value: `${revenue} €`,   color: '#B07D3A' },
  ];

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E2DE',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(28,28,27,0.08)',
        }}>
          <p style={{ fontSize: '12px', color: '#979086', marginBottom: '4px' }}>{label}</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1B', fontFamily: 'Cormorant Garamond, serif' }}>
            {payload[0].value} rezervácií
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>

        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
            Prehľad
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>
            Analytika
          </h2>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {/* Štatistiky */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={cardStyle}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.2rem', color: stat.color,
                marginBottom: '6px', lineHeight: 1,
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#979086', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Graf — služby */}
        {serviceStats.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>
              Najpopulárnejšie služby
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceStats} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#979086', fontSize: 11, fontFamily: 'Jost, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#979086', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" fill="#6A5D52" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Graf — statusy */}
        {statusData.length > 0 && (
          <div style={cardStyle}>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086', marginBottom: '20px' }}>
              Statusy rezervácií
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E2DE',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(28,28,27,0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {statusData.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#979086', fontFamily: 'Jost, sans-serif' }}>
                      {entry.name}:{' '}
                      <span style={{ color: '#1C1C1B', fontWeight: 500 }}>{entry.value}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>
              Zatiaľ žiadne dáta
            </p>
            <p style={{ fontSize: '13px', color: '#979086' }}>
              Dáta sa zobrazia po prvých rezerváciách.
            </p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Analytics;