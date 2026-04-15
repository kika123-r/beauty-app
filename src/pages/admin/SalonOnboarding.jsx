import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createSalon } from '../../services/salonService';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const CATEGORIES = ['Kadernícky salón', 'Nechtové štúdio', 'Kozmetický salón', 'Masážne centrum', 'Barbershop', 'Wellness & Spa', 'Tetovanie & Piercing', 'Iné'];

const SalonOnboarding = () => {
  const { firebaseUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({
    name:        '',
    address:     '',
    phone:       '',
    email:       '',
    description: '',
    category:    '',
    website:     '',
    instagram:   '',
    openHours: {
      mon: { open: '09:00', close: '18:00', closed: false },
      tue: { open: '09:00', close: '18:00', closed: false },
      wed: { open: '09:00', close: '18:00', closed: false },
      thu: { open: '09:00', close: '18:00', closed: false },
      fri: { open: '09:00', close: '18:00', closed: false },
      sat: { open: '09:00', close: '14:00', closed: false },
      sun: { open: '09:00', close: '14:00', closed: true },
    },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleHours = (day, field, value) => {
    setForm({ ...form, openHours: { ...form.openHours, [day]: { ...form.openHours[day], [field]: value } } });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.phone) { toast.error('Vyplň názov, adresu a telefón.'); return; }
    setLoading(true);
    try {
      await createSalon(firebaseUser.uid, form);
      await refreshProfile();
      toast.success('Salón vytvorený!');
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch { toast.error('Chyba pri vytváraní salóna.'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '14px 18px', background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#E8F0F8', outline: 'none', fontFamily: 'Jost, sans-serif', fontWeight: 300, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: '#7691AD', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' };

  const DAYS = [
    { key: 'mon', label: 'Pondelok' }, { key: 'tue', label: 'Utorok' },
    { key: 'wed', label: 'Streda' },   { key: 'thu', label: 'Štvrtok' },
    { key: 'fri', label: 'Piatok' },   { key: 'sat', label: 'Sobota' },
    { key: 'sun', label: 'Nedeľa' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A1F36' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#0A1F36', fontWeight: 300 }}>B</span>
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#E8F0F8', marginBottom: '6px' }}>Vitaj v BeautyTime</h1>
            <p style={{ fontSize: '13px', color: '#7691AD' }}>Nastav svoj salón za pár minút</p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#FF929A' : 'rgba(185,207,221,0.12)', transition: 'background 0.3s' }} />
            ))}
          </div>

          <div style={{ background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(28,28,27,0.06)' }}>

            {/* Step 1 — Základné info */}
            {step === 1 && (
              <>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#E8F0F8', marginBottom: '24px' }}>Základné informácie</p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Názov salóna *</label>
                  <input type="text" name="name" placeholder="napr. Salón Klaudia" value={form.name} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
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
                  <input type="text" name="address" placeholder="napr. Hlavná 12, Bratislava" value={form.address} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Telefón *</label>
                    <input type="tel" name="phone" placeholder="+421 900 123 456" value={form.phone} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" name="email" placeholder="salon@email.com" value={form.email} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                  <div>
                    <label style={labelStyle}>Web</label>
                    <input type="url" name="website" placeholder="www.salon.sk" value={form.website} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Instagram</label>
                    <input type="text" name="instagram" placeholder="@salon_klaudia" value={form.instagram} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                  </div>
                </div>
                <button onClick={() => { if (!form.name || !form.address || !form.phone) { toast.error('Vyplň povinné polia.'); return; } setStep(2); }} style={{ width: '100%', padding: '15px', background: '#FF929A', color: '#0A1F36', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  Pokračovať →
                </button>
              </>
            )}

            {/* Step 2 — Pracovné hodiny */}
            {step === 2 && (
              <>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#E8F0F8', marginBottom: '24px' }}>Pracovné hodiny</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
                  {DAYS.map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#0A1F36', borderRadius: '10px' }}>
                      <div style={{ width: '80px', fontSize: '13px', fontWeight: 500, color: '#E8F0F8', fontFamily: 'Jost, sans-serif' }}>{label}</div>
                      {form.openHours[key].closed ? (
                        <span style={{ fontSize: '12px', color: '#7691AD', flex: 1 }}>Zatvorené</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <input type="time" value={form.openHours[key].open} onChange={e => handleHours(key, 'open', e.target.value)} style={{ padding: '6px 10px', background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '13px', color: '#E8F0F8', outline: 'none', fontFamily: 'Jost, sans-serif' }} />
                          <span style={{ fontSize: '12px', color: '#7691AD' }}>—</span>
                          <input type="time" value={form.openHours[key].close} onChange={e => handleHours(key, 'close', e.target.value)} style={{ padding: '6px 10px', background: '#142F52', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '13px', color: '#E8F0F8', outline: 'none', fontFamily: 'Jost, sans-serif' }} />
                        </div>
                      )}
                      <button onClick={() => handleHours(key, 'closed', !form.openHours[key].closed)} style={{ fontSize: '11px', color: form.openHours[key].closed ? '#6DB88A' : '#FF929A', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {form.openHours[key].closed ? 'Otvoriť' : 'Zatvoriť'}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(1)} style={{ padding: '15px 20px', background: 'transparent', color: '#7691AD', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>← Späť</button>
                  <button onClick={() => setStep(3)} style={{ flex: 1, padding: '15px', background: '#FF929A', color: '#0A1F36', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Pokračovať →</button>
                </div>
              </>
            )}

            {/* Step 3 — Popis a potvrdenie */}
            {step === 3 && (
              <>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#E8F0F8', marginBottom: '24px' }}>Popis salóna</p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Popis (nepovinné)</label>
                  <textarea name="description" placeholder="Krátky popis tvojho salóna — čo ponúkate, vaša filozofia..." value={form.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
                </div>
                <div style={{ background: '#0A1F36', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7691AD', marginBottom: '12px' }}>Súhrn</p>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: '#E8F0F8', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>{form.name}</p>
                  {form.category && <p style={{ fontSize: '12px', color: '#FF929A', marginBottom: '4px' }}>{form.category}</p>}
                  <p style={{ fontSize: '13px', color: '#7691AD', marginBottom: '2px' }}>{form.address}</p>
                  <p style={{ fontSize: '13px', color: '#7691AD' }}>{form.phone}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '15px 20px', background: 'transparent', color: '#7691AD', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>← Späť</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '15px', background: loading ? '#53728A' : '#FF929A', color: '#0A1F36', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
                    {loading ? 'Vytváram...' : 'Vytvoriť salón'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(185,207,221,0.12)' }} />
            <span style={{ fontSize: '10px', color: '#53728A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Premium Beauty</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(185,207,221,0.12)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonOnboarding;
