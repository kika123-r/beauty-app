// src/pages/client/BookingFlow.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { createBooking } from '../../services/bookingService';
import { getSalon } from '../../services/salonService';
import { SLOT_STATUS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const MONTHS = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
const DAYS   = ['Po','Ut','St','Št','Pi','So','Ne'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const BookingFlow = () => {
  const { salonId } = useParams();
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [step, setStep]                       = useState(1);
  const [salon, setSalon]                     = useState(null);
  const [services, setServices]               = useState([]);
  const [allSlots, setAllSlots]               = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate]       = useState('');
  const [selectedSlot, setSelectedSlot]       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [year, setYear]                       = useState(today.getFullYear());
  const [month, setMonth]                     = useState(today.getMonth());

  useEffect(() => { loadInitialData(); }, [salonId]);

  const loadInitialData = async () => {
    const [salonData, servicesData, slotsData] = await Promise.all([
      getSalon(salonId),
      getServices(salonId),
      getSlots(salonId),
    ]);
    setSalon(salonData);
    setServices(servicesData);
    setAllSlots(slotsData);
  };

  const getAvailableDatesForService = (service) => {
    if (!service) return new Set();
    return new Set(
      allSlots
        .filter((s) =>
          s.serviceId === service.id &&
          (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) &&
          s.date >= todayStr
        )
        .map((s) => s.date)
    );
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate || !selectedService) return [];
    return allSlots.filter((s) =>
      s.date === selectedDate &&
      s.serviceId === selectedService.id &&
      (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE)
    );
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await createBooking(salonId, firebaseUser.uid, selectedSlot.id, selectedService.id);
      toast.success('Rezervácia potvrdená!');
      navigate(ROUTES.CLIENT_DASHBOARD);
    } catch {
      toast.error('Chyba pri rezervácii. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const availableDates = getAvailableDatesForService(selectedService);
  const slotsForDate   = getSlotsForSelectedDate();
  const daysInMonth    = getDaysInMonth(year, month);
  const firstDay       = getFirstDayOfMonth(year, month);

  const btnStyle = {
    padding: '13px 28px',
    background: '#6A5D52', color: '#F5F0EA',
    border: 'none', borderRadius: '12px',
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
    transition: 'all 0.2s',
  };

  const btnGhostStyle = {
    padding: '13px 28px',
    background: 'transparent', color: '#979086',
    border: '1px solid #E2E2DE', borderRadius: '12px',
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA' }}>

      {/* Header */}
      <header style={{
        background: '#FFFFFF', borderBottom: '1px solid #E2E2DE',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 12px rgba(28,28,27,0.04)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#979086', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.08em', fontFamily: 'Jost, sans-serif' }}>
          ← Späť
        </button>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#6A5D52' }}>BeautyTime</span>
        <div style={{ width: '60px' }} />
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Salon info */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
            Rezervácia
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>{salon?.name}</h2>
          <p style={{ fontSize: '13px', color: '#979086' }}>{salon?.address}</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: s < 3 ? 1 : 'none' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: s <= step ? '#6A5D52' : '#E2E2DE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 500,
                color: s <= step ? '#F5F0EA' : '#979086',
                transition: 'all 0.3s', flexShrink: 0,
                fontFamily: 'Jost, sans-serif',
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ flex: 1, height: '1px', background: s < step ? '#6A5D52' : '#E2E2DE', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Služba */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Vyber službu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                const availableCount = allSlots.filter((s) =>
                  s.serviceId === service.id &&
                  (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) &&
                  s.date >= todayStr
                ).length;

                return (
                  <div
                    key={service.id}
                    onClick={() => { setSelectedService(service); setSelectedDate(''); setSelectedSlot(null); }}
                    style={{
                      padding: '20px 24px', background: '#FFFFFF',
                      border: `1.5px solid ${isSelected ? '#6A5D52' : '#E2E2DE'}`,
                      borderRadius: '16px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 20px rgba(106,93,82,0.1)' : '0 2px 8px rgba(28,28,27,0.04)',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '15px', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>
                        {service.name}
                      </p>
                      <p style={{ fontSize: '13px', color: '#979086' }}>{service.duration} min</p>
                      {availableCount > 0 ? (
                        <p style={{ fontSize: '11px', color: '#4A7C59', marginTop: '4px', fontWeight: 500 }}>
                          {availableCount} voľných termínov
                        </p>
                      ) : (
                        <p style={{ fontSize: '11px', color: '#979086', marginTop: '4px' }}>
                          Momentálne nedostupné
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B' }}>
                        {service.price} €
                      </p>
                      {isSelected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6A5D52', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: '4px' }}>
                          <span style={{ color: '#F5F0EA', fontSize: '11px' }}>✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              style={{ ...btnStyle, width: '100%', opacity: selectedService ? 1 : 0.4 }}
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Pokračovať →
            </button>
          </div>
        )}

        {/* Step 2 — Kalendár */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Vyber termín</h3>

            {/* Kalendár */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E2DE',
              borderRadius: '20px', padding: '24px', marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
            }}>
              {/* Navigácia */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#6A5D52', fontSize: '14px' }}>←</button>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1C1C1B' }}>
                  {MONTHS[month]} {year}
                </p>
                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#6A5D52', fontSize: '14px' }}>→</button>
              </div>

              {/* Dni v týždni */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#B7AC9B', fontWeight: 500, padding: '4px', letterSpacing: '0.05em' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Dni */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day     = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isAvailable  = availableDates.has(dateStr);
                  const isPast       = dateStr < todayStr;
                  const isToday      = dateStr === todayStr;
                  const isSelected   = selectedDate === dateStr;
                  const hasLastMin   = isAvailable && allSlots.some((s) =>
                    s.date === dateStr && s.serviceId === selectedService?.id && s.status === SLOT_STATUS.LAST_MINUTE
                  );

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (!isAvailable || isPast) return;
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        cursor: isAvailable && !isPast ? 'pointer' : 'default',
                        background: isSelected
                          ? '#6A5D52'
                          : isAvailable && !isPast
                            ? hasLastMin ? 'rgba(212,197,176,0.3)' : 'rgba(106,93,82,0.08)'
                            : 'transparent',
                        border: isToday && !isSelected ? '1.5px solid #D4C5B0' : '1.5px solid transparent',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      <span style={{
                        fontSize: '13px',
                        color: isSelected ? '#F5F0EA' : isPast ? '#D4C5B0' : isAvailable ? '#1C1C1B' : '#C4B49A',
                        fontWeight: isAvailable && !isPast ? 500 : 300,
                        fontFamily: 'Jost, sans-serif',
                      }}>
                        {day}
                      </span>
                      {isAvailable && !isPast && !isSelected && (
                        <div style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: hasLastMin ? '#D4C5B0' : '#6A5D52',
                          margin: '2px auto 0',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F0EA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6A5D52' }} />
                  <span style={{ fontSize: '11px', color: '#979086' }}>Voľný</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4C5B0' }} />
                  <span style={{ fontSize: '11px', color: '#979086' }}>Last Minute</span>
                </div>
              </div>
            </div>

            {/* Časy */}
            {selectedDate && slotsForDate.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#979086', marginBottom: '12px' }}>
                  Dostupné časy
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {slotsForDate.map((slot) => {
                    const isSelected   = selectedSlot?.id === slot.id;
                    const isLastMinute = slot.status === SLOT_STATUS.LAST_MINUTE;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '12px 8px',
                          background: isSelected ? '#6A5D52' : '#FFFFFF',
                          border: `1.5px solid ${isSelected ? '#6A5D52' : isLastMinute ? '#D4C5B0' : '#E2E2DE'}`,
                          borderRadius: '12px',
                          cursor: 'pointer', textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <p style={{ fontWeight: 500, color: isSelected ? '#F5F0EA' : '#1C1C1B', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>
                          {slot.time}
                        </p>
                        {isLastMinute && !isSelected && (
                          <p style={{ fontSize: '9px', color: '#A89070', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Last min
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDate && slotsForDate.length === 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1C1C1B', marginBottom: '4px' }}>Žiadne voľné časy</p>
                <p style={{ fontSize: '13px', color: '#979086' }}>Vyber iný dátum</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnGhostStyle} onClick={() => setStep(1)}>← Späť</button>
              <button
                style={{ ...btnStyle, flex: 1, opacity: selectedSlot ? 1 : 0.4 }}
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                Pokračovať →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Potvrdenie */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Potvrdenie</h3>

            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E2DE',
              borderRadius: '20px', overflow: 'hidden', marginBottom: '28px',
              boxShadow: '0 4px 20px rgba(28,28,27,0.06)',
            }}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #D4C5B0, #6A5D52)' }} />
              <div style={{ padding: '28px' }}>
                {[
                  { label: 'Salón',   value: salon?.name,             sub: salon?.address },
                  { label: 'Služba',  value: selectedService?.name,   sub: `${selectedService?.duration} min · ${selectedService?.price} €` },
                  { label: 'Termín',  value: selectedDate,            sub: `o ${selectedSlot?.time}` },
                ].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div style={{ height: '1px', background: '#F5F0EA', margin: '20px 0' }} />}
                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#979086', marginBottom: '6px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '15px', marginBottom: '2px', fontFamily: 'Jost, sans-serif' }}>
                      {item.value}
                    </p>
                    <p style={{ fontSize: '13px', color: '#979086' }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnGhostStyle} onClick={() => setStep(2)}>← Späť</button>
              <button
                style={{ ...btnStyle, flex: 1, opacity: loading ? 0.6 : 1 }}
                disabled={loading}
                onClick={handleBook}
              >
                {loading ? 'Rezervujem...' : 'Potvrdiť rezerváciu'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingFlow;