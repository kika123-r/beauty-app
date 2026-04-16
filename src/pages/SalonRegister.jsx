import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/auth';
import { getSalonBySlug } from '../services/salonService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const C = { green: '#7A9E7E', brown: '#2D2D2D', cream: '#2D2D2D', pink: '#C8A882', muted: '#C8A882', border: 'rgba(255,244,225,0.1)' };

const SalonRegister = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [salon, setSalon]   = useState(null);
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSalonBySlug(slug).then(s => { if (!s) navigate('/'); else setSalon(s); });
  }, [slug]);

  useEffect(() => {
    if (firebaseUser) navigate(`/s/${slug}/dashboard`);
  }, [firebaseUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Vyplň všetky polia.'); return; }
    if (form.password.length < 6) { setError('Heslo musí mať aspoň 6 znakov.'); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password, role: 'client', salonId: salon.id });
      toast.success('Účet vytvorený!');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Tento email už existuje.');
      else setError('Chyba pri registrácii. Skúste znova.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', fontFamily: 'Jost, sans-serif' }}>
      <style>{`* { box-sizing: border-box; } @media (max-width: 768px) { .reg-panel { display: none !important; } .reg-form-side { padding: 40px 24px !important; } }`}</style>

      {/* Ľavý panel */}
      <div className="reg-panel" style={{ width: '45%', background: C.green, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: `1px solid rgba(244,243,238,0.08)` }} />
        <div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244,243,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: C.cream }}>{salon?.name?.charAt(0) || 'B'}</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', color: C.cream, fontWeight: 400, lineHeight: 1.2, marginBottom: '24px' }}>Začnite svoju beauty cestu</h1>
          <p style={{ fontSize: '14px', color: 'rgba(244,243,238,0.6)', lineHeight: 1.8, maxWidth: '320px' }}>Vytvorte si účet a rezervujte termíny v {salon?.name} kedykoľvek a odkiaľkoľvek.</p>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Online rezervácie 24/7', 'História vašich návštev', 'Last-minute notifikácie', 'Hodnotenia a spätná väzba'].map(benefit => (
              <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(244,243,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', color: C.cream }}>✓</span>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(244,243,238,0.7)' }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(244,243,238,0.3)', letterSpacing: '0.1em' }}>Powered by BeautyTime</p>
      </div>

      {/* Pravá strana */}
      <div className="reg-form-side" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 56px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.green, marginBottom: '12px' }}>Nový účet</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: C.brown, fontWeight: 400, marginBottom: '8px' }}>Zaregistrujte sa</h2>
          <p style={{ fontSize: '13px', color: C.muted, marginBottom: '40px' }}>Rezervujte termíny v {salon?.name}</p>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Meno a priezvisko', key: 'name', type: 'text', placeholder: 'Jana Nováková' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'vas@email.com' },
              { label: 'Heslo', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map((field, i) => (
              <div key={field.key} style={{ marginBottom: i === 2 ? '28px' : '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{field.label}</label>
                <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder}
                  style={{ width: '100%', padding: '14px 18px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor=C.brown} onBlur={e => e.target.style.borderColor=C.border} />
              </div>
            ))}
            {error && <p style={{ fontSize: '13px', color: '#A05050', marginBottom: '16px', padding: '12px 16px', background: 'rgba(160,80,80,0.06)', borderRadius: '8px', border: '1px solid rgba(160,80,80,0.15)' }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '15px', background: loading ? C.muted : C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
              {loading ? 'Vytváram účet...' : 'Vytvoriť účet'}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: C.muted, textAlign: 'center' }}>
              Už máte účet?{' '}
              <span onClick={() => navigate(`/s/${slug}/login`)} style={{ color: C.brown, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Prihláste sa</span>
            </p>
            <p style={{ fontSize: '12px', textAlign: 'center' }}>
              <span onClick={() => navigate(`/s/${slug}`)} style={{ color: C.muted, cursor: 'pointer' }}>← Späť na stránku salóna</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonRegister;
