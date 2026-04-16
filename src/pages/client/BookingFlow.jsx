import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { createBooking } from '../../services/bookingService';
import { getSalon } from '../../services/salonService';
import { getDocuments, usersCol } from '../../firebase/firestore';
import { sendBookingConfirmation } from '../../services/emailService';
import { addToWaitingList } from '../../services/waitingListService';
import { getWorkers } from '../../services/workerService';
import { SLOT_STATUS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const MONTHS = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
const DAYS   = ['Po','Ut','St','Št','Pi','So','Ne'];
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

const BookingFlow = () => {
  const { salonId } = useParams();
  const { firebaseUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [step, setStep]                 = useState(1);
  const [salon, setSalon]               = useState(null);
  const [services, setServices]         = useState([]);
  const [allSlots, setAllSlots]         = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [workers, setWorkers]             = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [waitingLoading, setWaitingLoading] = useState(false);
  const [onWaitingList, setOnWaitingList] = useState(false);
  const [note, setNote] = useState('');
  const [year, setYear]                 = useState(today.getFullYear());
  const [month, setMonth]               = useState(today.getMonth());

  useEffect(() => { loadInitialData(); }, [salonId]);

  const loadInitialData = async () => {
    const [salonData, servicesData, slotsData, workersData] = await Promise.all([
      getSalon(salonId), getServices(salonId), getSlots(salonId), getWorkers(salonId),
    ]);
    setWorkers(workersData);
    setSalon(salonData); setServices(servicesData); setAllSlots(slotsData);
  };

  const getAvailableDatesForService = (service) => {
    if (!service) return new Set();
    return new Set(allSlots.filter(s =>
      s.serviceId === service.id &&
      (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) &&
      s.date >= todayStr
    ).map(s => s.date));
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate || !selectedService) return [];
    return allSlots.filter(s =>
      s.date === selectedDate && s.serviceId === selectedService.id &&
      (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE)
    );
  };

  const handleWaitingList = async () => {
    if (!selectedService) return;
    setWaitingLoading(true);
    try {
      await addToWaitingList(salonId, selectedService.id, firebaseUser.uid, firebaseUser.email, firebaseUser.displayName || 'Klient');
      setOnWaitingList(true);
      toast.success('Pridaný na čakaciu listinu! Upozorníme vás keď sa uvoľní termín.');
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setWaitingLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await createBooking(salonId, firebaseUser.uid, selectedSlot.id, selectedService.id, note, selectedWorker?.id || null);

      // Odoslať email potvrdenie
      const clientEmail = firebaseUser.email;
      if (clientEmail) {
        await sendBookingConfirmation({
          clientEmail,
          salonName: salon?.name || 'Salón',
          serviceName: selectedService.name,
          date: selectedDate,
          time: selectedSlot.time,
          price: selectedService.price,
        });
      }

      toast.success('Rezervácia potvrdená! Potvrdenie sme poslali na váš email.');
      navigate(ROUTES.CLIENT_DASHBOARD);
    } catch {
      toast.error('Chyba pri rezervácii. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); setSelectedDate(''); setSelectedSlot(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); setSelectedDate(''); setSelectedSlot(null); };

  const availableDates = getAvailableDatesForService(selectedService);
  const slotsForDate = getSlotsForSelectedDate();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const btnStyle = { padding: '13px 28px', background: '#C8A882', color: '#222222', border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' };
  const btnGhostStyle = { padding: '13px 28px', background: 'transparent', color: '#C8A882', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' };

  return (
    <div style={{ minHeight: '100vh', background: '#222222' }}>
      <header style={{ background: '#383838', borderBottom: '1px solid #E2E2DE', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(28,28,27,0.04)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#C8A882', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.08em', fontFamily: 'Jost, sans-serif' }}>← Späť</button>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C8A882' }}>BeautyTime</span>
        <div style={{ width: '60px' }} />
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '8px' }}>Rezervácia</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>{salon?.name}</h2>
          <p style={{ fontSize: '13px', color: '#C8A882' }}>{salon?.address}</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: s < 3 ? 1 : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s <= step ? '#C8A882' : 'rgba(255,244,225,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: s <= step ? '#222222' : '#C8A882', flexShrink: 0, fontFamily: 'Jost, sans-serif' }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ flex: 1, height: '1px', background: s < step ? '#C8A882' : 'rgba(255,244,225,0.1)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Služba */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Vyber službu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {services.map(service => {
                const isSelected = selectedService?.id === service.id;
                const availableCount = allSlots.filter(s =>
                  s.serviceId === service.id &&
                  (s.status === SLOT_STATUS.AVAILABLE || s.status === SLOT_STATUS.LAST_MINUTE) &&
                  s.date >= todayStr
                ).length;
                return (
                  <div key={service.id} onClick={() => { setSelectedService(service); setSelectedDate(''); setSelectedSlot(null); }}
                    style={{ padding: '20px 24px', background: '#383838', border: `1.5px solid ${isSelected ? '#C8A882' : 'rgba(255,244,225,0.1)'}`, borderRadius: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: isSelected ? '0 4px 20px rgba(106,93,82,0.1)' : '0 2px 8px rgba(28,28,27,0.04)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: '#FFF4E1', fontSize: '15px', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>{service.name}</p>
                      <p style={{ fontSize: '13px', color: '#C8A882' }}>{service.duration} min</p>
                      <p style={{ fontSize: '11px', color: availableCount > 0 ? '#7A9E7E' : '#C8A882', marginTop: '4px', fontWeight: 500 }}>
                        {availableCount > 0 ? `${availableCount} voľných termínov` : 'Momentálne nedostupné'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#FFF4E1' }}>{service.price} €</p>
                      {isSelected && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: '4px' }}><span style={{ color: '#222222', fontSize: '11px' }}>✓</span></div>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Výber pracovníka */}
            {selectedService && (() => {
              const serviceWorkers = workers.filter(w => (w.serviceIds || []).includes(selectedService.id));
              return serviceWorkers.length > 0 ? (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '12px' }}>Vyber pracovníka</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div onClick={() => setSelectedWorker(null)} style={{ padding: '12px 16px', background: !selectedWorker ? 'rgba(106,93,82,0.06)' : '#383838', border: `1.5px solid ${!selectedWorker ? '#C8A882' : 'rgba(255,244,225,0.1)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFF4E1', fontFamily: 'Jost, sans-serif' }}>Ktokoľvek dostupný</p>
                        <p style={{ fontSize: '11px', color: '#C8A882' }}>Prvý voľný pracovník</p>
                      </div>
                    </div>
                    {serviceWorkers.map(worker => (
                      <div key={worker.id} onClick={() => setSelectedWorker(worker)} style={{ padding: '12px 16px', background: selectedWorker?.id === worker.id ? 'rgba(106,93,82,0.06)' : '#383838', border: `1.5px solid ${selectedWorker?.id === worker.id ? '#C8A882' : 'rgba(255,244,225,0.1)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #B7AC9B)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {worker.photoUrl ? <img src={worker.photoUrl} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#222222' }}>{worker.name?.charAt(0)}</span>}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFF4E1', fontFamily: 'Jost, sans-serif' }}>{worker.name}</p>
                          <p style={{ fontSize: '11px', color: '#C8A882' }}>{worker.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            <button style={{ ...btnStyle, width: '100%', opacity: selectedService ? 1 : 0.4 }} disabled={!selectedService} onClick={() => setStep(2)}>Pokračovať →</button>
            {selectedService && getAvailableDatesForService(selectedService).size === 0 && (
              <div style={{ marginTop: '16px', background: '#383838', border: '1px solid #E2E2DE', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#C8A882', marginBottom: '12px' }}>Momentálne nie sú voľné termíny pre túto službu.</p>
                {onWaitingList ? (
                  <p style={{ fontSize: '13px', color: '#7A9E7E', fontWeight: 500 }}>✓ Ste na čakacej listine</p>
                ) : (
                  <button onClick={handleWaitingList} disabled={waitingLoading} style={{ padding: '10px 20px', background: 'transparent', color: '#C8A882', border: '1px solid #6A5D52', borderRadius: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    {waitingLoading ? 'Pridávam...' : '+ Čakacia listina'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Kalendár */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Vyber termín</h3>
            <div style={{ background: '#383838', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#C8A882', fontSize: '14px' }}>←</button>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#FFF4E1' }}>{MONTHS[month]} {year}</p>
                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#C8A882', fontSize: '14px' }}>→</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#7A6A52', fontWeight: 500, padding: '4px', letterSpacing: '0.05em' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isAvailable = availableDates.has(dateStr);
                  const isPast = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  const isSelected = selectedDate === dateStr;
                  const hasLastMin = isAvailable && allSlots.some(s => s.date === dateStr && s.serviceId === selectedService?.id && s.status === SLOT_STATUS.LAST_MINUTE);
                  return (
                    <div key={day} onClick={() => { if (!isAvailable || isPast) return; setSelectedDate(dateStr); setSelectedSlot(null); }}
                      style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', cursor: isAvailable && !isPast ? 'pointer' : 'default', background: isSelected ? '#C8A882' : isAvailable && !isPast ? hasLastMin ? 'rgba(212,197,176,0.3)' : 'rgba(106,93,82,0.08)' : 'transparent', border: isToday && !isSelected ? '1.5px solid #D4C5B0' : '1.5px solid transparent' }}>
                      <span style={{ fontSize: '13px', color: isSelected ? '#222222' : isPast ? '#7A6A52' : isAvailable ? '#FFF4E1' : '#C4B49A', fontWeight: isAvailable && !isPast ? 500 : 300, fontFamily: 'Jost, sans-serif' }}>{day}</span>
                      {isAvailable && !isPast && !isSelected && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: hasLastMin ? '#7A6A52' : '#C8A882', margin: '2px auto 0' }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F0EA' }}>
                {[{ bg: '#C8A882', label: 'Voľný' }, { bg: '#7A6A52', label: 'Last Minute' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.bg }} />
                    <span style={{ fontSize: '11px', color: '#C8A882' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDate && slotsForDate.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '12px' }}>Dostupné časy</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {slotsForDate.map(slot => {
                    const isSel = selectedSlot?.id === slot.id;
                    const isLM = slot.status === SLOT_STATUS.LAST_MINUTE;
                    return (
                      <div key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ padding: '12px 8px', background: isSel ? '#C8A882' : '#383838', border: `1.5px solid ${isSel ? '#C8A882' : isLM ? '#7A6A52' : 'rgba(255,244,225,0.1)'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
                        <p style={{ fontWeight: 500, color: isSel ? '#222222' : '#FFF4E1', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>{slot.time}</p>
                        {isLM && !isSel && <p style={{ fontSize: '9px', color: '#C8A882', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Last min</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDate && slotsForDate.length === 0 && (
              <div style={{ background: '#383838', border: '1px solid #E2E2DE', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#FFF4E1', marginBottom: '4px' }}>Žiadne voľné časy</p>
                <p style={{ fontSize: '13px', color: '#C8A882' }}>Vyber iný dátum</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnGhostStyle} onClick={() => setStep(1)}>← Späť</button>
              <button style={{ ...btnStyle, flex: 1, opacity: selectedSlot ? 1 : 0.4 }} disabled={!selectedSlot} onClick={() => setStep(3)}>Pokračovať →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Potvrdenie */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: '20px' }}>Potvrdenie</h3>
            <div style={{ background: '#383838', border: '1px solid #E2E2DE', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 20px rgba(28,28,27,0.06)' }}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #D4C5B0, #6A5D52)' }} />
              <div style={{ padding: '28px' }}>
                {[
                  { label: 'Salón',   value: salon?.name,            sub: salon?.address },
                  { label: 'Služba',  value: selectedService?.name,  sub: `${selectedService?.duration} min · ${selectedService?.price} €` },
                  { label: 'Termín',  value: selectedDate,           sub: `o ${selectedSlot?.time}` },
                  ...(selectedWorker ? [{ label: 'Pracovník', value: selectedWorker.name, sub: selectedWorker.position }] : []),
                ].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div style={{ height: '1px', background: '#222222', margin: '20px 0' }} />}
                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '6px' }}>{item.label}</p>
                    <p style={{ fontWeight: 500, color: '#FFF4E1', fontSize: '15px', marginBottom: '2px', fontFamily: 'Jost, sans-serif' }}>{item.value}</p>
                    <p style={{ fontSize: '13px', color: '#C8A882' }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Poznámka */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#C8A882', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Poznámka pre salón</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="napr. Alergia na farbivo, preferujem ticho..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', background: '#383838', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#FFF4E1', outline: 'none', fontFamily: 'Jost, sans-serif', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor='#C8A882'}
                onBlur={e => e.target.style.borderColor='rgba(255,244,225,0.1)'}
              />
            </div>

            {/* Email info */}
            <div style={{ background: 'rgba(106,93,82,0.06)', border: '1px solid rgba(106,93,82,0.15)', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>📧</span>
              <p style={{ fontSize: '12px', color: '#C8A882' }}>Potvrdenie pošleme na <strong>{firebaseUser?.email}</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnGhostStyle} onClick={() => setStep(2)}>← Späť</button>
              <button style={{ ...btnStyle, flex: 1, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleBook}>
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
