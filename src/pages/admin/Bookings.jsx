// src/pages/admin/Bookings.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForSalon, cancelBooking } from '../../services/bookingService';
import { getServices } from '../../services/serviceService';
import { getSlots } from '../../services/slotService';
import { updateDocument, bookingsCol, usersCol } from '../../firebase/firestore';
import { getDocuments } from '../../firebase/firestore';
import { BOOKING_STATUS } from '../../constants';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  confirmed: { label: 'Potvrdená', color: 'var(--success)' },
  pending:   { label: 'Čaká',      color: 'var(--warning)' },
  cancelled: { label: 'Zrušená',   color: 'var(--error)' },
  completed: { label: 'Dokončená', color: 'var(--info)' },
  no_show:   { label: 'No-show',   color: 'var(--error)' },
};

const Bookings = () => {
  const { salonId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, servicesData, slotsData, usersData] = await Promise.all([
        getBookingsForSalon(salonId),
        getServices(salonId),
        getSlots(salonId),
        getDocuments(usersCol()),
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
      setSlots(slotsData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? s.name : 'Neznáma služba';
  };

  const getSlotInfo = (slotId) => {
    const s = slots.find((s) => s.id === slotId);
    return s ? `${s.date} o ${s.time}` : '';
  };

  const getClientName = (clientId) => {
    const u = users.find((u) => u.uid === clientId);
    return u ? u.name : clientId?.slice(0, 8) + '...';
  };

  const getClientEmail = (clientId) => {
    const u = users.find((u) => u.uid === clientId);
    return u ? u.email : '';
  };

  const handleStatus = async (booking, status) => {
    try {
      if (status === BOOKING_STATUS.CANCELLED) {
        await cancelBooking(salonId, booking.id, booking.slotId);
      } else {
        await updateDocument(bookingsCol(salonId), booking.id, { status });
      }
      toast.success('Status aktualizovaný!');
      loadData();
    } catch (err) {
      toast.error('Chyba. Skús znova.');
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>

        <h2 style={{ marginBottom: '24px' }}>Rezervácie</h2>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Načítavam...</p>}

        {!loading && bookings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p>Zatiaľ žiadne rezervácie.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((booking) => {
            const status = STATUS_LABELS[booking.status] || STATUS_LABELS.confirmed;
            return (
              <div key={booking.id} className="card card-sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                      {getServiceName(booking.serviceId)}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {getSlotInfo(booking.slotId)}
                    </p>
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {getClientName(booking.clientId)}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {getClientEmail(booking.clientId)}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: status.color, fontWeight: 500, flexShrink: 0, marginLeft: '12px' }}>
                    {status.label}
                  </span>
                </div>

                {booking.status !== BOOKING_STATUS.CANCELLED && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {booking.status !== BOOKING_STATUS.COMPLETED && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleStatus(booking, BOOKING_STATUS.COMPLETED)}
                      >
                        Dokončená
                      </button>
                    )}
                    {booking.status !== BOOKING_STATUS.NO_SHOW && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleStatus(booking, BOOKING_STATUS.NO_SHOW)}
                      >
                        No-show
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatus(booking, BOOKING_STATUS.CANCELLED)}
                    >
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