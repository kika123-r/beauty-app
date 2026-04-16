import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../services/serviceService';
import { createSlot, getSlots } from '../../services/slotService';
import toast from 'react-hot-toast';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const DAYS = [
  { key: 1, label: 'Pondelok' }, { key: 2, label: 'Utorok' },
  { key: 3, label: 'Streda' },   { key: 4, label: 'Štvrtok' },
  { key: 5, label: 'Piatok' },   { key: 6, label: 'Sobota' },
  { key: 0, label: 'Nedeľa' },
];

const RecurringSlots = () => {
  const { salonId } = useAuth();
  const [services, setServices]     = useState([]);
  const [templates, setTemplates]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [form, setForm] = useState({
    serviceId: '',
    days: [],
    times: ['09:00'],
    weeksAhead: 4,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [sv, tmpl] = await Promise.all([
      getServices(salonId),
      getDocs(collection(db, 'salons', salonId, 'recurringSlots')),
    ]);
    setServices(sv);
    setTemplates(tmpl.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const toggleDay = (key) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(key) ? prev.days.filter(d => d !== key) : [...prev.days, key]
    }));
  };

  const addTime = () => setForm(prev => ({ ...prev, times: [...prev.times, '10:00'] }));
  const removeTime = (i) => setForm(prev => ({ ...prev, times: prev.times.filter((_, idx) => idx !== i) }));
  const updateTime = (i, val) => setForm(prev => ({ ...prev, times: prev.times.map((t, idx) => idx === i ? val : t) }));

  const handleSave = async () => {
    if (!form.serviceId) { toast.error('Vyber službu.'); return; }
    if (form.days.length === 0) { toast.error('Vyber aspoň jeden deň.'); return; }
    if (form.times.length === 0) { toast.error('Pridaj aspoň jeden čas.'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'salons', salonId, 'recurringSlots'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      toast.success('Šablóna uložená!');
      setShowForm(false);
      setForm({ serviceId: '', days: [], times: ['09:00'], weeksAhead: 4 });
      loadData();
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async (template) => {
    setGenerating(true);
    try {
      const existingSlots = await getSlots(salonId);
      const today = new Date();
      let generated = 0;

      for (let week = 0; week < template.weeksAhead; week++) {
        for (const dayKey of template.days) {
          for (const time of template.times) {
            const date = new Date(today);
            const currentDay = date.getDay();
            let daysUntil = dayKey - currentDay;
            if (daysUntil <= 0) daysUntil += 7;
            date.setDate(date.getDate() + daysUntil + (week * 7));
            const dateStr = date.toISOString().split('T')[0];

            const exists = existingSlots.some(s =>
              s.date === dateStr && s.time === time && s.serviceId === template.serviceId
            );

            if (!exists) {
              await createSlot(salonId, { date: dateStr, time, serviceId: template.serviceId, note: 'Opakovaný slot' });
              generated++;
            }
          }
        }
      }
      toast.success(`Vygenerovaných ${generated} nových slotov!`);
    } catch { toast.error('Chyba pri generovaní.'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vymazať šablónu?')) return;
    await deleteDoc(doc(db, 'salons', salonId, 'recurringSlots', id));
    toast.success('Šablóna vymazaná.');
    loadData();
  };

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };
  const inputStyle = { width: '100%', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-faint)', marginBottom: '7px', letterSpacing: '0.12em', textTransform: 'uppercase' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Opakované sloty</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>Nastavte šablóny a automaticky generujte sloty na týždne dopredu.</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              + Nová šablóna
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '24px' }}>Nová šablóna opakovaných slotov</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Služba *</label>
              <select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Vyber službu...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration} min · {s.price} €</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Dni v týždni *</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DAYS.map(day => (
                  <button key={day.key} type="button" onClick={() => toggleDay(day.key)}
                    style={{ padding: '8px 14px', background: form.days.includes(day.key) ? 'var(--primary)' : 'transparent', color: form.days.includes(day.key) ? 'var(--bg-elevated)' : 'var(--text-faint)', border: `1px solid ${form.days.includes(day.key) ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Časy</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.times.map((time, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="time" value={time} onChange={e => updateTime(i, e.target.value)}
                      style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                    {form.times.length > 1 && (
                      <button type="button" onClick={() => removeTime(i)} style={{ padding: '8px 12px', background: 'transparent', color: '#C8A882', border: '1px solid #8B3A3A', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTime} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--primary)', border: '1px dashed #D4C5B0', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'left' }}>
                  + Pridať čas
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Generovať na koľko týždňov dopredu</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[2, 4, 6, 8].map(w => (
                  <button key={w} type="button" onClick={() => setForm({...form, weeksAhead: w})}
                    style={{ padding: '8px 16px', background: form.weeksAhead === w ? 'var(--primary)' : 'transparent', color: form.weeksAhead === w ? 'var(--bg-elevated)' : 'var(--text-faint)', border: `1px solid ${form.weeksAhead === w ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    {w} týždne
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={loading} style={{ padding: '12px 24px', background: loading ? 'var(--text-faint)' : 'var(--primary)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                {loading ? 'Ukladám...' : 'Uložiť šablónu'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Zrušiť</button>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '8px' }}>Žiadne šablóny</p>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Vytvorte šablónu a generujte sloty automaticky.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templates.map(tmpl => {
              const service = services.find(s => s.id === tmpl.serviceId);
              const dayNames = (tmpl.days || []).map(d => DAYS.find(day => day.key === d)?.label).filter(Boolean);
              return (
                <div key={tmpl.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif', marginBottom: '4px' }}>{service?.name || 'Neznáma služba'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px' }}>{dayNames.join(', ')}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(tmpl.times || []).map((t, i) => (
                          <span key={i} style={{ fontSize: '12px', color: 'var(--primary)', background: 'rgba(106,93,82,0.08)', padding: '3px 10px', borderRadius: '8px' }}>{t}</span>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>Generuje na {tmpl.weeksAhead} týždne dopredu</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => handleGenerate(tmpl)} disabled={generating}
                        style={{ padding: '9px 16px', background: generating ? 'var(--text-faint)' : 'var(--text)', color: 'var(--text)', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {generating ? '...' : '⚡ Generovať'}
                      </button>
                      <button onClick={() => handleDelete(tmpl.id)} style={{ padding: '9px 14px', background: 'transparent', color: '#C8A882', border: '1px solid #8B3A3A', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Vymazať</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RecurringSlots;
