// src/pages/client/Marketplace.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSlots } from '../../services/slotService';
import { getServices } from '../../services/serviceService';
import { createBooking } from '../../services/bookingService';
import { getSalon } from '../../services/salonService';
import { logoutUser } from '../../firebase/auth';
import { SLOT_STATUS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const SALON_ID = 'FBSMRSSCSSRZYNcufjCQWpLx0Od2';

const Marketplace = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots]       = useState([]);
  const [services, setServices] = useState([]);
  const [salon, setSalon]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [slotsData, servicesData, salonData] = await Promise.all([
        getSlots(SALON_ID),
        getServices(SALON_ID),
        getSalon(SALON_ID),
      ]);
      setSlots(slotsData);
      setServices(servicesData);
      setSalon(salonData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getService = (serviceId) => services.find((s) => s.id === serviceId);

  const availableSlots = slots.filter((s) =>
    s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE
  );

  const filteredSlots = filter === 'last_minute'
    ? availableSlots.filter((s) => s.status === SLOT_STATUS.LAST_MINUTE)
    : availableSlots;

  const handleBook = async (slot) => {
    setBooking(slot.id);
    try {
      await createBooking(SALON_ID, firebaseUser.uid, slot.id, slot.serviceId);
      toast.success('Rezervácia potvrdená!');
      loadData();
    } catch {
      toast.error('Chyba pri rezervácii.');
    } finally {
      setBooking(null);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate(ROUTES.LOGIN);
  };

  const today = new Date().toISOString().split('T')[0];

  const todaySlots   = filteredSlots.filter((s) => s.date === today);
  const upcomingSlots = filteredSlots.filter((s) => s.date > today);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA' }}>

      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E2DE',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 12px rgba(28,28,27,0.04)',
      }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#6A5D52' }}>
          BeautyTime
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}>
            Dashboard
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>
            Kalendár
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Odhlásiť
          </button>
        </div>
      </header>

      {/* Hero sekcia */}
      <div style={{
        background: 'linear-gradient(135deg, #D4C5B0 0%, #B7AC9B 100%)',
        padding: '48px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          border: '1px solid rgba(245,240,234,0.3)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-20px',
          width: '160px', height: '160px',
          borderRadius: '50%',
          border: '1px solid rgba(245,240,234,0.2)',
        }} />
        <p style={{
          fontSize: '10px', fontWeight: 500,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(245,240,234,0.8)', marginBottom: '12px',
        }}>
          Exkluzívne ponuky
        </p>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          color: '#F5F0EA',
          fontWeight: 400,
          marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          Last Minute & Voľné termíny
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(245,240,234,0.75)', maxWidth: '400px', margin: '0 auto' }}>
          Rezervuj dostupné termíny v {salon?.name || 'salóne'} ešte dnes
        </p>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Filter */}
        <div style={{
          display: 'flex', gap: '8px',
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '28px',
          border: '1px solid #E2E2DE',
          boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
        }}>
          {[
            { key: 'all',         label: 'Všetky termíny' },
            { key: 'last_minute', label: 'Last Minute' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flex: 1, padding: '10px',
                border: 'none',
                borderRadius: '10px',
                background: filter === f.key ? '#6A5D52' : 'transparent',
                color: filter === f.key ? '#F5F0EA' : '#979086',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Jost, sans-serif',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!loading && filteredSlots.length === 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E2DE',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '16px' }}>🌿</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>
              Momentálne žiadne voľné termíny
            </p>
            <p style={{ fontSize: '13px', color: '#979086' }}>
              Skontroluj neskôr alebo si rezervuj cez kalendár
            </p>
          </div>
        )}

        {/* Dnešné sloty */}
        {todaySlots.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086' }}>
                Dnes
              </p>
              <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
              <span style={{
                fontSize: '10px', color: '#6A5D52', fontWeight: 500,
                background: 'rgba(106,93,82,0.08)',
                padding: '3px 10px', borderRadius: '20px',
                letterSpacing: '0.08em',
              }}>
                {todaySlots.length} dostupných
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todaySlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  service={getService(slot.serviceId)}
                  salon={salon}
                  onBook={handleBook}
                  isBooking={booking === slot.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Nadchádzajúce sloty */}
        {upcomingSlots.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086' }}>
                Nadchádzajúce
              </p>
              <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingSlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  service={getService(slot.serviceId)}
                  salon={salon}
                  onBook={handleBook}
                  isBooking={booking === slot.id}
                />
              ))}
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
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${isLastMinute ? '#D4C5B0' : '#E2E2DE'}`,
      borderRadius: '20px',
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: isLastMinute ? '0 4px 20px rgba(106,93,82,0.08)' : '0 2px 12px rgba(28,28,27,0.04)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {isLastMinute && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #D4C5B0, #6A5D52)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '14px',
          background: isLastMinute ? 'linear-gradient(135deg, #D4C5B0, #B7AC9B)' : '#F5F0EA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', flexShrink: 0,
        }}>
          ✂️
        </div>
        <div>
          {isLastMinute && (
            <span style={{
              fontSize: '9px', fontWeight: 600,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6A5D52',
              background: 'rgba(106,93,82,0.08)',
              padding: '2px 8px', borderRadius: '20px',
              display: 'inline-block', marginBottom: '6px',
            }}>
              Last Minute
            </span>
          )}
          <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '15px', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>
            {service?.name || 'Služba'}
          </p>
          <p style={{ fontSize: '13px', color: '#979086' }}>
            {slot.date} · {slot.time}
          </p>
          <p style={{ fontSize: '12px', color: '#6A5D52', marginTop: '2px' }}>
            {salon?.name}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#1C1C1B', marginBottom: '8px' }}>
          {service?.price} €
        </p>
        <button
          onClick={() => onBook(slot)}
          disabled={isBooking}
          style={{
            padding: '9px 20px',
            background: isBooking ? '#B7AC9B' : '#6A5D52',
            color: '#F5F0EA',
            border: 'none',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: isBooking ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'Jost, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {isBooking ? '...' : 'Rezervovať'}
        </button>
      </div>

    </div>
  );
};

export default Marketplace;