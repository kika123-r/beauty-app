// src/pages/admin/TimeSlots.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { createSlot, getSlots, deleteSlot, markAsLastMinute } from '../../services/slotService';
import { getServices } from '../../services/serviceService';
import { getSubscribersForService, createLastMinuteNotification } from '../../services/notificationService';
import { SLOT_STATUS } from '../../constants';
import toast from 'react-hot-toast';

const EMPTY_FORM = { date: '', time: '', serviceId: '', note: '' };

const STATUS_LABELS = {
  available:   { label: 'Voľný',       color: 'var(--success)' },
  booked:      { label: 'Rezervovaný', color: 'var(--warning)' },
  last_minute: { label: 'Last Minute', color: 'var(--primary)' },
  blocked:     { label: 'Blokovaný',   color: 'var(--error)' },
};

const TimeSlots = () => {
  const { salonId } = useAuth();
  const [slots, setSlots]       = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [slotsData, servicesData] = await Promise.all([
      getSlots(salonId),
      getServices(salonId),
    ]);
    setSlots(slotsData);
    setServices(servicesData);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.serviceId) {
      toast.error('Vyplň dátum, čas a službu.');
      return;
    }
    setLoading(true);
    try {
      await createSlot(salonId, {
        date: form.date, time: form.time,
        serviceId: form.serviceId, note: form.note,
      });
      toast.success('Slot vytvorený!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadData();
    } catch {
      toast.error('Chyba. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vymazať tento slot?')) return;
    await deleteSlot(salonId, id);
    toast.success('Slot vymazaný.');
    loadData();
  };

  const handleLastMinute = async (slot) => {
    try {
      await markAsLastMinute(salonId, slot.id);

      const service = services.find((s) => s.id === slot.serviceId);
      if (service) {
        const subscribers = await getSubscribersForService(slot.serviceId);
        if (subscribers.length > 0) {
          await createLastMinuteNotification(salonId, slot, service, subscribers);
          toast.success(`Last Minute! Notifikácia odoslaná ${subscribers.length} klientom.`);
        } else {
          toast.success('Označené ako Last Minute. Žiadni subscriberi.');
        }
      }
      loadData();
    } catch (err) {
      toast.error('Chyba. Skús znova.');
    }
  };

  const getServiceName = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? s.name : 'Neznáma služba';
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Časové sloty</h2>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              + Pridať slot
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Nový časový slot</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Dátum *</label>
                  <input
                    type="date" name="date" value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Čas *</label>
                  <input type="time" name="time" value={form.time} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Služba *</label>
                <select name="serviceId" value={form.serviceId} onChange={handleChange}>
                  <option value="">Vyber službu...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.duration} min — {s.price} €</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Poznámka</label>
                <input type="text" name="note" placeholder="napr. Posledný slot dňa" value={form.note} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Ukladám...' : 'Vytvoriť slot'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                  Zrušiť
                </button>
              </div>
            </form>
          </div>
        )}

        {slots.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p>Zatiaľ nemáš žiadne časové sloty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedDates.map((date) => (
              <div key={date}>
                <p style={{
                  fontSize: '11px', fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', marginBottom: '10px',
                }}>
                  {date}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupedSlots[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => {
                      const status = STATUS_LABELS[slot.status] || STATUS_LABELS.available;
                      return (
                        <div key={slot.id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                              {slot.time} — {getServiceName(slot.serviceId)}
                            </p>
                            <span style={{ fontSize: '12px', color: status.color, fontWeight: 500 }}>
                              {status.label}
                            </span>
                            {slot.note && (
                              <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>
                                {slot.note}
                              </p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {slot.status === SLOT_STATUS.AVAILABLE && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleLastMinute(slot)}
                              >
                                Last Minute
                              </button>
                            )}
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(slot.id)}
                            >
                              Vymazať
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default TimeSlots;