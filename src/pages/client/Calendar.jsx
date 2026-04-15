import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSlots } from '../../services/slotService';
import { getBookingsForClient, createBooking } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getDocuments } from '../../firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SLOT_STATUS, BOOKING_STATUS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const MONTHS = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
const DAYS   = ['Po','Ut','St','Št','Pi','So','Ne'];
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

const SLOT_COLORS = {
  available:   { bg: 'rgba(74,124,89,0.1)',   border: '#6DB88A', text: '#6DB88A',  label: 'Voľný' },
  last_minute: { bg: 'rgba(212,197,176,0.3)', border: '#FF929A', text: '#FF929A', label: 'Last Minute' },
  booked:      { bg: 'rgba(58,90,124,0.1)',   border: '#7691AD', text: '#7691AD',  label: 'Moja rezervácia' },
  blocked:     { bg: 'rgba(180,172,163,0.15)',border: '#53728A', text: '#7691AD',  label: 'Obsadený' },
};

const Calendar = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const salons = await getDocuments(collection(db, 'salons'));
      const allSlots = [], allBookings = [], allServices = [];
      await Promise.all(salons.map(async salon => {
        const [sl, bk, sv] = await Promise.all([
          getSlots(salon.id),
          getBookingsForClient(salon.id, firebaseUser.uid),
          getServices(salon.id),
        ]);
        allSlots.push(...sl.map(s => ({ ...s, salonId: salon.id })));
        allBookings.push(...bk);
        allServices.push(...sv);
      }));
      setSlots(allSlots); setBookings(allBookings); setServices(allServices);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name || '';
  const getServicePrice = (id) => { const s = services.find(s => s.id === id); return s ? `${s.price} €` : ''; };

  const getSlotColor = (slot) => {
    const isMyBooking = bookings.some(b => b.slotId === slot.id && b.status !== BOOKING_STATUS.CANCELLED);
    if (isMyBooking) return SLOT_COLORS.booked;
    return SLOT_COLORS[slot.status] || SLOT_COLORS.blocked;
  };

  const getSlotsForDay = (dateStr) => slots.filter(s => s.date === dateStr);

  const handleBook = async (slot) => {
    const isMyBooking = bookings.some(b => b.slotId === slot.id && b.status !== BOOKING_STATUS.CANCELLED);
    if (isMyBooking) { toast.error('Tento slot už máš rezervovaný.'); return; }
    if (slot.status === SLOT_STATUS.BOOKED || slot.status === SLOT_STATUS.BLOCKED) { toast.error('Nie je dostupný.'); return; }
    setBooking(true);
    try {
      await createBooking(slot.salonId, firebaseUser.uid, slot.id, slot.serviceId);
      toast.success('Rezervácia potvrdená!'); loadData();
    } catch { toast.error('Chyba pri rezervácii.'); }
    finally { setBooking(false); }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); setSelectedDate(null); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const selectedDateStr = selectedDate ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  const selectedSlots = selectedDateStr ? getSlotsForDay(selectedDateStr) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1F36' }}>
      <header style={{ background: '#142F52', borderBottom: '1px solid #E2E2DE', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(28,28,27,0.04)' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#FF929A' }}>BeautyTime</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}>Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}>Marketplace</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notifications')}>Notifikácie</button>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '8px' }}>Prehľad</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#E8F0F8' }}>Kalendár termínov</h2>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {Object.entries(SLOT_COLORS).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: v.bg, border: `1.5px solid ${v.border}` }} />
              <span style={{ fontSize: '11px', color: '#7691AD' }}>{v.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '24px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#FF929A', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#E8F0F8' }}>{MONTHS[month]} {year}</p>
            <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #E2E2DE', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#FF929A', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#53728A', fontWeight: 500, padding: '4px', letterSpacing: '0.08em' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daySlots = getSlotsForDay(dateStr);
              const hasSlots = daySlots.length > 0;
              const isToday = dateStr === todayStr;
              const isSelected = selectedDate === day;
              const hasMyBooking = daySlots.some(s => bookings.some(b => b.slotId === s.id && b.status !== BOOKING_STATUS.CANCELLED));
              const hasLastMinute = daySlots.some(s => s.status === SLOT_STATUS.LAST_MINUTE);
              const hasAvailable = daySlots.some(s => s.status === SLOT_STATUS.AVAILABLE);
              return (
                <div key={day} onClick={() => setSelectedDate(day)} style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', cursor: hasSlots ? 'pointer' : 'default', background: isSelected ? '#FF929A' : isToday ? 'rgba(106,93,82,0.08)' : 'transparent', border: isToday && !isSelected ? '1.5px solid #D4C5B0' : '1.5px solid transparent', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '13px', color: isSelected ? '#0A1F36' : '#E8F0F8', fontWeight: hasSlots ? 500 : 300, fontFamily: 'Jost, sans-serif' }}>{day}</span>
                  {hasSlots && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '3px' }}>
                      {hasMyBooking && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7691AD' }} />}
                      {hasLastMinute && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FF929A' }} />}
                      {hasAvailable && !hasMyBooking && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6DB88A' }} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDateStr && (
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '16px' }}>
              {selectedDate}. {MONTHS[month]} {year}
            </p>
            {selectedSlots.length === 0 ? (
              <div style={{ background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#E8F0F8', marginBottom: '6px' }}>Žiadne termíny</p>
                <p style={{ fontSize: '13px', color: '#7691AD' }}>Pre tento deň nie sú žiadne sloty.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedSlots.map(slot => {
                  const color = getSlotColor(slot);
                  const isMyBooking = bookings.some(b => b.slotId === slot.id && b.status !== BOOKING_STATUS.CANCELLED);
                  const isBookable = !isMyBooking && (slot.status === SLOT_STATUS.AVAILABLE || slot.status === SLOT_STATUS.LAST_MINUTE);
                  return (
                    <div key={slot.id} style={{ padding: '18px 20px', borderRadius: '16px', border: `1.5px solid ${color.border}`, background: color.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 500, color: '#E8F0F8', marginBottom: '4px', fontFamily: 'Jost, sans-serif', fontSize: '14px' }}>{slot.time} — {getServiceName(slot.serviceId)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: color.text, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{color.label}</span>
                          <span style={{ fontSize: '12px', color: '#7691AD' }}>{getServicePrice(slot.serviceId)}</span>
                        </div>
                      </div>
                      {isBookable && (
                        <button disabled={booking} onClick={() => handleBook(slot)} style={{ padding: '9px 18px', background: '#FF929A', color: '#0A1F36', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: booking ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif', opacity: booking ? 0.6 : 1, flexShrink: 0 }}>
                          {booking ? '...' : 'Rezervovať'}
                        </button>
                      )}
                      {isMyBooking && <span style={{ fontSize: '11px', color: '#7691AD', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>Tvoja rezervácia</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
