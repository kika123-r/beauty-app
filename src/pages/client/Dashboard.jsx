import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForClient, cancelBooking } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { getDocuments } from '../../firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logoutUser } from '../../firebase/auth';
import { BOOKING_STATUS, ROUTES } from '../../constants';
import { createRating, hasRated } from '../../services/ratingService';
import { getRepeatBookings, createRepeatBooking, deleteRepeatBooking } from '../../services/repeatBookingService';
import { sendBookingCancellation } from '../../services/emailService';
import toast from 'react-hot-toast';

const C = { green: '#6D6943', brown: '#48372F', cream: '#F4F3EE', pink: '#C8A1B1', muted: '#9B8E7E', border: '#E8E4DC', white: '#FFFFFF' };

const STATUS_CONFIG = {
  confirmed: { label: 'Potvrdená', color: '#5A7A4A', bg: 'rgba(90,122,74,0.08)' },
  pending:   { label: 'Čaká',      color: '#8B6914', bg: 'rgba(139,105,20,0.08)' },
  cancelled: { label: 'Zrušená',   color: '#A05050', bg: 'rgba(160,80,80,0.08)' },
  completed: { label: 'Dokončená', color: '#4A6A8A', bg: 'rgba(74,106,138,0.08)' },
  no_show:   { label: 'No-show',   color: '#A05050', bg: 'rgba(160,80,80,0.08)' },
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
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratedBookings, setRatedBookings] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [repeatBookings, setRepeatBookings] = useState([]);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [repeatService, setRepeatService] = useState('');
  const [repeatInterval, setRepeatInterval] = useState('weekly');
  const [repeatTime, setRepeatTime] = useState('10:00');
  const [savingRepeat, setSavingRepeat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { loadData(); loadRepeatBookings(); }, []);

  const loadData = async () => {
    try {
      const salonsData = await getDocuments(collection(db, 'salons'));
      setSalons(salonsData);
      const allBookings = [], allServices = [], allSlots = [];
      await Promise.all(salonsData.map(async (salon) => {
        const [b, sv, sl] = await Promise.all([
          getBookingsForClient(salon.id, firebaseUser.uid),
          getServices(salon.id),
          getSlots(salon.id),
        ]);
        allBookings.push(...b.map(booking => ({ ...booking, salonId: salon.id })));
        allServices.push(...sv.map(service => ({ ...service, salonId: salon.id })));
        allSlots.push(...sl.map(slot => ({ ...slot, salonId: salon.id })));
      }));
      setBookings(allBookings); setServices(allServices); setSlots(allSlots);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadRepeatBookings = async () => {
    try {
      const salons = await getDocuments(collection(db, 'salons'));
      const all = [];
      await Promise.all(salons.map(async salon => {
        const rb = await getRepeatBookings(salon.id, firebaseUser.uid);
        all.push(...rb.map(r => ({ ...r, salonId: salon.id })));
      }));
      setRepeatBookings(all);
    } catch (err) { console.error(err); }
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Služba';
  const getServicePrice = (id) => { const s = services.find(s => s.id === id); return s ? `${s.price} €` : ''; };
  const getSlotInfo = (id) => slots.find(s => s.id === id);
  const getSalonName = (id) => salons.find(s => s.id === id)?.name || '';
  const getSalonSlug = (id) => salons.find(s => s.id === id)?.slug || '';

  const handleCancel = async (booking) => {
    if (!window.confirm('Zrušiť túto rezerváciu?')) return;
    try {
      await cancelBooking(booking.salonId, booking.id, booking.slotId);
      const slot = slots.find(s => s.id === booking.slotId);
      await sendBookingCancellation({ clientEmail: firebaseUser.email, serviceName: getServiceName(booking.serviceId), date: slot?.date || '', time: slot?.time || '' });
      toast.success('Rezervácia zrušená.');
      loadData();
    } catch { toast.error('Chyba. Skús znova.'); }
  };

  const handleRate = async () => {
    if (!ratingModal) return;
    setSubmittingRating(true);
    try {
      await createRating(ratingModal.salonId, firebaseUser.uid, ratingModal.id, ratingValue, ratingComment);
      setRatedBookings(prev => [...prev, ratingModal.id]);
      setRatingModal(null); setRatingValue(5); setRatingComment('');
      toast.success('Ďakujeme za hodnotenie!');
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setSubmittingRating(false); }
  };

  const handleSaveRepeat = async () => {
    if (!repeatService) { toast.error('Vyber službu.'); return; }
    setSavingRepeat(true);
    try {
      const salonsData = await getDocuments(collection(db, 'salons'));
      const salon = salonsData[0];
      await createRepeatBooking(salon.id, firebaseUser.uid, repeatService, repeatInterval, new Date().toISOString().split('T')[0], repeatTime);
      toast.success('Opakovaná rezervácia nastavená!');
      setShowRepeatModal(false); loadRepeatBookings();
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setSavingRepeat(false); }
  };

  const handleDeleteRepeat = async (repeat) => {
    if (!window.confirm('Zrušiť opakovanú rezerváciu?')) return;
    await deleteRepeatBooking(repeat.salonId, repeat.id);
    toast.success('Zrušená.'); loadRepeatBookings();
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate(ROUTES.LOGIN);
  };

  const upcomingBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING);
  const pastBookings = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.NO_SHOW);
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const initials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const firstSalon = salons[0];
  const firstSalonSlug = firstSalon ? getSalonSlug(firstSalon.id) : '';

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: 'Jost, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .dash-nav-links { display: none !important; }
          .dash-menu-btn { display: flex !important; }
          .dash-mobile-menu { display: ${menuOpen ? 'flex' : 'none'} !important; }
          .dash-stats { grid-template-columns: repeat(3, 1fr) !important; }
          .dash-content { padding: 24px 16px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: C.brown }}>{firstSalon?.name || 'BeautyTime'}</span>

          <div className="dash-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {firstSalonSlug && (
              <>
                <button onClick={() => navigate(`/s/${firstSalonSlug}/calendar`)} style={{ padding: '8px 14px', background: 'none', border: 'none', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', borderRadius: '8px' }}>Kalendár</button>
                <button onClick={() => navigate('/marketplace')} style={{ padding: '8px 14px', background: 'none', border: 'none', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', borderRadius: '8px' }}>Marketplace</button>
                <button onClick={() => navigate('/notifications')} style={{ padding: '8px 14px', background: 'none', border: 'none', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', borderRadius: '8px' }}>Notifikácie</button>
              </>
            )}
            <div onClick={handleLogout} style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.brown, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: C.cream, cursor: 'pointer', marginLeft: '8px' }}>
              {initials}
            </div>
          </div>

          <button className="dash-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '22px', height: '2px', background: C.brown, borderRadius: '1px' }} />)}
          </button>
        </div>

        <div className="dash-mobile-menu" style={{ display: 'none', flexDirection: 'column', padding: '16px 24px', gap: '4px', borderTop: `1px solid ${C.border}`, background: C.white }}>
          {firstSalonSlug && (
            <>
              <button onClick={() => { navigate(`/s/${firstSalonSlug}/calendar`); setMenuOpen(false); }} style={{ padding: '12px 0', background: 'none', border: 'none', color: C.brown, fontSize: '14px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'left', borderBottom: `1px solid ${C.border}` }}>Kalendár</button>
              <button onClick={() => { navigate('/marketplace'); setMenuOpen(false); }} style={{ padding: '12px 0', background: 'none', border: 'none', color: C.brown, fontSize: '14px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'left', borderBottom: `1px solid ${C.border}` }}>Marketplace</button>
              <button onClick={() => { navigate('/notifications'); setMenuOpen(false); }} style={{ padding: '12px 0', background: 'none', border: 'none', color: C.brown, fontSize: '14px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'left', borderBottom: `1px solid ${C.border}` }}>Notifikácie</button>
            </>
          )}
          <button onClick={handleLogout} style={{ padding: '12px 0', background: 'none', border: 'none', color: '#A05050', fontSize: '14px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'left' }}>Odhlásiť sa</button>
        </div>
      </header>

      <div className="dash-content" style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Vitaj */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.green, marginBottom: '8px' }}>Vitajte späť</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: C.brown, fontWeight: 400, marginBottom: '4px' }}>{userProfile?.name?.split(' ')[0]}</h1>
          <p style={{ color: C.muted, fontSize: '14px' }}>Váš osobný beauty priestor</p>
        </div>

        {/* Salon karta */}
        {firstSalon && (
          <div style={{ background: C.brown, borderRadius: '20px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(244,243,238,0.06)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(244,243,238,0.04)' }} />
            <p style={{ fontSize: '10px', color: 'rgba(244,243,238,0.5)', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Váš salón</p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: C.cream, marginBottom: '4px', fontWeight: 400 }}>{firstSalon.name}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(244,243,238,0.5)', marginBottom: '24px' }}>{firstSalon.address}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/book/${firstSalon.id}`)} style={{ padding: '10px 20px', background: C.cream, color: C.brown, border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Rezervovať</button>
              <button onClick={() => navigate(`/s/${firstSalonSlug}/calendar`)} style={{ padding: '10px 20px', background: 'rgba(244,243,238,0.1)', color: C.cream, border: '1px solid rgba(244,243,238,0.15)', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Kalendár</button>
            </div>
          </div>
        )}

        {/* Štatistiky */}
        <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Celkom', value: bookings.length, color: C.brown },
            { label: 'Nadchádzajúce', value: upcomingBookings.length, color: C.green },
            { label: 'Dokončené', value: pastBookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length, color: '#4A6A8A' },
          ].map(stat => (
            <div key={stat.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: stat.color, marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '10px', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Opakované rezervácie */}
        {repeatBookings.length > 0 && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>Opakované rezervácie</p>
              <button onClick={() => setShowRepeatModal(true)} style={{ fontSize: '12px', color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>+ Pridať</button>
            </div>
            {repeatBookings.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C.cream, borderRadius: '10px', marginBottom: '6px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: C.brown, fontFamily: 'Jost, sans-serif' }}>{getServiceName(r.serviceId)}</p>
                  <p style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{r.interval === 'weekly' ? 'Každý týždeň' : 'Každý mesiac'} · {r.time}</p>
                </div>
                <button onClick={() => handleDeleteRepeat(r)} style={{ fontSize: '11px', color: '#A05050', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zrušiť</button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: C.white, borderRadius: '12px', padding: '4px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
          {[{ key: 'upcoming', label: 'Nadchádzajúce' }, { key: 'past', label: 'História' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: activeTab === tab.key ? C.brown : 'transparent', color: activeTab === tab.key ? C.cream : C.muted, fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: C.muted }}>Načítavam...</p></div>}

        {!loading && displayBookings.length === 0 && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: C.brown, marginBottom: '8px' }}>
              {activeTab === 'upcoming' ? 'Žiadne nadchádzajúce rezervácie' : 'Žiadna história'}
            </p>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '20px' }}>
              {activeTab === 'upcoming' ? 'Rezervujte si termín a uvidíte ho tu.' : 'Vaše dokončené rezervácie sa zobrazia tu.'}
            </p>
            {activeTab === 'upcoming' && firstSalon && (
              <button onClick={() => navigate(`/book/${firstSalon.id}`)} style={{ padding: '12px 28px', background: C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Rezervovať teraz
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayBookings.map(booking => {
            const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
            const slotInfo = getSlotInfo(booking.slotId);
            return (
              <div key={booking.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✂️</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, color: C.brown, marginBottom: '3px', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>{getServiceName(booking.serviceId)}</p>
                      {slotInfo && <p style={{ fontSize: '12px', color: C.muted, marginBottom: '2px' }}>{slotInfo.date} · {slotInfo.time}</p>}
                      <p style={{ fontSize: '12px', color: C.muted }}>{getSalonName(booking.salonId)}</p>
                      {booking.note && <p style={{ fontSize: '12px', color: C.green, marginTop: '4px', fontStyle: 'italic' }}>"{booking.note}"</p>}
                      <p style={{ fontSize: '12px', color: C.green, marginTop: '2px', fontWeight: 500 }}>{getServicePrice(booking.serviceId)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: status.color, background: status.bg, padding: '4px 10px', borderRadius: '20px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {status.label}
                    </span>
                    {booking.status === BOOKING_STATUS.COMPLETED && !ratedBookings.includes(booking.id) && (
                      <button onClick={() => setRatingModal(booking)} style={{ fontSize: '11px', color: C.pink, background: 'transparent', border: `1px solid ${C.pink}`, borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>★ Hodnotiť</button>
                    )}
                    {booking.status === BOOKING_STATUS.CONFIRMED && (
                      <button onClick={() => handleCancel(booking)} style={{ fontSize: '11px', color: '#A05050', background: 'transparent', border: '1px solid rgba(160,80,80,0.3)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Zrušiť</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(72,55,47,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: C.white, borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.green, marginBottom: '8px' }}>Hodnotenie</p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: C.brown, marginBottom: '4px', fontWeight: 400 }}>{getServiceName(ratingModal.serviceId)}</h3>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>{getSalonName(ratingModal.salonId)}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRatingValue(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: star <= ratingValue ? C.pink : C.border, transition: 'color 0.15s' }}>★</button>
              ))}
            </div>
            <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Váš komentár (nepovinné)..." rows={3}
              style={{ width: '100%', padding: '12px 16px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif', resize: 'vertical', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setRatingModal(null)} style={{ padding: '12px 20px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zrušiť</button>
              <button onClick={handleRate} disabled={submittingRating} style={{ flex: 1, padding: '12px', background: submittingRating ? C.muted : C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: submittingRating ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
                {submittingRating ? 'Odosielam...' : 'Odoslať hodnotenie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeat Modal */}
      {showRepeatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(72,55,47,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: C.white, borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.green, marginBottom: '8px' }}>Nastavenie</p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: C.brown, marginBottom: '28px', fontWeight: 400 }}>Opakovaná rezervácia</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Služba</label>
              <select value={repeatService} onChange={e => setRepeatService(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif' }}>
                <option value=''>Vyber službu...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Opakovanie</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ val: 'weekly', label: 'Každý týždeň' }, { val: 'monthly', label: 'Každý mesiac' }].map(opt => (
                  <button key={opt.val} onClick={() => setRepeatInterval(opt.val)} style={{ flex: 1, padding: '10px', background: repeatInterval === opt.val ? C.brown : 'transparent', color: repeatInterval === opt.val ? C.cream : C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Preferovaný čas</label>
              <input type='time' value={repeatTime} onChange={e => setRepeatTime(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowRepeatModal(false)} style={{ padding: '12px 20px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zrušiť</button>
              <button onClick={handleSaveRepeat} disabled={savingRepeat} style={{ flex: 1, padding: '12px', background: savingRepeat ? C.muted : C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: savingRepeat ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
                {savingRepeat ? 'Ukladám...' : 'Uložiť'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
