import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getSalon, updateSalon } from '../../services/salonService';
import toast from 'react-hot-toast';

const CATEGORIES = ['Kadernícky salón', 'Nechtové štúdio', 'Kozmetický salón', 'Masážne centrum', 'Barbershop', 'Wellness & Spa', 'Tetovanie & Piercing', 'Iné'];
const DAYS = [
  { key: 'mon', label: 'Pondelok' }, { key: 'tue', label: 'Utorok' },
  { key: 'wed', label: 'Streda' },   { key: 'thu', label: 'Štvrtok' },
  { key: 'fri', label: 'Piatok' },   { key: 'sat', label: 'Sobota' },
  { key: 'sun', label: 'Nedeľa' },
];

const DEFAULT_HOURS = {
  mon: { open: '09:00', close: '18:00', closed: false },
  tue: { open: '09:00', close: '18:00', closed: false },
  wed: { open: '09:00', close: '18:00', closed: false },
  thu: { open: '09:00', close: '18:00', closed: false },
  fri: { open: '09:00', close: '18:00', closed: false },
  sat: { open: '09:00', close: '14:00', closed: false },
  sun: { open: '09:00', close: '14:00', closed: true },
};

const SalonSettings = () => {
  const { salonId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    name: '', address: '', phone: '', email: '',
    description: '', category: '', website: '', instagram: '',
    openHours: DEFAULT_HOURS,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const salon = await getSalon(salonId);
      if (salon) {
        setForm({
          name:        salon.name || '',
          address:     salon.address || '',
          phone:       salon.phone || '',
          email:       salon.email || '',
          description: salon.description || '',
          category:    salon.category || '',
          website:     salon.website || '',
          instagram:   salon.instagram || '',
          openHours:   salon.openHours || DEFAULT_HOURS,
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleHours = (day, field, value) => setForm({ ...form, openHours: { ...form.openHours, [day]: { ...form.openHours[day], [field]: value } } });

  const handleSave = async () => {
    if (!form.name || !form.address || !form.phone) { toast.error('Vyplň povinné polia.'); return; }
    setSaving(true);
    try {
      await updateSalon(salonId, form);
      toast.success('Nastavenia uložené!');
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '13px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-faint)', marginBottom: '7px', letterSpacing: '0.12em', textTransform: 'uppercase' };
  const cardStyle  = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };

  if (loading) return <AdminLayout><div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'var(--text-faint)' }}>Načítavam...</p></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Nastavenia salóna</h2>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: '12px 24px', background: saving ? 'var(--text-faint)' : 'var(--text)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
          </button>
        </div>

        {/* Základné info */}
        <div style={cardStyle}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '20px' }}>Základné informácie</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Názov salóna *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Kategória</label>
            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Vyber kategóriu...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Adresa *</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Telefón *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Web</label>
              <input type="url" name="website" placeholder="www.salon.sk" value={form.website} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Instagram</label>
              <input type="text" name="instagram" placeholder="@salon" value={form.instagram} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Popis salóna</label>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
        </div>

        {/* Pracovné hodiny */}
        <div style={cardStyle}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '20px' }}>Pracovné hodiny</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DAYS.map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                <div style={{ width: '80px', fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{label}</div>
                {form.openHours[key]?.closed ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-faint)', flex: 1 }}>Zatvorené</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input type="time" value={form.openHours[key]?.open || '09:00'} onChange={e => handleHours(key, 'open', e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>—</span>
                    <input type="time" value={form.openHours[key]?.close || '18:00'} onChange={e => handleHours(key, 'close', e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif' }} />
                  </div>
                )}
                <button onClick={() => handleHours(key, 'closed', !form.openHours[key]?.closed)} style={{ fontSize: '11px', color: form.openHours[key]?.closed ? '#7A9E7E' : '#C8A882', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {form.openHours[key]?.closed ? 'Otvoriť' : 'Zatvoriť'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '14px 32px', background: saving ? 'var(--text-faint)' : 'var(--text)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalonSettings;
