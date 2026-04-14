import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import { sendBookingCancellation } from '../../services/emailService';
import { getWaitingList } from '../../services/waitingListService';
import { getBookingsForSalon, cancelBooking } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { updateDocument, bookingsCol, usersCol, getDocuments } from '../../firebase/firestore';
import { BOOKING_STATUS } from '../../constants';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  confirmed: { label: 'Potvrdená', color: '#4A7C59', bg: 'rgba(74,124,89,0.1)' },
  pending:   { label: 'Čaká',      color: '#B07D3A', bg: 'rgba(176,125,58,0.1)' },
  cancelled: { label: 'Zrušená',   color: '#8B3A3A', bg: 'rgba(139,58,58,0.1)' },
  completed: { label: 'Dokončená', color: '#3A5A7C', bg: 'rgba(58,90,124,0.1)' },
  no_show:   { label: 'No-show',   color: '#8B3A3A', bg: 'rgba(139,58,58,0.1)' },
};

const Bookings = () => {
  const { salonId } = useAuth();
  const { hasFeature } = useTier();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const canExport = hasFeature('export');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [b, sv, sl, u] = await Promise.all([
        getBookingsForSalon(salonId),
        getServices(salonId),
        getSlots(salonId),
        getDocuments(usersCol()),
      ]);
      setBookings(b); setServices(sv); setSlots(sl); setUsers(u);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Neznáma';
  const getSlotInfo = (id) => { const s = slots.find(s => s.id === id); return s ? { date: s.date, time: s.time } : null; };
  const getClient = (id) => users.find(u => u.uid === id);

  const filtered = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterService !== 'all' && b.serviceId !== filterService) return false;
    if (filterDate) { const slot = slots.find(s => s.id === b.slotId); if (!slot || slot.date !== filterDate) return false; }
    if (search) {
      const client = getClient(b.clientId);
      const name = client?.name?.toLowerCase() || '';
      const email = client?.email?.toLowerCase() || '';
      if (!name.includes(search.toLowerCase()) && !email.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const handleStatus = async (booking, status) => {
    const slot = getSlotInfo(booking.slotId);
    const client = getClient(booking.clientId);
    try {
      if (status === BOOKING_STATUS.CANCELLED) {
        await cancelBooking(salonId, booking.id, booking.slotId);
        if (client?.email) {
          await sendBookingCancellation({
            clientEmail: client.email,
            serviceName: getServiceName(booking.serviceId),
            date: slot?.date || '',
            time: slot?.time || '',
          });
        }
        const waiting = await getWaitingList(salonId, booking.serviceId);
        if (waiting.length > 0) {
          const salonData = await import('../../services/salonService').then(m => m.getSalon(salonId));
          await Promise.all(waiting.map(w =>
            fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'last_minute',
                to: w.clientEmail,
                data: {
                  salonName: salonData?.name || 'Salón',
                  serviceName: getServiceName(booking.serviceId),
                  date: slot?.date || '',
                  time: slot?.time || '',
                  price: services.find(s => s.id === booking.serviceId)?.price || 0,
                  bookingUrl: window.location.origin + '/book/' + salonId,
                },
              }),
            })
          ));
          toast.success('Čakajúci klienti boli upozornení!');
        }
      } else {
        await updateDocument(bookingsCol(salonId), booking.id, { status });
      }
      toast.success('Status aktualizovaný!');
      loadData();
    } catch { toast.error('Chyba. Skús znova.'); }
  };

  const handleExport = () => {
    if (!canExport) { toast.error('Export je dostupný od plánu Starter.'); return; }
    const rows = [['Služba', 'Dátum', 'Čas', 'Klient', 'Email', 'Status']];
    filtered.forEach(b => {
      const slot = getSlotInfo(b.slotId);
      const client = getClient(b.clientId);
      rows.push([getServiceName(b.serviceId), slot?.date || '', slot?.time || '', client?.name || '', client?.email || '', STATUS_CONFIG[b.status]?.label || b.status]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rezervacie.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = { background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };
  const inputStyle = { padding: '10px 14px', background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '13px', color: '#1C1C1B', outline: 'none', fontFamily: 'Jost, sans-serif', cursor: 'pointer' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '860px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>Rezervácie</h2>
          </div>
          <button
            onClick={handleExport}
            style={{ padding: '10px 20px', background: canExport ? '#1C1C1B' : '#E2E2DE', color: canExport ? '#F5F0EA' : '#979086', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: canExport ? 'pointer' : 'not-allowed', fontFamily: 'Jost, sans-serif' }}
          >
            {canExport ? '↓ Export CSV' : '🔒 Export CSV'}
          </button>
        </div>

        {/* Filtre */}
        <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text" placeholder="Hľadať klienta..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: '1', minWidth: '160px' }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
            <option value="all">Všetky statusy</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterService} onChange={e => setFilterService(e.target.value)} style={inputStyle}>
            <option value="all">Všetky služby</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={inputStyle} />
          {(filterStatus !== 'all' || filterService !== 'all' || filterDate || search) && (
            <button onClick={() => { setFilterStatus('all'); setFilterService('all'); setFilterDate(''); setSearch(''); }}
              style={{ padding: '10px 14px', background: 'transparent', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '12px', color: '#979086', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              Vyčistiť
            </button>
          )}
        </div>

        {/* Počet */}
        <p style={{ fontSize: '12px', color: '#979086', marginBottom: '16px', letterSpacing: '0.05em' }}>
          {filtered.length} rezervácií
        </p>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: '#979086' }}>Načítavam...</p></div>}

        {!loading && filtered.length === 0 && (
          <div style={{ ...cardStyle, padding: '60px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>Žiadne rezervácie</p>
            <p style={{ fontSize: '13px', color: '#979086' }}>Skúste zmeniť filtre.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(booking => {
            const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
            const slot = getSlotInfo(booking.slotId);
            const client = getClient(booking.clientId);
            return (
              <div key={booking.id} style={{ ...cardStyle, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✂️</div>
                    <div>
                      <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '15px', fontFamily: 'Jost, sans-serif', marginBottom: '3px' }}>{getServiceName(booking.serviceId)}</p>
                      {slot && <p style={{ fontSize: '13px', color: '#979086' }}>{slot.date} · {slot.time}</p>}
                      {booking.note && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#B07D3A' }}>📝</span>
                        <p style={{ fontSize: '12px', color: '#979086', fontStyle: 'italic' }}>{booking.note}</p>
                      </div>
                    )}
                    {client && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(106,93,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#6A5D52' }}>
                            {client.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1B', fontFamily: 'Jost, sans-serif' }}>{client.name}</p>
                            <p style={{ fontSize: '11px', color: '#979086' }}>{client.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: status.color, background: status.bg, padding: '5px 12px', borderRadius: '20px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
                    {status.label}
                  </span>
                </div>

                {booking.status !== BOOKING_STATUS.CANCELLED && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #F5F0EA', paddingTop: '14px' }}>
                    {booking.status !== BOOKING_STATUS.COMPLETED && (
                      <button onClick={() => handleStatus(booking, BOOKING_STATUS.COMPLETED)}
                        style={{ padding: '7px 14px', background: 'transparent', color: '#4A7C59', border: '1px solid #4A7C59', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Dokončená
                      </button>
                    )}
                    {booking.status !== BOOKING_STATUS.NO_SHOW && (
                      <button onClick={() => handleStatus(booking, BOOKING_STATUS.NO_SHOW)}
                        style={{ padding: '7px 14px', background: 'transparent', color: '#B07D3A', border: '1px solid #B07D3A', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        No-show
                      </button>
                    )}
                    <button onClick={() => handleStatus(booking, BOOKING_STATUS.CANCELLED)}
                      style={{ padding: '7px 14px', background: 'transparent', color: '#8B3A3A', border: '1px solid #8B3A3A', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Zrušiť
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Bookings;
